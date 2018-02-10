from modules.id import generate_id
# from models.base import admin_collection
from models.base import engineer_collection

def make_cookie(user_id):
	secret_hash = generate_id()
	user_id = user_id
	result_obj = engineer_collection.update_one({"id" : user_id,"is_admin":True },
												 {"$set"  : 
												 			{"secret_hash" : secret_hash }})
	return user_id,secret_hash


def verify_cookie(user_id,secret_hash):
	user = engineer_collection.find_one({"id" : user_id,"secret_hash":secret_hash,"is_admin":True},{"_id": 0})
	

	if user :
		return True
	else:
		return False
