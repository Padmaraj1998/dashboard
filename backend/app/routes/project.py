from flask import Blueprint, request, jsonify
from ..models.models import db, Project

project_bp = Blueprint('project_bp', __name__)

@project_bp.route('/projects', methods=['GET'])
def get_projects():
    page = request.args.get('page', 1, type=int)
    per_page = 10

    sort_by = request.args.get('sort_by', 'name')
    sort_column = getattr(Project, sort_by, Project.name)
    sort_column = sort_column.asc()

    pagination = Project.query.order_by(sort_column).paginate(page=page, per_page=per_page, error_out=False)
    projects = [project for project in pagination.items]
   
    data = [{'id': u.id, 'name': u.name} for u in projects]
    
    result = {'lastpage': pagination.pages, 'details':data}
    return result
   

@project_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    if not data['name'] or 'name' not in data:
        return jsonify({'error': 'Missing project name'}), 400
    project = Project(name=data['name'])
    db.session.add(project)
    db.session.commit()
    return jsonify({'message': 'Project created', 'id': project.id}), 201
