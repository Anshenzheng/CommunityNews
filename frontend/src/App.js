import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import AnnouncementList from './components/AnnouncementList';
import AnnouncementDetail from './components/AnnouncementDetail';
import AdminDashboard from './components/AdminDashboard';
import AnnouncementForm from './components/AnnouncementForm';

function App() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <Link to="/" className="navbar-brand" onClick={() => setActiveTab('home')}>
              小区公告通知系统
            </Link>
            <ul className="navbar-nav">
              <li>
                <Link 
                  to="/" 
                  className={activeTab === 'home' ? 'active' : ''}
                  onClick={() => setActiveTab('home')}
                >
                  首页
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin" 
                  className={activeTab === 'admin' ? 'active' : ''}
                  onClick={() => setActiveTab('admin')}
                >
                  管理后台
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/" element={<AnnouncementList categories={categories} />} />
            <Route path="/announcement/:id" element={<AnnouncementDetail />} />
            <Route path="/admin" element={<AdminDashboard categories={categories} />} />
            <Route path="/admin/new" element={<AnnouncementForm categories={categories} />} />
            <Route path="/admin/edit/:id" element={<AnnouncementForm categories={categories} />} />
          </Routes>
        </main>

        <footer className="mt-5 py-3 text-center text-muted">
          <div className="container">
            <p>&copy; 2024 小区公告通知系统 | 简约社区正式风</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
