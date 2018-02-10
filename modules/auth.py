from flask import jsonify
from models.base import engineer_collection




def is_authorized(engineer_id=None,token=None, admin=False,phone=None):
	if token and engineer_id and admin :
		engineer_obj = engineer_collection.find_one({"id": user_id,"is_active":True,"secret_hash": token},{"_id": 0})

		if engineer_obj:
			return True
		else :
			return False
	elif phone:
		engineer_obj = engineer_collection.find_one({"phone": phone,"is_active":True},{"_id": 0})

		if engineer_obj:
			return True
		else :
			return False
	else:
		engineer_obj = engineer_collection.find_one({"id": user_id,"is_active":True},{"_id": 0})

		if engineer_obj:
			return True
		else :
			return False

# this method is specially made for task controller so as to store the logs with username 
# input  :  { "user_id","secret_hash"}
# output :  { "user_name": NONE(if user is invalid)/ "pankesh" (if found)}

def check_user_auth(user_id,secret_hash):
	pass
	# user_obj = engineer_collection.find_one({"id": user_id,"secret_hash"},{"_id":0})
	
	# return user_obj
	
