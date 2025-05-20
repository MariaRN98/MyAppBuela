import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaNotesMedical, FaCalendarAlt, FaPills, FaShoppingCart, FaUtensils } from 'react-icons/fa';

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { dependienteId } = useParams();

  const menuItems = [
    { path: 'notas', icon: <FaNotesMedical />, label: 'Notas' },
    { path: 'eventos', icon: <FaCalendarAlt />, label: 'Eventos' },
    { path: 'medicamentos', icon: <FaPills />, label: 'Medicamentos' },
    { path: 'compras', icon: <FaShoppingCart />, label: 'Compras' },
    { path: 'comidas', icon: <FaUtensils />, label: 'Comidas' }
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
              to={`/dependiente/${dependienteId}/${item.path}`}
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