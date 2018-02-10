from flask import Blueprint, request, jsonify
from models.base import engineer_collection
from modules.otp import verify_user_name,verify_user_name_otp
from modules.id import generate_unique_id
import datetime
from modules.cookies import verify_cookie

login_controller = Blueprint('login_controller',__name__)



@login_controller.route('/login_test')
def login_test():
	return 'inside login controller'


# Expected:
# user_name: post4pakesh@gmail.com

# @login_controller.route('/create_user', methods= ['POST'])
# def create():
# 	params = request.json
# 	user_name = params['user_name']
# 	result = admin_collection.insert_one({"id": generate_unique_id(admin_collection) ,"email": user_name, "created_at":str(datetime.datetime.now())})


# |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
# | --------- Expected paramas  ------------------ |
# | "user_name" : "pankesh@gmail.com"			   |
# | ---------- Expected output ------------------- |
# | = on success                                   |
# | "message" : "user verfied"			   		   |
# | = on failure                                   |  
# | "message" : "user not verfied"			   	   |
# | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |


@login_controller.route('/login/verify_username', methods= ['POST'])
def verify_username():
	params 		    = request.json
	phone_param = params.get('phone')
	if phone_param:
		phone_number 	= str(phone_param)
	
	else:
		user_data = params.get("user_data")
		phone_number 	= str(user_data.get('phone'))
	
	user_type = params.get("type")
	
	print("----------------------")
	print(params)
	

	if user_type == 'admin':
		engineer_obj = engineer_collection.find_one({"phone":phone_number,"is_admin":True},{"_id":0})

		print("inside admin")
		print(engineer_obj)

		if engineer_obj:
			resp = verify_user_name(phone_number)
			return resp
		else:

			resp = {"message":'Unauthorized access : Engineers are not allowed to log-in from admin panel'}
			return jsonify(resp), 404

	else:

		user_type = "engineer"
		resp = verify_user_name(phone_number)
		return resp
	

	


@login_controller.route('/login/verify_otp', methods= ['POST'])
def verify_otp():
	params 		   = request.json

	user_type = params.get('user_type')

	phone_params = params.get('phone')
	user_otp = params.get('otp')

	print("=========== otp params =========")
	print(params)
	
	if phone_params and user_otp:
		phone = str(phone_params)
		user_type = 'non_admin'
	else:
		user_data = params.get("user_data")
		phone 	= str(user_data.get('phone'))

	
		user_otp 	   = user_data.get('otp')
		

	if user_otp:
		if user_type == 'admin':
			engineer_obj = engineer_collection.find_one({"phone":phone,"is_admin":True},{"_id":0})
			if engineer_obj:
				resp = verify_user_name_otp(user_otp,phone)
	
				return resp
			else:
				resp = {"message":'Unauthorized access'}
				return jsonify(resp), 404

		else:
			user_type = "engineer"	
			print("---------- engineer -------------")	
			resp = verify_user_name_otp(user_otp,phone)
	
			return resp
	else:

		resp = {"message":'OTP is mandatory'}
		return jsonify(resp), 404





# | ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
# | --------- Expected paramas  ------------------ |
# | "user_name" : "pankesh@gmail.com"			   |
# | "otp" : 1234			   					   |
# | ---------- Expected output ------------------- |
# | = on success			   					   |
# | "message" : "user authenticated "
# |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |

