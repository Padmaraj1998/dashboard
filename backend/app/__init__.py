from flask import Flask
from dotenv import load_dotenv
import os
from .config import db
from sqlalchemy import text
from flask_migrate import Migrate
from flask_cors import CORS

migrate = Migrate()

def create_app():
    
    app = Flask(__name__)
    load_dotenv() #.env file is loaded to os
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    from .routes.project import project_bp
    from .routes.task import task_bp
    from .routes.user import user_bp

    app.register_blueprint(project_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(user_bp)

    with app.app_context():
        try:
            db.session.execute(text('SELECT 1'))
            from .models.models import User, Task, Project
            print("Successfully connected to the database.")
        except Exception as e:
            print("Database connection failed:", e)

    return app