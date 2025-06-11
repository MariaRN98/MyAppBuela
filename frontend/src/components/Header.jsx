import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import api from '../services/api';
import './Header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));

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
        {userData?.foto_perfil ? (
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${userData.foto_perfil}`} 
            alt="Foto perfil" 
            className="profile-pic"
          />
        ) : (
          <div className="profile-pic">
            <FaUser/>
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