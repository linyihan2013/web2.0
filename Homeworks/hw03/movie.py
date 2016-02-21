# -*- coding: utf-8 -*- 
import tornado.ioloop
import tornado.web
import os.path
import tornado.httpserver
import tornado.options
import string

from tornado.options import define, options
define("port", default=8000, help="run on the given port", type=int)
 
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        film=self.get_argument('film','None')
        info=open("static/" + film + "/info.txt")
        str_list = []
        tmp = info.readline()
        i = 0
        while  tmp:
                    if i < 3:
                        tmp = tmp[:-1]
                    str_list.append(tmp)
                    tmp = info.readline()
                    i = i + 1
        info.close()
        info = open("static/" + film + "/generaloverview.txt")
        des = info.readline()
        des_list = []
        while des:
            des = des.split(':')
            des_list.append(des)
            des = info.readline()
        info.close()
        review_list = os.listdir("static/" + film)
        review_list1 = []
        tmp = []
        for i in review_list:
            if i[:6] == "review" and i[-3:] == "txt":
                info = open("static/" + film + "/" + i)
                tmp = info.readlines()
                review_list1.append(tmp)
                info.close()
        self.render("movie.html", film = film, str_list = str_list, des_list = des_list, review_list = review_list1)
 
if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[(r'/', MainHandler)],
        template_path=os.path.join(os.path.dirname(__file__), "template"),
        static_path=os.path.join(os.path.dirname(__file__), "static")
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()