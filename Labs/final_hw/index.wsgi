#coding=utf-8
import tornado.web
import tornado.ioloop
import tornado.web
import os
import tornado.httpserver
import tornado.options
import string
import sys
import urllib
import sae.const
import MySQLdb
from sae.storage import Bucket
from sae.ext.storage import monkey
monkey.patch_all()
reload(sys)
sys.setdefaultencoding("utf-8")
from tornado.httpclient import AsyncHTTPClient

#获取数据库连接
def get_conn():
  conn=MySQLdb.connect(host=sae.const.MYSQL_HOST,user=sae.const.MYSQL_USER,passwd=sae.const.MYSQL_PASS,db=sae.const.MYSQL_DB,port=int(sae.const.MYSQL_PORT),charset='utf8')
  return conn
#执行SQL查询，结果以list(dict...)的形式返回
def query_for_list(query,*param):
  try:
    conn=get_conn()
    try:
      cur=conn.cursor(cursorclass=MySQLdb.cursors.DictCursor)
      cur.execute(query, param)
      result = cur.fetchall()
      return result
    finally:
      cur.close()
      conn.close()
  except MySQLdb.Error as e:
    print( "Mysql Error Occured! %s" % (e))
    return None
#获取单行型查询结果
def query_for_one(query,*param):
  try:
    conn=get_conn()
    try:
      cur=conn.cursor()
      cur.execute(query, param)
      result = cur.fetchone()
      return result
    finally:
      cur.close()
      conn.close()
  except MySQLdb.Error as e:
    print( "Mysql Error Occured! %s" % (e))
    return None
#执行批量查询
def execute_many(query,param_list):
  conn=get_conn()
  try:
    cur=conn.cursor()
    res = cur.executemany(query, param_list)
    conn.commit()
    return res
  except Exception as e:
    conn.rollback()
    raise e
  finally:
    cur.close()
    conn.close()
  return -1
#执行SQL更新操作（如update,insert,delete等）
def execute_sql(query,*param):
  conn=get_conn()
  try:
    cur=conn.cursor()
    cnt = cur.execute(query, param)
    conn.commit()
    return cnt
  except Exception as e:
    conn.rollback()
    raise e
  finally:
    cur.close()
    conn.close()
#执行insert，同时返回新增数据的ID，适合使用auto_increment字段的数据表
def execute_insert_get_id(query,*param):
  try:
    conn=get_conn()
    try:
      cur=conn.cursor()
      cur.execute(query, param)
      insert_id = conn.insert_id()
      conn.commit()
      return insert_id;
    except Exception as e:
      conn.rollback()
      raise e
    finally:
      cur.close()
      conn.close()
  except MySQLdb.Error as e:
    print( "Mysql Error Occured! %s" % (e))
    return -1
#以dict的形式执行数据插入操作,table_name为表名，dict为{字段:值}字典
def insert_by_dict(table_name,dict):
  keys = ''
  values = list()
  perc_sign = ''
  cnt = 0
  for key in dict:
    if cnt > 0:
      perc_sign += ','
      keys += ','
    cnt += 1
    perc_sign += '%s'
    keys += key
    values.append(dict[key])
  sql = 'insert into ' + table_name + '(' + keys + ') values(' + perc_sign + ')'
  return execute_sql(sql,*values)

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("username")

class MainHandler(BaseHandler):
    def get(self):
        self.render("dictionary.html")

class SecondHandler(BaseHandler):
    def post(self):
        if not self.current_user:
            self.write("You are not logged in!")
            return
        uri = self.request.body
        mydict = {}
        for i in uri.split('&'):
            data = i.split('=')
            data[1] = urllib.unquote(data[1]).decode('utf-8', 'ignore')
            mydict[data[0]]=data[1]
        s = ""
        name = tornado.escape.xhtml_escape(self.current_user)
