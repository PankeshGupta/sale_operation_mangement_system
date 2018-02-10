from flask import Blueprint, request, jsonify
from models.base import engineer_collection, device_token, task_collection,location_collection
import datetime
from modules.id import generate_unique_id
from modules.id import generate_id

engineer_controller = Blueprint('engineer_controller',__name__)



@engineer_controller.route('/engineer_test')
def engineer():
	return 'inside enginneer controller'

@engineer_controller.route('/engineer/admin/add/edit',methods =['POST'])
def admin_engineer():
	params 		= request.json
	engineer_id = params["engineer_id"]
	name 		= params["name"]
	phone       = str(params["phone"])

	if engineer_id == 0 :
		# it means that we need to create enginneer
		# now we will check for duplicate phone number in the list
		existing_phone = engineer_collection.find_one({"phone": phone},{"_id":0})
		print(existing_phone)

		if existing_phone:
			resp = {"message": "Phone number already exists"}
			return jsonify(resp), 404
		else:
			result = engineer_collection.insert_one({
				"id"         : generate_unique_id(engineer_collection),
				"name"	     : name,
				"phone"	     : phone,
				"is_admin"	 : True,
				"is_active"	 : True,
				"created_at" : str(datetime.datetime.now())
			})
			resp = {"message": "enginner inserted sucessfully"}
			return jsonify(resp), 200


	else :
		engineer_obj = engineer_collection.find_one({'id' : engineer_id},{"_id": 0})
		if engineer_obj:
			result_obj = engineer_collection.update_one({'id' : engineer_id},
												 {"$set"  : 
												 			{"name" : name ,"phone": phone, "updated_at":str(datetime.datetime.now()), "audit_log":engineer_obj }})			

			resp = {"message": "engineer updated sucessfully"}
			return jsonify(resp), 200

		else:
			resp = {"message": "engineer not found"} 
			return jsonify(resp), 404



@engineer_controller.route('/engineer/save/device/token',methods = ['POST'])
def add_token():

	params  	 = request.json

	user_id      = params['user_id']
	token        = params['token']
	exists_or_not = device_token.remove({"userid":user_id})
	#it means that we need to create enginneer
	
	result = device_token.insert({"userid":user_id, "token": token})


	resp = {"message": "token inserted sucessfully"}
	return jsonify(resp), 200

@engineer_controller.route('/engineer/deactivate_engineer',methods = ['POST'])
def deactivate_engineer_task():
	 params = request.json
	 engineer_id       = params.get('engineer_id')
	 deactivate_status = params.get('deactivate_status')
	 cookies = request.cookies
	 user_id = cookies.get('user_id')
	 token = cookies.get('token')

	 admin_obj = engineer_collection.find_one({"id":user_id,"secret_hash":token,"is_admin":True},{"_id":0})

	 if admin_obj:
	 	if deactivate_status:
	 		task_obj = task_collection.find({"assigned_user_id":engineer_id,"task_status":{"$in":['completed','assigned']}},{"_id":0})
	 		if task_obj.count() >0:

	 			for task in task_obj:
	 				task_collection.update_one({'id' : task.get('id')},
					{"$set"  : 
					{"task_status":"unassigned" ,"updated_at":str(datetime.datetime.now())}})

	 			result_obj = engineer_collection.update_one({'id' : engineer_id},
					{"$set"  : 
					{"is_active": False,"updated_at":str(datetime.datetime.now())}})
	 			resp = {"message":"Engineer deaactivated, {} marked as unassigned .. ".format(task_obj.count())}
	 			return jsonify(resp), 200
	 			
	 		else:
	 			result_obj = engineer_collection.update_one({'id' : engineer_id},
					{"$set"  : 
					{"is_active": False,"updated_at":str(datetime.datetime.now())}})
	 			resp = {"message": "Engineer deactivated"}
	 			return jsonify(resp), 200
	 	
	 	else:
	 		task_obj = task_collection.find({"assigned_user_id":engineer_id,"task_status":{"$in":['completed','assigned']}},{"_id":0})
	 		print("----- tasks found ----{}".format(task_obj.count()))
	 		if task_obj:

	 			tasks = [t for t in task_obj]
	 			resp = {"message":"tasks found","tasks":tasks,"tasks_found":True}
	 			return jsonify(resp), 200
	 		else:
	 			resp = {"message":"tasks found","tasks_found":False}
	 			return jsonify(resp), 200
	 		

	 else:
	 	resp = {"message":"Invalid request"}
	 	return jsonify(resp), 404





# crud for engineer 
@engineer_controller.route('/engineer/list_all',methods = ['POST'])
def get():
	params  	 = request.json

	
	offset 		 = params['offset']

	# if is_active == True :
	list_cursor   = engineer_collection.find({"is_admin":False},{"_id": 0}).skip(offset).limit(100)
	engineer_list = [e for e in list_cursor] 
	resp = {"engineers": engineer_list}
	return jsonify(resp), 200



