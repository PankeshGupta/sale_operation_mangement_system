from flask import Blueprint, request

def demo(some_function):
	def wrapper():
		print(request.json)
		print("inside wrapper function")	
		return some_function()
	return wrapper
