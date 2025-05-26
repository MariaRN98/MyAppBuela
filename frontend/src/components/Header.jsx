import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Header.css';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user')); // Guardado durante el login

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/'); // Si tienes endpoint de logout
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
        <Link to="/dashboard" className="logo">MyAppBuela</Link>
      </div>
      
      <div 
        className="header-right" 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <img 
          src={userData?.foto_perfil || '/default-avatar.png'} 
          alt="Foto perfil" 
          className="profile-pic"
        />
        <span className="user-name">
          {userData?.first_name} {userData?.last_name}
        </span>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <Link to="/perfil" className="dropdown-item">Mi Perfil</Link>
            <Link to="/dashboard" className="dropdown-item">Lista de Dependientes</Link>
            <button onClick={handleLogout} className="dropdown-item">Cerrar Sesión</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;