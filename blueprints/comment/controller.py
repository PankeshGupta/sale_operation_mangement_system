from flask import Blueprint, request, jsonify
from models.base import comment_collection, engineer_collection, task_collection, device_token, last_read_comments, notification_list
import datetime	
from modules.id import generate_id, generate_unique_id
from pyfcm import FCMNotification

push_service = FCMNotification(api_key="AAAAkiUf4Ng:APA91bEl8DmLYRayKf9Qr-DlnluNMzg5bkfyG3YkG7g308tis24Hro0EAHvDUmN3TZILiPRAlvm8N4mZqnDAs3Qt_0k5kS7imXmHBbdMF7XdiF4DblvoucncRwcXnjpaHwEqwtPHCHf8")


comment_controller = Blueprint('comment_controller',__name__)



@comment_controller.route('/comment_test')
def comment_test():
	return 'inside comment_test controller'

# CRUD for comment

# expected params
# task_id : "njk12kjnkjn"
# engineer_id : "<some_id>"


@comment_controller.route('/comment/list', methods=['POST'])
def get():
	params = request.json
	task_id = params.get('task_id')

	enginneer_id = params.get('user_id')

	if( not enginneer_id ):
		enginneer_id = request.cookies['user_id']
	
	if task_id:
		update_date_time = str(datetime.datetime.now())
		get_last_read_datetime   = last_read_comments.find_one({"id": enginneer_id, "task_id": task_id})
		if get_last_read_datetime is not None:
			last_read_comments.update({"id": enginneer_id, "task_id": task_id},{"$set":{"last_read_datetetime": update_date_time}})
		else:
			last_read_comments.insert({"id": enginneer_id, "task_id": task_id, "last_read_datetetime": update_date_time})

		comment_obj = comment_collection.find({"task_id": task_id },{"audit_log": 0,"_id":0})
		if comment_obj.count()!=0:
			comment_list = [comment for comment in comment_obj]
			resp = {"message":"comments found","comment_list": comment_list}
			return jsonify(resp), 200
		else :
			resp  = {"message": "No comments found"}
			return jsonify(resp), 200
	else :
		resp = {"message": "invalid task_id"}
		return jsonify(resp), 404
	

# expected params :

# comment_id   : 0(add) or 12cs22j3jjw323(edit)
# comment_text : "Hi this is content for my comment "
# image_id     : 1qw2wq3wq3d3(Not mandatory)
# comment_by   : 12jnndnn32nj23k(engineer_id)
# task_id      : 21qw3qw4sd5sd



@comment_controller.route('/comment/add/edit',methods=['POST'])
def update():
	
	params             = request.json
	
	comment_id         = params.get('comment_id')
	comment_text       = params.get('comment_text')
	image_id           = params.get('image_id')  #sincce its optional
	comment_by_id      = params['comment_by_id']
	
	engineer_data	   = engineer_collection.find_one({"id":comment_by_id},{"name":1})
	
	comment_by_name    = engineer_data['name']
	task_id            = params['task_id']




	if comment_id == 0:
		comments_json = {
			
			"id"                 : generate_unique_id(comment_collection), #"test_id"
			"comment_text"       : comment_text,
			"image_id"			 : image_id,
			"comment_by_id"		 : comment_by_id,
			"comment_by_name"	 : comment_by_name,
			"task_id"			 : task_id,
			"created_at"         : str(datetime.datetime.now()),
			"updated_at"		 : None
			
			}

		result = comment_collection.insert_one(comments_json)
		del comments_json['_id']

		update_date_time = str(datetime.datetime.now())
		get_last_read_datetime   = last_read_comments.find_one({"id": comment_by_id, "task_id": task_id})
		if get_last_read_datetime is not None:
			last_read_comments.update({"id": comment_by_id, "task_id": task_id},{"$set":{"last_read_datetetime": update_date_time}})
		else:
			last_read_comments.insert({"id": comment_by_id, "task_id": task_id, "last_read_datetetime": update_date_time})


		task_assigned_to = task_collection.find_one({"id": task_id})
		if task_assigned_to is not None:
			if task_assigned_to['assigned_user_id'] != comment_by_id and task_assigned_to["task_status"] == "assigned":
				send_notification(task_assigned_to['assigned_user_id'], comment_by_name, comment_text, task_id)

		audit = {}
		audit['time'] = str(datetime.datetime.now())
		audit['user_name'] = comment_by_name
		audit["changed_key"] = "comment"
		audit["comments"] = 1
		audit["comment_text"] = comment_by_name+" has added a new comment on task"+ task_assigned_to['title']
		
		auditLos = notification_list.insert(audit)

		task_collection.update({"id": task_id},{"$set":{"updated_at":str(datetime.datetime.now())}})
		resp = {"message" : "task inserted sucessfully", "comment_list": comments_json}
		return jsonify(resp), 200

	elif comment_id == None :
		resp = {"message": "No comment_id found "}
		return jsonify(resp), 404
	else :
		comment_obj = comment_collection.find_one({"id": comment_id },{"audit_log": 0,"_id":0,"id":0})
		if comment_obj :
			
			result_obj = comment_collection.update_one({'id' : comment_id},
												 {"$set"  : 
												 			{"comment_text" : comment_text ,"image_id": image_id, "updated_at":str(datetime.datetime.now()), "audit_log":comment_obj }})


			resp = {"message": " comment updated sucessfully"}
			return jsonify(resp), 200			

		else :
			resp = {"message":"comment not found"}
			return jsonify(resp), 404



def send_notification(assigned_user_id, name, title, task_id):
	device_token_find = device_token.find_one({"userid": assigned_user_id})
	if device_token_find is not None:
		registration_id = device_token_find['token']
		message_title = name+ " has commented on a task assigned to you"
		message_body = title

		tasks_cursor =  task_collection.find({"id": task_id},{"_id":0})
		update_date_time = datetime.datetime.now()
		task        = {}
		if tasks_cursor.count()!=0:
			for task in tasks_cursor:
				del task['audit_log']
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

		# print(result)



@comment_controller.route('/comment/delete')
def delete():
	pass
