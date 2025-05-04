from flask import Blueprint, request, jsonify
from ..models.models import db, User

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    sort_by = request.args.get('sort_by', 'name')
    sort_column = getattr(User, sort_by, User.name)
    sort_column = sort_column.asc()

    pagination = User.query.order_by(sort_column).paginate(page=page, per_page=per_page, error_out=False)
    users = [user for user in pagination.items]
    # users = User.query.all()
    data = [{'id': u.id, 'name': u.name} for u in users]
    
    result = {'lastpage': pagination.pages, 'details':data}
    return result

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
