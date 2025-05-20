import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

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
      <h1>Tus Dependientes</h1>
      <ul>
        {dependientes.map((dependiente) => (
          <li key={dependiente.id}>
            <Link to={`/dependiente/${dependiente.id}`}>
              {dependiente.nombre} {dependiente.apellidos}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/crear-dependiente" className="add-btn">
        Añadir Dependiente
      </Link>
    </div>
  );
};

export default Dashboard;