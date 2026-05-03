import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AnnouncementForm({ categories }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: categories[0] || '小区公告',
    author: '物业管理员',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchAnnouncement();
    }
  }, [id, isEditMode]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/announcements/${id}`);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        category: response.data.category,
        author: response.data.author,
        is_active: response.data.is_active
      });
    } catch (error) {
      console.error('获取公告失败:', error);
      setMessage('获取公告失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      setMessage('请填写所有必填字段');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditMode) {
        await axios.put(`/api/announcements/${id}`, formData);
        setMessage('公告更新成功');
      } else {
        await axios.post('/api/announcements', formData);
        setMessage('公告发布成功');
      }

      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('保存公告失败:', error);
      setMessage('保存公告失败，请稍后重试');
    } finally {
      setSaving(false);
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
      <Link to="/admin" className="btn btn-secondary mb-4">
        &larr; 返回管理后台
      </Link>

      <div className="card">
        <h2 className="mb-4">
          {isEditMode ? '编辑公告' : '发布新公告'}
        </h2>

        {message && (
          <div className={`card mb-4 ${message.includes('成功') ? 'bg-success text-white' : 'bg-danger text-white'}`}>
            <p className="m-0">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入公告标题"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">分类 *</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">内容 *</label>
            <textarea
              id="content"
              name="content"
              className="form-control"
              value={formData.content}
              onChange={handleChange}
              placeholder="请输入公告内容"
              required
              rows={10}
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">发布者</label>
            <input
              type="text"
              id="author"
              name="author"
              className="form-control"
              value={formData.author}
              onChange={handleChange}
              placeholder="请输入发布者名称"
            />
          </div>

          <div className="form-group form-check">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              className="form-check-input"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="is_active">
              立即发布
            </label>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn"
              disabled={saving}
            >
              {saving ? '保存中...' : (isEditMode ? '更新公告' : '发布公告')}
            </button>
            <Link to="/admin" className="btn btn-secondary">
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementForm;
