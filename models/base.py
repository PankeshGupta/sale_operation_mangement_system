import pymongo
from pymongo import MongoClient

client = MongoClient('mongodb://127.0.0.1:27017')
mongo = client.oms

# collection paths 
# Just import the required collectiopn in the file you need 
# No need to import pymongo again and again

engineer_collection  = mongo.engineers
task_collection 	 = mongo.tasks 
admin_collection 	 = mongo.admin
comment_collection   = mongo.comments 
image_collection     = mongo.images
location_collection  = mongo.location 
device_token 		 = mongo.device_token
last_read_comments   = mongo.last_read_comments
notification_list    = mongo.notifications
test_collection      = mongo.test_db