@engineer_controller.route('/engineer/list',methods = ['POST'])
def get_all():
	params  	 = request.json
	# is_active    = params.get("is_active") 
	
	# user_id 	 = params['user_id']
	# secret_hash  = params['secret_hash']
	
	offset 		 = params['offset']

	# if is_active == True :
	list_cursor   = engineer_collection.find({"is_admin":False,"is_active": True},{"_id": 0}).skip(offset).limit(100)
	engineer_list = [e for e in list_cursor] 
	resp = {"engineers": engineer_list}
	return jsonify(resp), 200



# expected :
# engineer_id : -1(create) or sdsd12kmkk23kkk(update)
# name        : pankesh
# phone		  : 9988811061

@engineer_controller.route('/engineer/add/edit',methods = ['POST'])
def update():
	params 		= request.json
	engineer_id = params["engineer_id"]
	name 		= params["name"]
	phone       = str(params["phone"])
	is_active   = params.get("is_active")
	

	if is_active == False:
		pass
	else:
		is_active = True

	
	if engineer_id == 0 :
		# it means that we need to create enginneer
		# we will check for duplicate phone
		existing_phone = engineer_collection.find_one({"phone":phone},{"_id":0})
		if existing_phone:
			resp = {"message": "Phone number already exists"}
			return jsonify(resp),404
		else:
			result = engineer_collection.insert_one({
				"id"         : generate_unique_id(engineer_collection),
				"name"	     : name,
				"phone"	     : phone,
				"is_admin"	 : False,
				"is_active"  : True,
				"created_at" : str(datetime.datetime.now()),
				"audit_log"	 : list()
				})
			resp = {"message": "enginner inserted sucessfully"}
			return jsonify(resp), 200
	else :
		
		engineer_obj = engineer_collection.find_one({'id' : engineer_id},{"_id": 0})


		if engineer_obj:
			if phone == engineer_obj.get('phone'):				
				result_obj = engineer_collection.update_one({'id' : engineer_id},
					{"$set"  : 
					{"name" : name ,"phone": phone,"is_active": is_active,"updated_at":str(datetime.datetime.now())}})			

				resp = {"message": "engineer updated sucessfully"}
				return jsonify(resp), 200
			else:
				existing_phone = engineer_collection.find_one({"phone":phone},{"_id":0})
				if existing_phone:
					resp = {"message": "Phone number already exists"}
					return jsonify(resp),404
				else:
					result_obj = engineer_collection.update_one({'id' : engineer_id},
					{"$set"  : 
					{"name" : name ,"phone": phone,"is_active": is_active,"updated_at":str(datetime.datetime.now())}})			

					resp = {"message": "engineer updated sucessfully"}
					return jsonify(resp), 200	
		else:
			resp = {"message": "engineer not found"} 
			return jsonify(resp), 404



@engineer_controller.route('/engineer/delete',methods = ['POST'])
def delete():
	params = request.json
	engineer_id = params["id"]
	engineer_collection.delete_one({"id":  engineer_id})


@engineer_controller.route('/engineer/task/count/datetime',methods=["POST"])
def task_datetime():
	result = []
	param = {}
	param = request.json
	if param is not None:
		if "schedule_date" not in param:
			param = {}
			param['schedule_date'] = datetime.datetime.today().strftime('%d-%m-%Y')

	if param is None:
		param = {}
		param['schedule_date'] = datetime.datetime.today().strftime('%d-%m-%Y')

	engineer_obj  = engineer_collection.find({"is_admin":False,"is_active": True},{"id":1,"name":1, "phone":1,"_id":0})
	
	for e in engineer_obj:
		result_obj = {}
		todays_tasks = task_collection.find({"schedule_date": param['schedule_date'], "task_status":{"$ne":"assigned"}, "assigned_user_id": e.get("id")}).count()
		result_obj['todays_tasks'] = todays_tasks

		todays_tasks = task_collection.find({"schedule_date": param['schedule_date'], "assigned_user_id": e.get("id")}).count()
		result_obj['todays_total_tasks'] = todays_tasks

		total_tasks = task_collection.find({"assigned_user_id": e.get("id"), "task_status":"assigned"}).count()
		result_obj['total_tasks'] = total_tasks
		
		location_obj = list(location_collection.find({"engineer_id": e.get("id")},{"_id":0}).sort([("created_at",-1)]).limit(1))

		e["tasks_info"] = result_obj
		e["name"] = e.get("name")
		e["phone"] = e.get("phone")
		
		if len(location_obj)!=0:
			e['location'] = {}
			e["location"] = location_obj[0]
			
			created_at_time = datetime.datetime.strptime(location_obj[0].get('created_at'), "%Y-%m-%d %H:%M:%S.%f")

			dif = datetime.datetime.now() - created_at_time

			if dif.total_seconds() > 900:
				e["location_status"] = "inactive"
			else:
				e["location_status"] = "active"
			# print(datetime.datetime.now())-location_obj[0].get('created_at'))
		else:
			 e["location_status"] = "non_active"
			 e['location'] = {"created_at":"2016-11-22 20:40:55.136679"}

		result.append(e)


		
	resp = {"message": "sucessfully got data", "list": result}
	
	return jsonify(resp), 200


