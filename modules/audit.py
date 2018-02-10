import datetime
from models.base import engineer_collection, notification_list

def create_audit_log(old, new,user_name=None,assigned_user_name=None):
	
	if user_name:
		if user_name.get("is_admin"):
			user_name = "admin"
		else:
			user_name = user_name.get("name")
	else:
		user_name = None

	changed_keys = {}

	full_audit_log = old.get("audit_log")
	location_change = 0
	for key in new.keys():
		if new[key] == old.get(key):
			pass
		else :
			if key == "assigned_user_id":
				# print("iniside assigned user id")
				# print(old.get(key))
				if old.get("assigned_user_name"):
					pass
				else:
					old["assigned_user_name"] = "not assigned"
					
				if new.get(key):
					# changed_keys["assigned engineer"] = [old,new]
					changed_keys["assigned engineer"] = [old.get("assigned_user_name"),assigned_user_name]
				else:
					changed_keys["assigned engineer"] = [old.get("assigned_user_name"),"not assigned"]
			
			elif key == "longitude" or key == "lattitude":
				location_change +=1
			elif key == "task_status":
				changed_keys["task status"] = [old.get(key),new[key]]
			elif key == "reverse_geocode":
				pass
			else:
				changed_keys[key] = [old.get(key),new[key]]
	
	if location_change in [1,2]:
		changed_keys["task location"] = [[old.get("longitude"),old.get("lattitude")],[new.get("longitude"),new.get("lattitude")]]


	changed_keys.pop("task_id", None)
	
	audit = {}
	audit['type'] = "changed"
	audit['time'] = str(datetime.datetime.now())
	audit['user_name'] = user_name
	audit["changed_key"] = changed_keys
	


	if audit["changed_key"]:
		full_audit_log.append(audit)
		print(full_audit_log)
		inserted = notification_list.insert({"time":str(datetime.datetime.now()), "user_name":user_name, "changed_keys": changed_keys})
		print(full_audit_log)
		return full_audit_log
	else:
		return False


