import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AnnouncementDetail() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/announcements/${id}`);
      setAnnouncement(response.data);
    } catch (error) {
      console.error('获取公告详情失败:', error);
      setError('获取公告详情失败，请稍后重试');
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

  if (error || !announcement) {
    return (
      <div className="card text-center">
        <p className="text-danger">{error || '公告不存在'}</p>
        <Link to="/" className="btn mt-3">返回首页</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="btn btn-secondary mb-4">
        &larr; 返回公告列表
      </Link>

      <div className="card">
        <div 
          className="card-header"
          style={{ 
            backgroundColor: getCategoryColor(announcement.category),
            color: 'white'
          }}
        >
          <span className="badge bg-light text-dark">{announcement.category}</span>
          <h2 className="mt-2">{announcement.title}</h2>
        </div>
        <div className="card-body">
          <div className="mb-4 text-muted">
            <p>发布时间: {announcement.publish_time}</p>
            <p>发布者: {announcement.author}</p>
            {announcement.update_time && (
              <p>最后更新: {announcement.update_time}</p>
            )}
          </div>
          
          <div className="announcement-content">
            <p style={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementDetail;
