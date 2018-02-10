from flask import Blueprint, request, jsonify
from models.base import task_collection
from models.base import engineer_collection, comment_collection, device_token, last_read_comments, notification_list
import datetime
from datetime import timedelta
from modules.id import generate_id, generate_unique_id
from modules.audit import create_audit_log
from pyfcm import FCMNotification
try:
    import urllib.request as urllib2
except ImportError:
    import urllib2

push_service = FCMNotification(api_key="AAAAkiUf4Ng:APA91bEl8DmLYRayKf9Qr-DlnluNMzg5bkfyG3YkG7g308tis24Hro0EAHvDUmN3TZILiPRAlvm8N4mZqnDAs3Qt_0k5kS7imXmHBbdMF7XdiF4DblvoucncRwcXnjpaHwEqwtPHCHf8")

from modules.auth import check_user_auth

# from modules.cookies import task_collection

task_controller = Blueprint('task_controller',__name__)

STATUS = ("assigned","unassigned","completed","verified")


@task_controller.route('/task_test')
def task():
	return 'inside task controller'



@task_controller.route('/new/comment',methods = ['POST'])
def new_comment():
	params  	 = request.json
	

	engineer_id 	 = params['enginneer_id']

	is_active= engineer_collection.find({"id":engineer_id, "is_active":True}).count()

	if(is_active == 0):
		return jsonify({"message" : "Deactivated"}), 401

	tasks_cursor     =  task_collection.find({"assigned_user_id": engineer_id, "task_status":"assigned"},{"_id":0, "audit_log":0})
	update_date_time = datetime.datetime.now()
	tasks            = []
	if tasks_cursor.count()!=0:

		for task in tasks_cursor:
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			get_last_read_datetime   = last_read_comments.find_one({"id": engineer_id, "task_id": task['id']})
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				task['unread_comment'] = unread_comment

			else:
				task['unread_comment'] = total_comment

			task['total_comments'] = total_comment
			tasks.append(task)

			last_read_comments.update({"id": engineer_id, "task_id": task['id']},{"$set":{"last_read_datetetime":str(datetime.datetime.now())}})
			
		return jsonify({"message" : "tasks found", "tasks" : tasks}), 200
	else :
		notificaion_list_to_show = []
		return jsonify({"message" : "tasks found", "tasks" : tasks}), 200


@task_controller.route('/new/comment/admin',methods = ['POST'])
def admin_new_comment():
	params  	 = request.json
	# user_id 	 = params['user_id']
	# secret_hash  = params['secret_hash']
	print("--------params-----------")
	print(params)

	engineer_id  = params.get('enginneer_id')

	update_date_time = str(datetime.datetime.now())
	get_last_read_datetime  = engineer_collection.find_one({"id": engineer_id},{'_id':0})
	print("----------------- get_last_read_datetime ------------------")
	print(get_last_read_datetime)
	
	last_read_datetime = update_date_time
	if "last_notification_datetetime" in get_last_read_datetime:

		last_read_datetime = get_last_read_datetime['last_notification_datetetime']
	
	abc = engineer_collection.update({"id": engineer_id},{"$set":{"last_notification_datetetime": update_date_time}})

	print("-------- abc admin -----------")
	print(abc)

	notificaion_list_to_show = []
	notification_to_show = notification_list.find({"time":{"$gte": last_read_datetime}},{'_id':0})
	for notificaionList in notification_to_show:
		notificaion_list_to_show.append(notificaionList)

	tasks_cursor     =  task_collection.find({"updated_at":{"$gte":last_read_datetime}},{"_id":0})
	update_date_time =  datetime.datetime.now()
	tasks            = []
	result = {}
	if tasks_cursor.count()!=0:
		for task in tasks_cursor:
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			get_last_read_datetime   = last_read_comments.find_one({"id": engineer_id, "task_id": task['id']})
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				task['unread_comment'] = unread_comment

			else:
				task['unread_comment'] = total_comment

			task['total_comments'] = total_comment
			tasks.append(task)

		result['tasks'] = tasks
		

		result['notification'] = notificaion_list_to_show
		return jsonify(result), 200
	else :
		return jsonify(result), 200


