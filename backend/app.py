from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config
from datetime import datetime

db = SQLAlchemy()

class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    publish_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    author = db.Column(db.String(100), nullable=False, default='物业管理员')
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'publish_time': self.publish_time.strftime('%Y-%m-%d %H:%M:%S') if self.publish_time else None,
            'update_time': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None,
            'author': self.author,
            'is_active': self.is_active
        }

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

CATEGORIES = ['小区公告', '停水停电通知', '活动通知', '防疫须知']

@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    category = request.args.get('category')
    is_active = request.args.get('is_active')
    
    query = Announcement.query
    
    if category:
        query = query.filter_by(category=category)
    
    if is_active is not None:
        is_active_bool = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active_bool)
    
    announcements = query.order_by(Announcement.publish_time.desc()).all()
    return jsonify([ann.to_dict() for ann in announcements])

@app.route('/api/announcements/<int:announcement_id>', methods=['GET'])
def get_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    return jsonify(announcement.to_dict())

@app.route('/api/announcements', methods=['POST'])
def create_announcement():
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('content') or not data.get('category'):
        return jsonify({'error': '缺少必要字段'}), 400
    
    if data.get('category') not in CATEGORIES:
        return jsonify({'error': '无效的分类'}), 400
    
    new_announcement = Announcement(
        title=data['title'],
        content=data['content'],
        category=data['category'],
        author=data.get('author', '物业管理员')
    )
    
    db.session.add(new_announcement)
    db.session.commit()
    
    return jsonify(new_announcement.to_dict()), 201

@app.route('/api/announcements/<int:announcement_id>', methods=['PUT'])
def update_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    data = request.get_json()
    
    if data.get('title'):
        announcement.title = data['title']
    if data.get('content'):
        announcement.content = data['content']
    if data.get('category'):
        if data['category'] not in CATEGORIES:
            return jsonify({'error': '无效的分类'}), 400
        announcement.category = data['category']
    if data.get('author'):
        announcement.author = data['author']
    if data.get('is_active') is not None:
        announcement.is_active = data['is_active']
    
    db.session.commit()
    return jsonify(announcement.to_dict())

@app.route('/api/announcements/<int:announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    announcement = Announcement.query.get_or_404(announcement_id)
    
    db.session.delete(announcement)
    db.session.commit()
    
    return jsonify({'message': '公告已删除'})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify(CATEGORIES)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
