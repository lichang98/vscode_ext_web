# -*- coding:utf-8 -*-

import os
from flask import Flask,Response,request
from os import path
import socket
from flask.globals import session

from sqlalchemy.sql.expression import true
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.schema import MetaData
app = Flask(__name__)
import sqlalchemy
import json

base_path = path.dirname(path.abspath(__file__))

engine = sqlalchemy.create_engine("sqlite:///{}".format(os.path.join(os.path.dirname(__file__), "..", "..", "model_pool.db")))
metadata = sqlalchemy.MetaData()

def isUse(ip, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.connect((ip, int(port)))
        sock.shutdown(2)
        return True
    except Exception as e:
        return False

@app.route("/img/<imgres>")
def getImg(imgres):
    print("path = "+path.join(base_path, imgres))
    with open(path.join(base_path, "layer_vis_imgs",imgres),"rb") as f:
        img = f.read()
        return Response(img, mimetype="image/png")

@app.route("/snn_imgs/<dir_name>/<imgres>")
def getSnnTestImg(dir_name, imgres):
    with open(path.join(base_path, "..", "darwin2sim", "model_out", dir_name,"bin_darwin_out","inputs", imgres), "rb") as f:
        img = f.read()
        return Response(img, mimetype="image/png")

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown', methods=['POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@app.route('/js/<js_file>')
def get_js(js_file):
    with open(path.join(base_path, "..", "..", "src", "resources","js_css","js",js_file), "r",encoding="utf-8") as f:
        content = f.read()
        return Response(content, mimetype="text/javascript")

@app.route("/css/<css_file>")
def get_css(css_file):
    with open(path.join(base_path, "..", "..", "src", "resources","js_css","css",css_file), "r",encoding="utf-8") as f:
        content = f.read()
        return Response(content, mimetype="text/css")

@app.route("/ping", methods=['GET'])
def ping():
    return Response()

class SNNModelTable(declarative_base(metadata=metadata)):
    __tablename__ = "snn_model"
    id=sqlalchemy.Column("id",sqlalchemy.Integer, primary_key=true,autoincrement=True)
    snn_name = sqlalchemy.Column("snn_name",sqlalchemy.String(50))
    darwinlang_files = sqlalchemy.Column("darwinlang_files",sqlalchemy.String(1000))
    darwin_bin_files = sqlalchemy.Column("darwin_bin_files", sqlalchemy.String(1000))

    def __repr__(self):
        return "[SNN Row: id={}, snn_name={}, darwinlang_files={}, darwin_bin_files={}]".format(self.id, self.snn_name, self.darwinlang_files, self.darwin_bin_files)

# curl -X POST -H "Content-Type: text/json" -d 
# "{\"snn_name\": \"non test snn\", \"darwinlang_files\": \"non darlang files\", \"darwin_bin_files\": \"non bin files\"}" http://localhost:6003/db/post_snn_model
@app.route("/db/post_snn_model", methods=['POST'])
def post_snn_model():
    data = request.get_data().decode("utf-8")
    print("receive post data={}".format(data))
    data = json.loads(data)
    sess = sqlalchemy.orm.sessionmaker(bind=engine)()
    new_snn = SNNModelTable(snn_name=data["snn_name"], darwinlang_files=data["darwinlang_files"], darwin_bin_files=data["darwin_bin_files"])
    sess.add(new_snn)
    sess.commit()
    return Response()


# curl -X GET -H "Content-Type: text/json" http://localhost:6003/db/query_snn_model/ -d "non test snn"
@app.route("/db/query_snn_model/", methods=['GET'])
def query_model_by_name():
    snn_name = request.get_data().decode("utf-8")
    sess = sqlalchemy.orm.sessionmaker(bind=engine)()
    print("query target snn name={}".format(snn_name))
    query_res = sess.query(SNNModelTable).filter(SNNModelTable.snn_name == snn_name)
    print("query_res={}".format(query_res))
    resp_res = []
    for row in query_res:
        resp_res.append({
            "snn_name": row.snn_name,
            "darwinlang_files": row.darwinlang_files,
            "darwin_bin_files": row.darwin_bin_files
        })
    return Response(json.dumps(resp_res), mimetype="text/javascript")


if __name__ == "__main__":
    if not isUse("127.0.0.1",6003):
        app.run(host="0.0.0.0", port=6003)
        