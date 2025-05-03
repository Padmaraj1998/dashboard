from ..config import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    tasks = db.relationship("Task", secondary="task_user", back_populates="users")

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    tasks = db.relationship("Task", backref="project", lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum("Not Started", "In Progress", "Complete"), default="Not Started")
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    users = db.relationship("User", secondary="task_user", back_populates="tasks")

task_user = db.Table('task_user',
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)
