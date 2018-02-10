import secrets


def generate_id():
	uid = secrets.token_hex(10)
	return uid[:10] 

def generate_unique_id(collection_name):
	print("---------- unique id----------")
	_id = generate_id()

	duplicate_id = collection_name.find_one({"id": _id })
	if duplicate_id:
		generate_unique_id()
	else:
		return _id