# Expected Params

# "user_id" 	  : "a1b2c3d4e5"
# "secret_hash" : "1236a135as1351asf13"
# "engineer_id" : "13asas1a1sassa5d1q3" or -1
# "offset"      : "10"

@task_controller.route('/task/list',methods = ['POST'])
def get():
	params       = request.json
	engineer_id  = params['engineer_id']
	# user_id 	 = params['user_id']
	# secret_hash  = params['secret_hash']
	offset 		 = params['offset']
	#validation on userid and secret hash
	if engineer_id   == 0 :
		# that means that we have to retrun all the tasks 
		tasks        = []
		user_id         = request.cookies['user_id']
		
		today_datetime = datetime.datetime.today().strftime('%d-%m-%Y')
		tasks_cursor =  task_collection.find({"schedule_date":{"$eq": today_datetime}},{"_id":0}).skip(offset).limit(100)
		for task in tasks_cursor:
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment

			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			print(get_last_read_datetime)
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				print(unread_comment)
				task['unread_comment'] = unread_comment
			else:
				task['unread_comment'] = total_comment

			tasks.append(task)

		tasks_cursor = task_collection.find({"schedule_date_operation":{"$lt": (datetime.datetime.today())},"schedule_date":{"$ne":today_datetime},"task_status":{"$ne":STATUS[3]}},{"_id":0}).skip(offset).limit(100)

		for task in tasks_cursor:
			task['total_comments'] = comment_collection.find({"task_id": task['id']}).count()
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment
			get_last_read_datetime = None
			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				task['unread_comment'] = unread_comment

			else:
				task['unread_comment'] = total_comment
				
			tasks.append(task)


		return jsonify({"message" : "All task list found " , "tasks" : tasks }), 200

	else :
		# it means that we need to return the tasks for that specific engineer 
		tasks_cursor =  task_collection.find({"assigned_user_id": engineer_id, "task_status":"assigned"},{"_id":0}).skip(offset).limit(100)
		update_date_time = datetime.datetime.now()
		tasks        = []
		if tasks_cursor.count()!=0:
			for task in tasks_cursor:
				total_comment = comment_collection.find({"task_id": task['id']}).count()
				get_last_read_datetime   = last_read_comments.find_one({"id": engineer_id, "task_id": task['id']})
				if get_last_read_datetime is not None:
					unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
					task['unread_comment'] = unread_comment

				else:
					task['unread_comment'] = total_comment
				task['total_comments'] = total_comment
				tasks.append(task)

			return jsonify({"message" : "tasks found", "tasks" : tasks}), 200
		else :
			return jsonify({"message" : "tasks found", "tasks" : tasks}), 200


