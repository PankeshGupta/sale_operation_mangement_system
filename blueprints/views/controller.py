from flask import Blueprint, request, jsonify, render_template, redirect, url_for

from modules.cookies import verify_cookie

views_controller = Blueprint('views_controller',__name__)



@views_controller.route('/views_test')
def views():
	return 'inside views controller'



@views_controller.route('/login')
def login():
	user_name = request.cookies.get('user_name')
	token     = request.cookies.get('token') 
	user_id   = request.cookies.get('user_id')
	if token and user_id:
		logged_in = verify_cookie(user_id,token)
		print(logged_in)
		if logged_in :
			return redirect(url_for('views_controller.engineers'))
		else :
			return render_template('login.html')

	else :
		return render_template('login.html')

@views_controller.route('/dashboard')
def dashboard():
	return render_template('index.html')


@views_controller.route('/engineers')
def engineers():
	user_name = request.cookies.get('user_name')
	token     = request.cookies.get('token')
	user_id   = request.cookies.get('user_id')
	if token and user_id:
		logged_in = verify_cookie(user_id,token)
		if logged_in :
			return render_template('engineers.html')
		else :
			# on fail
			return redirect(url_for('views_controller.login'))

	else :
		return redirect(url_for('views_controller.login'))

@views_controller.route('/tasks')
def tasks():
	user_name = request.cookies.get('user_name')
	token     = request.cookies.get('token')
	user_id   = request.cookies.get('user_id')
	if token and user_id:
		logged_in = verify_cookie(user_id,token)
		if logged_in :
			return render_template('tasks.html')
		else :
			# on fail
			return redirect(url_for('views_controller.login'))

	else :
		return redirect(url_for('views_controller.login'))

# @views_controller.route('/tasks')
# def tasks():
# 	return render_template('tasks.html')