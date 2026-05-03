import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AnnouncementList({ categories }) {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let url = '/api/announcements?is_active=true';
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const response = await axios.get(url);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('获取公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '小区公告':
        return '#3498db';
      case '停水停电通知':
        return '#e74c3c';
      case '活动通知':
        return '#27ae60';
      case '防疫须知':
        return '#f39c12';
      default:
        return '#3498db';
    }
  };

  if (loading) {
    return (
      <div className="card text-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">小区公告通知</h1>
      
      <div className="card mb-4">
        <h3 className="mb-3">按分类筛选</h3>
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn ${selectedCategory === '' ? '' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory('')}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`btn ${selectedCategory === category ? '' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(category)}
              style={{ backgroundColor: selectedCategory === category ? getCategoryColor(category) : '' }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="card text-center">
          <p>暂无公告</p>
        </div>
      ) : (
        <div className="row">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div 
                  className="card-header"
                  style={{ 
                    backgroundColor: getCategoryColor(announcement.category),
                    color: 'white'
                  }}
                >
                  <span className="badge bg-light text-dark">{announcement.category}</span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{announcement.title}</h5>
                  <p className="card-text text-muted">
                    发布时间: {announcement.publish_time}
                  </p>
                  <p className="card-text">
                    {announcement.content.length > 100 
                      ? `${announcement.content.substring(0, 100)}...` 
                      : announcement.content}
                  </p>
                  <Link 
                    to={`/announcement/${announcement.id}`} 
                    className="btn"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementList;