@task_controller.route('/task/query_date_wise_preset',methods=['POST'])
def query_date_wise_preset():
	params = request.json
	query_date = params.get("query_date")
	param_status = params.get("status")
	user_id    = request.cookies['user_id']
	start_date = params.get("start_date")
	end_date = params.get("end_date")
	

	query_status_a = None
	query_status = []
	
	for k,v in param_status.items():
		if v == True:
			query_status.append(k)

	if "all" in query_status:
		query_status.remove("all")

	if query_date == "custom":
		start_date_array = start_date.split("-");
		start_date       = datetime.datetime(int(start_date_array[2]),int(start_date_array[1]),int(start_date_array[0]))
		end_date_array   = end_date.split("-");
		end_date       = datetime.datetime(int(end_date_array[2]),int(end_date_array[1]),int(end_date_array[0]))
	
	

	tasks = []
	
	today_datetime = datetime.datetime.today().strftime('%d-%m-%Y')

	if query_date == "today":
		pass
		# tasks_cursor =  task_collection.find({"schedule_date":{"$eq": today_datetime},"task_status": {"$in": query_status}},{"_id":0}).skip(0).limit(100)

	elif query_date == "last_30":
		
		tasks_cursor = task_collection.find({"schedule_date_operation":{"$gt": (datetime.datetime.today() - timedelta(days=29)),"$lt": datetime.datetime.today() },"task_status": {"$in": query_status}},{"_id":0})
		
	elif query_date == "last_7":
		tasks_cursor = task_collection.find({"schedule_date_operation":{"$gt": (datetime.datetime.today() - timedelta(days=7)),"$lt":datetime.datetime.today()},"task_status": {"$in": query_status}},{"_id":0})

	elif query_date == "next_30":
		tasks_cursor = task_collection.find({"schedule_date_operation":{"$gt": datetime.datetime.today() ,"$lte":(datetime.datetime.today() + timedelta(days=29))},"task_status": {"$in": query_status}},{"_id":0})
		
	elif query_date == "next_7":
		tasks_cursor = task_collection.find({"schedule_date_operation":{"$gt": datetime.datetime.today() ,"$lte":(datetime.datetime.today() + timedelta(days=7))},"task_status": {"$in": query_status}},{"_id":0})
		
	elif query_date == "custom":
		tasks_cursor = task_collection.find({"schedule_date_operation":{"$gte": start_date ,"$lte": end_date },"task_status": {"$in": query_status}},{"_id":0})
		

	if query_date == 'today':
		tasks        = []
		# user_id         = request.cookies['user_id']
		
		# today_datetime = datetime.datetime.today().strftime('%d-%m-%Y')
		tasks_cursor =  task_collection.find({"schedule_date":{"$eq": today_datetime},"task_status": {"$in": query_status}},{"_id":0}).skip(0).limit(100)
		for task in tasks_cursor:
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment

			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			print(get_last_read_datetime)
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				print(unread_comment)
				task['unread_comment'] = unread_comment
			else:
				task['unread_comment'] = total_comment

			tasks.append(task)

		tasks_cursor = task_collection.find({"schedule_date_operation":{"$lt": (datetime.datetime.today())},"schedule_date":{"$ne":today_datetime},"task_status":{"$ne":STATUS[3]}},{"_id":0}).skip(0).limit(100)

		for task in tasks_cursor:
			task['total_comments'] = comment_collection.find({"task_id": task['id']}).count()
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment
			get_last_read_datetime = None
			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				task['unread_comment'] = unread_comment

			else:
				task['unread_comment'] = total_comment
				
			tasks.append(task)


		return jsonify({"message" : "All task list found " , "tasks" : tasks }), 200
	else:


		for task in tasks_cursor:
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment

			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			print(get_last_read_datetime)
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				print(unread_comment)
				task['unread_comment'] = unread_comment
			else:
				task['unread_comment'] = total_comment

			tasks.append(task)


		for task in tasks_cursor:
			task['total_comments'] = comment_collection.find({"task_id": task['id']}).count()
			total_comment = comment_collection.find({"task_id": task['id']}).count()
			task['total_comments'] = total_comment
			get_last_read_datetime = None
			get_last_read_datetime   = last_read_comments.find_one({"id": user_id, "task_id": task['id']})
			if get_last_read_datetime is not None:
				unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']},'task_id': task['id']}).count()
				task['unread_comment'] = unread_comment

			else:
				task['unread_comment'] = total_comment
				
			tasks.append(task)


		return jsonify({"message" : "All task list found " , "tasks" : tasks }), 200


# -------------------------------------------------------------------------------------------------------------------------

# expected params :
# tittle
# description
# lat_long
# due_date
# assigned_to : engineer_id
# task_id : 1(edit/update) or 0(new)

