from flask import Blueprint, request, jsonify
from ..models.models import db, User

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'name': u.name} for u in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    print(data)

    if not data or 'name' not in data:
        return jsonify({'error': 'Missing user name'}), 400
    user = User(name=data['name'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created', 'id': user.id}), 201
