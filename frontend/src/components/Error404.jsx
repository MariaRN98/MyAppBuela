import React from 'react';
import { Link } from 'react-router-dom';
import './Error404.css';

const Error404 = () => {
  return (
    <div className="error-404-container">
      <h1>Error 404</h1>
      <p>La página que estás buscando no existe o no tienes acceso a ella.</p>
      <Link to="/dashboard" className="btn-volver">Volver al Dashboard</Link>
    </div>
  );
};

export default Error404;