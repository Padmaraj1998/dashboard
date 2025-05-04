from flask import Blueprint, request, jsonify
from ..models.models import db, Task, User, Project
from werkzeug.utils import secure_filename
import os
import pandas as pd

task_bp = Blueprint('task_bp', __name__)

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    last_page = ''
    if request.args.get('page'):
        page = request.args.get('page', 1, type=int)
        per_page = 10

        sort_by = request.args.get('sort_by', 'name')
        sort_column = getattr(Task, sort_by, Task.name)
        sort_column = sort_column.asc()

        pagination = Task.query.order_by(sort_column).paginate(page=page, per_page=per_page, error_out=False)
        tasks = [task for task in pagination.items]
        last_page = pagination.pages
        print("lastpage: ",last_page)
        
    else:
         tasks = Task.query.all()

    data = []
    for task in tasks:
        data.append({
            'id': task.id,
            'name': task.name,
            'status': task.status,
            'users': [u.name for u in task.users],
            'user_ids': [u.id for u in task.users],
            'project': task.project.name if task.project else None,
            'project_id': task.project.id if task.project else None
        })
    
    result = {'lastpage': last_page, 'details':data}
    return result

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    print(data)
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


@task_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    print(data)

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    # Update basic fields
    task.name = data.get('name', task.name)
    task.status = data.get('status', task.status)

    # Update users
    user_ids = data.get('user_ids')
    if user_ids is not None:
        users = User.query.filter(User.id.in_(user_ids)).all()
        task.users = users

    # Update project
    project_id = data.get('project_id')
    if project_id is not None:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        task.project = project

    db.session.commit()
    return jsonify({'message': 'Task updated', 'id': task.id}), 200





@task_bp.route('/tasks/import', methods=['POST'])
def import_tasks():
    print("Files received:", request.files)

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Ensure the 'uploads' folder exists
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)  # Create the uploads folder if it doesn't exist

    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)

    try:
        # Save the file to the uploads folder
        file.save(filepath)
        print(f"File saved to {filepath}")

        # Read the Excel file with pandas
        data = pd.read_excel(filepath)

        
        success_count = 0
        failed_count = 0
        failed_rows = []

        # Iterate through each row in the dataframe
        # for index, row in data.iterrows():
            # task_name = row.get('Name')
            # task_status = row.get('Status')
            # # user_ids = row.get('Assigned_Users')
            # user_ids_str = str(row.get('Assigned_Users', '')).strip()
            # user_ids = [int(uid.strip()) for uid in user_ids_str.split(',') if uid.strip().isdigit()]
            # project_id = row.get('Project')

        for index, row in data.iterrows():
            try:
                task = Task(
                    name=row['Name'],
                    status=row['Status']
                )

                # Handle comma-separated user_ids
                user_ids_str = str(row.get('Assigned_Users', ''))
                user_ids = [int(uid.strip()) for uid in user_ids_str.split(',') if uid.strip().isdigit()]
                if user_ids:
                    task.users = User.query.filter(User.id.in_(user_ids)).all()

                project_id = row.get('Project')
                if pd.notna(project_id):
                    project = Project.query.get(int(project_id))
                    if not project:
                        raise Exception('Invalid project ID')
                    task.project = project

                db.session.add(task)
                db.session.commit()
                success_count += 1

            except Exception as e:
                db.session.rollback()
                failed_count += 1
                failed_rows.append({'row': index + 2, 'error': str(e)})

        return jsonify({
            'message': 'Import completed',
            'success_count': success_count,
            'failed_count': failed_count,
            'failed_details': failed_rows
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500