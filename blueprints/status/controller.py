from flask import Blueprint, request, jsonify
import datetime
from models.base import engineer_collection
from models.base import task_collection, comment_collection, device_token, last_read_comments, notification_list
from modules.audit import create_audit_log
from pyfcm import FCMNotification

push_service = FCMNotification(api_key="AAAAkiUf4Ng:APA91bEl8DmLYRayKf9Qr-DlnluNMzg5bkfyG3YkG7g308tis24Hro0EAHvDUmN3TZILiPRAlvm8N4mZqnDAs3Qt_0k5kS7imXmHBbdMF7XdiF4DblvoucncRwcXnjpaHwEqwtPHCHf8")


# from modules.decorators import demo


status_controller = Blueprint('status_controller',__name__)

all_status = ("assigned","unassigned","verified")

admin_status      = ("assigned","unassigned","completed","verified")

engineer_status   = ("completed")  


@status_controller.route('/status_test')
# @demo
def status_test():
	print("inside status_test")
	return "inside test_status"




# @status_controller.route('/status/mark_as_complete')
# def mark-as_complete():
# 	pass





# # expected params :
# # task_id :
# # task_status :
# # engineer_id :

@status_controller.route('/task/set_status',methods = ['POST'])
def set_status():
	params  = request.json

	cookies = request.cookies
	requestee_user_id = cookies.get('user_id')
	requestee_user_secret_hash = cookies.get('token')
	requestee_user_obj = engineer_collection.find_one({"id":requestee_user_id,"secret_hash":requestee_user_secret_hash},{"_id":0})

	task_id     = params['task_id'] 
	task_status = params['task_status']
	engineer_id = params['engineer_id']
	params['assigned_user_id'] = engineer_id
	params.pop('engineer_id')


	if task_status in all_status :
		engineer_obj =  engineer_collection.find_one({"id":engineer_id},{"_id": 0})


		if engineer_obj :
			task_obj = task_collection.find_one({"id": task_id },{"_id":0})
			assigned_user_name = engineer_obj.get("name")	
			audit_log_obj = create_audit_log(old= task_obj, new = params,user_name=requestee_user_obj,assigned_user_name= assigned_user_name )
			
			if audit_log_obj:
				pass
			else:
				audit_log_obj = task_obj.get("audit_log")


			if(task_status == "assigned"):
				send_notification(engineer_id, task_obj['title'], task_id)

			task_obj = task_collection.update({"id": task_id},{"$set":{
				"task_status": task_status,
				"assigned_user_id":engineer_id,
				"assigned_user_name": engineer_obj['name'],
				"updated_at":str(datetime.datetime.now()),
				"audit_log": audit_log_obj
			}})

			

			resp = {"message": "task_status updated successfully"}
			return jsonify(resp), 200

		else :

			resp = {"message": "invalid task id"}
			return jsonify(resp), 404
	else :
		resp = {"message": "invalid status"}
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

				result = push_service.notify_single_device(registration_id=registration_id, message_title=message_title, message_body=message_body,data_message=task, extra_kwargs=extra_kwargs, click_action="FCM_PLUGIN_ACTIVITY")


# @status_controller.route('/task/verify',methods = ['POST'])
# def verify_status():
# 	params = request.json

# 	task_id     = params['task_id'] 
# 	task_status = params['task_status']
# 	engineer_id = params['engineer_id']

# 	if task_status in all_status :
# 		engineer_obj =  engineer_collection.find_one({"id":engineer_id},{"_id": 0})
# 	# set params for normal engineer and admin
# 		if engineer_obj :
# 			print(engineer_obj)
# 			task_obj = task_collection.update({"id": task_id},{"$set":{
# 				"task_status": task_status,
# 				"assigned_user_id":engineer_id,
# 				"assigned_user_name": engineer_obj['name'],
# 				"updated_at":str(datetime.datetime.now())
# 			}})	
# 			resp = {"message": "task_status updated successfully"}
# 		return jsonify(resp), 200

# 		else :

# 			resp = {"message": "invalid task id"}
# 			return jsonify(resp), 404
# 	else :
# 		resp = {"message": "invalid status"}
# 		return jsonify(resp), 404


	
	# engineer_obj = engineer_collection.find_one({"id": engineer_id},{"_id":0})

	# is_admin = engineer_obj.get('is_admin')
	
	# if task_status == "verifed":

	# 	is_valid_status  = True
	# else :
	#  	is_valid_status  = False

	
	# if engineer_obj and is_admin and is_valid_status :
	# 	if task_obj:
	# 		task_obj = task_collection.update_one({"id": task_id},{
	#  			"status": task_status,
	# 			"updated"_at: str(datetime.datetime.now())
	#  			})
	# 		resp = {"message": "task_status updated to verifed"}, 200
	# 	else:
	# 		resp = {"message": "invalid task id"}
	# 		return jsonify(resp), 404
	# else:
	# 	resp = {"message": "invavlid request"}
	# 	return jsonify(resp), 404			










