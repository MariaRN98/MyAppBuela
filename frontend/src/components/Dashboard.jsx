import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';
import { FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [dependientes, setDependientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDependientes = async () => {
      try {
        const response = await api.get('/api/dependientes/');
        setDependientes(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchDependientes();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1>Personas a tu cuidado</h1>
      <div className="dependientes-list">
        {dependientes.map((dependiente) => (
          <div className="dependiente-card" key={dependiente.id}>
            <h3>{dependiente.nombre} {dependiente.apellidos}</h3>
            <Link to={`/dependientes/${dependiente.id}`} className="dependiente-link">
              Ver detalles
            </Link>
          </div>
        ))}
      </div>
        <Link to="/crear-dependiente" className="add-btn">
          <FaPlus /> {/* Usa el ícono en lugar del carácter + */}
        </Link>
    </div>
  );
};

export default Dashboard;