import tornado.ioloop
import tornado.web
import tornado.httpserver
import tornado.options
import os.path
import sys
reload(sys)
sys.setdefaultencoding("utf-8")

from tornado.options import define, options
define("port", default=8000, help="run on the given port", type=int)

class SecondHandler(tornado.web.RequestHandler):
    def get(self):
        name = self.get_argument("name", None);
        section = self.get_argument("section", None)
        credit_card = self.get_argument("credit_card", None)
        card = self.get_argument("card", None)
        _sum = 0
        for i in range(15, -1, -1) :
        	j = credit_card[i]
        	j = int(j)
        	if (i%2 == 1) :
        		_sum += j
        	else :
        		j = j*2
        		if j < 10 :
        			_sum += j
        		else :
        			_sum += (j % 10)
        			j /= 10
        			_sum += j
        if name=="" or section=="(Select a section)" or credit_card=="" or card=="":
        	string = "You didn't fill out the form completely."
        	self.render("sorry.html", string=string)
        elif (len(credit_card) != 16
        or (card=="Visa" and credit_card[0] != '4')
        or (card=="MasterCard" and credit_card[0] != '5')
        or (_sum%10 != 0)):
        	string = "You didn't provide a valid card number."
        	self.render("sorry.html", string=string)
        else :
        	if os.path.isfile("suckers.txt") is False:
        	    os.mknod("suckers.txt")
        	f = open("suckers.txt", "a+")
        	f.write(name + ";" + section + ";" + credit_card + ";" + card + "\n")
        	f.close()
        	f = open("suckers.txt", "r")
        	suckers = f.readlines()
        	f.close()
        	self.render("sucker.html", name=name, section=section, credit_card=credit_card, card=card, suckers=suckers)

class MainHandler(tornado.web.RequestHandler):
    def  get(self):
        self.render("buyagrade.html")

if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = tornado.web.Application(
        handlers=[(r'/', MainHandler), (r'/buyagrade/', SecondHandler)],
        template_path=os.path.join(os.path.dirname(__file__), "template"),
        static_path=os.path.join(os.path.dirname(__file__), "static")
    )
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()