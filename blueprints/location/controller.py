from flask import Blueprint, request, jsonify
from models.base import location_collection,test_collection
from modules.auth import is_authorized
import datetime


location_controller = Blueprint('location_controller',__name__)


@location_controller.route('/location/test',methods=['POST'])
def location_test():
	print("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
	params = request.json
	print("=====================request================")
	print(params)
	engineer_id = request.headers.get('Userid')

	if engineer_id:


		lattitude =params[0].get('latitude')
		longitude = params[0].get('longitude')

		location_obj = location_collection.insert_one({"engineer_id":engineer_id,"lattitude":lattitude,"longitude": longitude,"created_at":str(datetime.datetime.now()) })

		resp = {"message":"location inserted sucess"}

		return jsonify(resp), 200
	else:
		resp = {"message": "Engineer id not found"}
		return resp,404







# expected_params:
# engineer_id :
# token:
# lattitude :
# longitude :
@location_controller.route('/location/current_location',methods = ['POST'])
def currrent_location():
	params = request.json
	engineer_id = params.headers.get('Userid')

	if engineer_id:


		lattitude =params["lattitude"]
		longitude = params["longitude"]

		location_obj = location_collection.insert_one({"engineer_id":engineer_id,"lattitude":lattitude,"longitude": longitude,"created_at":str(datetime.datetime.now()) })

		resp = {"message":"location inserted sucess"}

		return jsonify(resp), 200
	else:
		resp = {"message": "Engineer id not found"}
		return resp,404




