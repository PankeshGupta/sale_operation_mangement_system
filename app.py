from flask import Flask
from flask_cors import CORS
from blueprints.engineer.controller import engineer_controller
from blueprints.task.controller import task_controller
from blueprints.login.controller import login_controller
from blueprints.views.controller import views_controller
from blueprints.comment.controller import comment_controller
from blueprints.image.controller import image_controller
from blueprints.status.controller import status_controller
from blueprints.location.controller import location_controller
import os

os.environ['TZ'] = 'Asia/Kolkata'

from modules.decorators import demo
app = Flask(__name__)
CORS(app)

app.register_blueprint(engineer_controller)
app.register_blueprint(task_controller)
app.register_blueprint(login_controller)
app.register_blueprint(views_controller)
app.register_blueprint(comment_controller)
app.register_blueprint(image_controller)
app.register_blueprint(status_controller)
app.register_blueprint(location_controller)


@app.route('/test')
def test():
	return "test successful"


if __name__ == "__main__":
	app.run(host='0.0.0.0',port=80,debug=True)
	