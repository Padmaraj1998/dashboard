from flask import Blueprint, request, jsonify
from ..models.models import db, Task, User, Project

task_bp = Blueprint('task_bp', __name__)

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    result = []
    for task in tasks:
        result.append({
            'id': task.id,
            'name': task.name,
            'status': task.status,
            'users': [u.name for u in task.users],
            'project': task.project.name if task.project else None
        })
    return jsonify(result)

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    task = Task(name=data['name'], status=data['status'])

    # Assign users
    user_ids = data.get('user_ids')
  
    if user_ids:
        users = User.query.filter(User.id.in_(user_ids)).all()
        task.users = users

    # Assign to a project
    project_id = data.get('project_id')
    if project_id:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        task.project = project

    db.session.add(task)
    db.session.commit()
    return jsonify({'message': 'Task created', 'id': task.id}), 201