#        bucket = Bucket('yihan')
#        s = bucket.get_object_contents(name + "_dictionary.txt")
        if (os.path.isfile("s/yihan/" + name + "_dictionary.txt")):
            f = open("/s/yihan/" + name + "_dictionary.txt")
            s = f.read()
            f.close()
        s = s + mydict["English"] + ":" + mydict["Chinese"] + "\n"
        f = open("/s/yihan/" + name + "_dictionary.txt", "w")
        f.write(s)
        self.write("Insert successfully!")
        return

class RegisterHandler(BaseHandler):
    def post(self):
        uri = self.request.body
        mydict = {}
        for i in uri.split('&'):
            data = i.split('=')
            data[1] = urllib.unquote(data[1]).decode('utf-8', 'ignore')
            mydict[data[0]]=data[1]
        f = open('/s/yihan/users.txt')
        s = f.read()
        flag = 1
        for i in s.split('\n'):
            data = i.split(':')
            if data[0] == mydict["username"]:
                flag = 0
                break
        f.close()
        if flag == 1:
            f = open('/s/yihan/users.txt', 'w')
            s += mydict["username"] + ":" + mydict["password"] + "\n"
            f.write(s)
            f.close()
#            f = open("/s/yihan/" + mydict["username"] + "_dictionary.txt", "w")
#            f.close()
            self.write("Register successfully!")
        else:
            self.write("Register failed!")
        return

class LogonHandler(BaseHandler):
    def post(self):
        uri = self.request.body
        mydict = {}
        for i in uri.split('&'):
            data = i.split('=')
            data[1] = urllib.unquote(data[1]).decode('utf-8', 'ignore')
            mydict[data[0]]=data[1]
        f = open('/s/yihan/users.txt')
        s = f.read()
        flag = 0
        for i in s.split('\n'):
            data = i.split(':')
            if (data[0] == mydict["username"]) and (data[1] == mydict["password"]):
                flag = 1
                break
        f.close()
        if flag == 1:
            self.write("Logon successfully!\n1")
            self.set_secure_cookie("username", mydict["username"])
        else:
            self.write("Logon failed!\n0")
        return

class LogoutHandler(BaseHandler):
    def post(self):
        name = tornado.escape.xhtml_escape(self.current_user)
        if name == "":
            self.write("You are not logged in!")
        else:
            self.set_secure_cookie("username", "")
            self.write(name + " has logged out successfully!")
        return

class CollectHandler(BaseHandler):
    def get(self):
        name = tornado.escape.xhtml_escape(self.current_user)
        query1 = """SELECT English, Chinese FROM dict WHERE name=("%s")"""
        list1 = query_for_list(query1 % (name))
        string = ""
        k = 0
        list2 = list(list1)
        while k < len(list2):
          string += (dict(list2[k])["English"]+":  "+dict(list2[k])["Chinese"]+"\n")
          k += 1
        self.write(string)
        return

class Collect2Handler(BaseHandler):
    def post(self):
        name = tornado.escape.xhtml_escape(self.current_user)
        flag = self.get_argument("flag")
        value = self.get_argument("value").decode('utf-8', 'replace')
        value = value.replace(' ', '')
        s1 = value.split(":")
        if flag == "1":
            query1 = """INSERT INTO dict (name, Chinese, English) VALUES ("%s", "%s", "%s")"""
            execute_sql(query1 % (name, s1[1], s1[0]))
        self.write("Collect successfully!")
        return

settings = {
    "debug": True,
    "cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
    "login_url": "/logon",
}

# application should be an instance of `tornado.web.Application`,
# and don't wrap it with `sae.create_wsgi_app`
application = tornado.web.Application(handlers=[(r'/', MainHandler), (r'/insert', SecondHandler),
    (r'/register', RegisterHandler), (r'/logon', LogonHandler), (r'/logout', LogoutHandler),
    (r'/collection', CollectHandler), (r'/collect2', Collect2Handler)],
        template_path=os.path.join(os.path.dirname(__file__), "template"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
         **settings)