@task_controller.route('/task/add/edit',methods = ['POST'])
def update():
	
	#validation userid and secrethash
	#task title
	#task description
	#lattitude 
	#longitude
	#schedule_date
	#assigned to

	params 		= request.json

	cookies = request.cookies
	requestee_user_id = cookies.get('user_id')
	requestee_user_secret_hash = cookies.get('token')
	requestee_user_obj = engineer_collection.find_one({"id":requestee_user_id,"secret_hash":requestee_user_secret_hash},{"_id":0})

	task_id 		    = params["task_id"]
	title 			    = params.get("title") 
	description 	    = params.get("description")
	lattitude	        = params.get("lattitude") 
	longitude           = params.get("longitude")
	schedule_date_param	   = params.get("schedule_date")
	reverse_geocode	   = params.get("reverse_geocode")
	# converting datetime object and in indian format
	datetime_array = schedule_date_param.split("-")
	datetime_obj = datetime.datetime(int(datetime_array[2]),int(datetime_array[1]),int(datetime_array[0]))
	schedule_date = datetime_obj.strftime('%d-%m-%Y')

	schedule_date_operation = datetime.datetime(int(datetime_array[2]), int(datetime_array[1]), int(datetime_array[0]), 0 , 0)

	assigned_user_id   = params.get("assigned_user_id")
	task_status        = "unassigned"

	assigned_user_name = None


	if assigned_user_id:
		assigned_user_obj = engineer_collection.find_one({"id":assigned_user_id})
		if assigned_user_obj :
			assigned_user_name = assigned_user_obj.get('name') 
		else :
			assigned_user_name = None

	if assigned_user_id  and assigned_user_name:
		task_status = "assigned"



	if task_id == 0:
		# that means it is a new entry
		task_id = generate_unique_id(task_collection)

		
		result = task_collection.insert_one({
			"id"                 	 : task_id,
			"title"              	 : title,
			"description"        	 : description,
			"lattitude"	         	 : lattitude,
			"longitude"		     	 : longitude,
			"schedule_date"      	 : schedule_date,
			"assigned_user_name" 	 : assigned_user_name,
			"assigned_user_id"   	 : assigned_user_id,
			"task_status"		 	 : task_status,
			"schedule_date_operation": schedule_date_operation,
			"created_at"             : str(datetime.datetime.now()),
			"audit_log"			     : list(),
			"reverse_geocode"        : reverse_geocode
			},{"_id":0})

		if task_status == "assigned":

			send_notification(assigned_user_id, title, task_id)
			
			phone_no = str(assigned_user_obj.get('phone'))

			url1="http://kit19.com/ComposeSMS.aspx?username=raghav643283&password=7924&sender=SNAPOW&to="+phone_no+"&message=you%20have%20a%20new%20task,title:%20"+result.title+"&priority=1&dnd=1&unicode=0"
			req = urllib2.urlopen(url1)
			print("--------------------sending message to monty-----------------------")
			
			print(req.read().decode(req.headers.get_content_charset()))

		result = task_collection.find_one({"id": task_id},{"_id":0})

		resp = {"message" : "task inserted sucessfully","task_added":result}
		return jsonify(resp), 200

	

	else:
		# this means that the user already exist and we need to update it
		task_obj = task_collection.find_one({"id": task_id },{"_id":0,"id":0})
		
		if task_obj:
			audit_log_obj = create_audit_log(old= task_obj, new = params,user_name=requestee_user_obj, assigned_user_name=assigned_user_name )
			# task_audit_log = task_obj.get('audit_log')
			if audit_log_obj:
				pass
			else:
				audit_log_obj = task_obj.get("audit_log")


			if(reverse_geocode):
				task_collection.update_one({'id': task_id },
                                      { '$set':
                                      	{
                                      		"title"      : title,
											"description" : description,
											"lattitude"	  : lattitude,
											"longitude"	  : longitude,
											"schedule_date": schedule_date,
											"assigned_user_name" : assigned_user_name,
											"assigned_user_id": assigned_user_id,
											"task_status": task_status,
											"updated_at"  : str(datetime.datetime.now()),
											"audit_log"   : audit_log_obj,
											"schedule_date_operation": schedule_date_operation,
											"reverse_geocode"        : reverse_geocode
                                      	}
                                           
                                       }
                                      )
			else:
				task_collection.update_one({'id': task_id },
	              { '$set':
	              	{
	              		"title"      : title,
						"description" : description,
						"lattitude"	  : lattitude,
						"longitude"	  : longitude,
						"schedule_date": schedule_date,
						"assigned_user_name" : assigned_user_name,
						"assigned_user_id": assigned_user_id,
						"task_status": task_status,
						"updated_at"  : str(datetime.datetime.now()),
						"audit_log"   : audit_log_obj,
						"schedule_date_operation": schedule_date_operation
	              	}
	                   
	               }
	              )

			if task_status == "assigned":
				send_notification(assigned_user_id, title, task_id)


			result = task_collection.find_one({"id": task_id},{"_id":0})

			resp = {"message" : "task updated sucessfully","task_added":result}
			return jsonify(resp), 200

		else:
			resp = {"message": "task does not exist"}
			return jsonify(resp), 404


