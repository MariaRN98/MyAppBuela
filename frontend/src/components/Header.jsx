
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import api from '../services/api';
import './Header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(userData);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

useEffect(() => {
  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const response = await api.get('/api/current-user/');
      const updatedUser = {
        ...storedUser,         
        ...response.data      
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Error al obtener datos del usuario:', err);
    }
  };

  fetchUserData();
}, []);

  const getProfileImage = () => {
    if (user?.foto_perfil_url) return user.foto_perfil_url;
    if (user?.foto_perfil) {
      return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${user.foto_perfil}`;
    }
    return null;
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">
          <img 
            src="/logo.png" 
            alt="Logo"
            className="app-logo"
          />
          MyAppBuela
        </Link>
      </div>
        
      <div className="header-right" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {getProfileImage() ? (
          <img 
            src={user.foto_perfil}
            alt="Foto perfil" 
            className="profile-pic"
          />
        ) : (
          <div className="profile-pic">
            <FaUser />
          </div>
        )}
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <Link to="/perfil" className="dropdown-item">Mi Perfil</Link>
            <Link onClick={handleLogout} className="dropdown-item">Cerrar Sesión</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
