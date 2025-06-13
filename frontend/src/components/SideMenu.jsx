

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaNotesMedical, FaCalendarAlt, FaPills, FaShoppingCart, FaUtensils, FaUserCircle, FaUserClock, FaIdCard } from 'react-icons/fa';

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { dependienteId } = useParams();

  useEffect(() => {

    const checkAdminAccess = () => {
      const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
      const hasAdminAccess = userAccess.some(
        (access) => access.dependienteId === parseInt(dependienteId) && access.rol === 'Admin'
      );
      setIsAdmin(hasAdminAccess);
    };

    checkAdminAccess();
  }, [dependienteId]);

  const menuItems = [
    { path: '', icon: <FaUserCircle />, label: 'Perfil' },
    { path: 'medicamentos', icon: <FaPills />, label: 'Medicamentos' },
    { path: 'comidas', icon: <FaUtensils />, label: 'Comidas' },
    { path: 'notas', icon: <FaNotesMedical />, label: 'Notas' },
    { path: 'compras', icon: <FaShoppingCart />, label: 'Compras' },
    { path: 'eventos', icon: <FaCalendarAlt />, label: 'Eventos' },
    { path: 'turnos', icon: <FaUserClock />, label: 'Turnos' },
    ...(isAdmin ? [{ path: 'accesos', icon: <FaIdCard />, label: 'Gestión de Acceso' }] : [])
  ];

  return (
    <>
      <button 
        className={`hamburger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-items">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={`/dependientes/${dependienteId}/${item.path}`}
              className="menu-item"
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default SideMenu;