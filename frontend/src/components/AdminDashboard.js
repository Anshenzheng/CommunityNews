import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard({ categories }) {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory, showInactive]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let url = '/api/announcements?';
      
      if (selectedCategory) {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      
      if (!showInactive) {
        url += 'is_active=true&';
      }
      
      const response = await axios.get(url);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('获取公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条公告吗？')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        setMessage('公告已删除');
        fetchAnnouncements();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('删除公告失败:', error);
        setMessage('删除公告失败，请稍后重试');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/api/announcements/${id}`, {
        is_active: !currentStatus
      });
      setMessage(currentStatus ? '公告已下架' : '公告已发布');
      fetchAnnouncements();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('更新公告状态失败:', error);
      setMessage('更新公告状态失败，请稍后重试');
      setTimeout(() => setMessage(''), 3000);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>管理后台</h1>
        <Link to="/admin/new" className="btn">
          + 发布新公告
        </Link>
      </div>

      {message && (
        <div className="card mb-4 bg-light">
          <p className="m-0">{message}</p>
        </div>
      )}

      <div className="card mb-4">
        <h3 className="mb-3">筛选条件</h3>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">按分类筛选</label>
            <select 
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input 
                type="checkbox" 
                className="form-check-input"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showInactive">
                显示已下架的公告
              </label>
            </div>
          </div>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="card text-center">
          <p>暂无公告</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>标题</th>
                <th>分类</th>
                <th>发布时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id}>
                  <td>{announcement.title}</td>
                  <td>
                    <span 
                      className="badge"
                      style={{ 
                        backgroundColor: getCategoryColor(announcement.category),
                        color: 'white'
                      }}
                    >
                      {announcement.category}
                    </span>
                  </td>
                  <td>{announcement.publish_time}</td>
                  <td>
                    <span 
                      className={`badge ${announcement.is_active ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {announcement.is_active ? '已发布' : '已下架'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link 
                        to={`/admin/edit/${announcement.id}`} 
                        className="btn btn-sm"
                        style={{ marginRight: '5px' }}
                      >
                        编辑
                      </Link>
                      <button 
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '5px' }}
                        onClick={() => toggleActive(announcement.id, announcement.is_active)}
                      >
                        {announcement.is_active ? '下架' : '发布'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
