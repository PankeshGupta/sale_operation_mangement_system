
from random import randint
import datetime
from modules.auth import is_authorized
# from models.base import admin_collection
from models.base import engineer_collection
from flask import jsonify
from modules.cookies import make_cookie
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2

def otp_generator():
	otp = randint(1000,9999)
	return otp

def verify_user_name(phone):
	
	# user_name_result = is_authorized(phone=phone)

	# print(user_name_result)
	user_name_result = engineer_collection.find_one({"phone": phone,"is_active":True},{"_id": 0})
	print(user_name_result)	
	if user_name_result:
		# this means that the email has been found and now the otp can be generated
		otp = otp_generator()
		result_obj = engineer_collection.update_one({'phone' : phone},
												 {"$set"  : 
												 			{"otp" : otp, "updated_at":str(datetime.datetime.now()) }})
		phone_no = str(phone)
		if phone_no[0] == "+":
		    phone_no=phone_no[3:]
		phone_no=str(phone_no)
		otp=str(otp)
	    # url += str(phone_no)
	    # url += "&message=" + msg + "&priority=1&dnd=1&unicode=0"
		
		
		# url1="http://kit19.com/ComposeSMS.aspx?username=raghav643283&password=7924&sender=SNAPOW&to="+phone_no+"&message=Welcome%20to%20OMS%20SERVICE%20Your%20OTP%20is%20"+otp+"&priority=1&dnd=1&unicode=0"
		# req = urllib2.urlopen(url1)

		resp = {"message":"phone number found","otp": otp }
		return jsonify(resp), 200 
	else:
		resp = {"message":"phone number not found: please contact administrator"}
		return jsonify(resp), 404


def verify_user_name_otp(user_otp,phone):
	
	user_name_result = engineer_collection.find_one({"phone": phone},{"_id": 0})
	# "is_active":True
	if user_name_result:
		otp       = user_name_result.get("otp")
		user_id   = user_name_result.get("id")
		user_name = user_name_result.get("name") 
		
		if int(user_otp) == otp :
			print("otp is correct")
			user_id,secret_hash = make_cookie(user_id)
			resp = {"message": "user is authorized","phone": phone,"token": secret_hash,"user_id" : user_id,"user_name":user_name} 
			
			return jsonify(resp), 200

		else:
			resp = {"message": "incorrect otp"}
			return jsonify(resp), 404
	else:
		resp = {"message": "Phone number not found: please contact administrator "}
		return jsonify(resp), 404

	print(user_otp)
	