def send_notification(assigned_user_id, title, task_id):
	device_token_find = device_token.find_one({"userid": assigned_user_id})
	if device_token_find is not None:
		registration_id = device_token_find['token']
		message_title = "You just got a new task"
		message_body = title

		tasks_cursor =  task_collection.find({"id": task_id},{"_id":0,"audit_log":0, "schedule_date_operation":0})
		update_date_time = datetime.datetime.now()
		task        = {}
		if tasks_cursor.count()!=0:
			for task in tasks_cursor:
				total_comment = comment_collection.find({"task_id": task['id']}).count()
				get_last_read_datetime   = last_read_comments.find_one({"id": assigned_user_id, "task_id": task['id']})
				if get_last_read_datetime is not None:
					unread_comment = comment_collection.find({"created_at":{"$gte": get_last_read_datetime['last_read_datetetime']}}).count()
					task['unread_comment'] = unread_comment
				else:
					task['unread_comment'] = total_comment

				task['total_comments'] = total_comment
				extra_kwargs = {
					'priority': 'high'
				}

				print(task)
				result = push_service.notify_single_device(registration_id=registration_id, message_title=message_title, message_body=message_body,data_message=task, extra_kwargs=extra_kwargs, click_action="FCM_PLUGIN_ACTIVITY")



@task_controller.route('/task/update_status',methods=['POST'])
def change_status():
	params = request.json

	cookies = request.cookies

	if cookies:
		requestee_user_id = cookies.get('user_id')
		requestee_user_secret_hash = cookies.get('token')
		
	else:
		requestee_user_id = params['engineer_id']
		params.pop("engineer_id")

	requestee_user_obj = engineer_collection.find_one({"id":requestee_user_id},{"_id":0})

	task_status = params['task_status']
	task_id     = params['task_id']

	if task_status in STATUS :
		task_obj = task_collection.find_one({"id": task_id },{"_id":0})
		if task_obj :

			audit_log_obj = create_audit_log(old= task_obj, new = params, user_name = requestee_user_obj )

			if audit_log_obj:
				pass
			else:
				audit_log_obj = task_obj.get("audit_log")

			if task_status == "completed":

				task_collection.update_one({'id': task_id },
	                                      { '$set':
	                                      	{
	                                      		"task_status": task_status,
	                                      		"updated_at": str(datetime.datetime.now()),
	                                      		"audit_log": audit_log_obj,
	                                      		"completed_at": str(datetime.datetime.now())
	                                      	}
	                                          
	                                       }
	                                      )
				resp = {"message": "task status completed sucessfully"}
				return jsonify(resp), 200
			elif task_status == 'verified':
				task_collection.update_one({'id': task_id },
	                                      { '$set':
	                                      	{
	                                      		"task_status": task_status,
	                                      		"updated_at": str(datetime.datetime.now()),
	                                      		"audit_log": audit_log_obj,
	                                      		"verified_at": str(datetime.datetime.now())
	                                      	}
	                                          
	                                       }
	                                      )
				resp = {"message": "task status verified sucessfully"}
				return jsonify(resp), 200
			else:
				task_collection.update_one({'id': task_id },
	                                      { '$set':
	                                      	{
	                                      		"task_status": task_status,
	                                      		"updated_at": str(datetime.datetime.now()),
	                                      		"audit_log": audit_log_obj
	                                      	}
	                                          
	                                       }
	                                      )
				resp = {"message": "task status updated sucessfully"}
				return jsonify(resp), 200

		else :
			resp = {"message":"task not found"}
			return jsonify(resp), 404


	else :
		resp = {"message": "Invalid task status"}
		return jsonify(resp), 404
