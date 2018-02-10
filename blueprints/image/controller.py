from flask import Blueprint, request, jsonify, send_from_directory
from models.base import image_collection
import datetime
import time
import os
from modules.id import generate_id, generate_unique_id
from werkzeug import secure_filename
from modules.cookies import verify_cookie

image_controller = Blueprint('image_controller',__name__)
UPLOAD_FOLDER = '/static/images/'
ALLOWED_EXTENSIONS = set(['png','jpg', 'jpeg', 'gif','PNG','JPG', 'JPEG', 'GIF'])


@image_controller.route('/image_test')
def image_test():
	print(request)
	return "hello"



def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@image_controller.route('/upload/image',methods = ['GET', 'POST'])
def upload_file():
	result = {}
	Createdatetime= int(time.time())
	Updatedatetime=Createdatetime
	uid = int(time.time())
	file = request.files['file[0]']
	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		ext = file.filename.rsplit('.', 1)[1]
		filename = str(uid) + "." + ext
		# result['token'] = filename
		picname = filename
		print(filename)
		file.save(os.path.join("static/image/", filename))
		image_collection.insert({"image_id": uid, "filename": filename, "path": "static/image/"})
		message={'status':200, 'message':'Image successfully uploaded',"picid":uid, "picname":filename}
		return jsonify(message)

@image_controller.route('/upload/mobile',methods = ['GET', 'POST'])
def upload_file_mobile():
	result = {}
	Createdatetime= int(time.time())
	Updatedatetime=Createdatetime
	uid = int(time.time())
	file = request.files['file']
	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		ext = file.filename.rsplit('.', 1)[1]
		filename = str(uid) + "." + ext
		# result['token'] = filename
		picname = filename
		print(filename)
		file.save(os.path.join("static/image/", filename))
		image_collection.insert({"image_id": uid, "filename": filename, "path": "static/image/"})
		message={'status':200, 'message':'Image successfully uploaded',"picid":uid, "picname":filename}
		return jsonify(message)