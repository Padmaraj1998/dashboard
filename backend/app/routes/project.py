from flask import Blueprint, request, jsonify
from ..models.models import db, Project

project_bp = Blueprint('project_bp', __name__)

@project_bp.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{'id': p.id, 'name': p.name} for p in projects])

@project_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Missing project name'}), 400
    project = Project(name=data['name'])
    db.session.add(project)
    db.session.commit()
    return jsonify({'message': 'Project created', 'id': project.id}), 201
