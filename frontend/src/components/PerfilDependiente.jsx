import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './PerfilDependiente.css';

const PerfilDependiente = () => {
  const { dependienteId } = useParams();
  const [dependiente, setDependiente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDependiente = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/`);
        setDependiente(response.data);

        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasAdminAccess = userAccess.some(
          (access) => access.dependienteId === parseInt(dependienteId) && access.rol === 'Admin'
        );
        setIsAdmin(hasAdminAccess);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDependiente();
  }, [dependienteId]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este perfil? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/gestionar/`);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al eliminar el perfil');
      }
    }
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dependiente) return <div className="error">Dependiente no encontrado</div>;

  return (
    <div className="register-container">
      <h1>{dependiente.nombre} {dependiente.apellidos}</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="foto-perfil-group">
        <div className="foto-preview">
          {dependiente.foto_perfil ? (
            <img 
              src={dependiente.foto_perfil_url} 
              alt={`${dependiente.nombre} ${dependiente.apellidos}`}
            />
          ) : (
            <div className="foto-placeholder">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="#777"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="form-group-dep">
        <label>Fecha de Nacimiento</label>
        <p>{new Date(dependiente.fecha_nacimiento).toLocaleDateString()}</p>
      </div>

      <div className="form-group-dep">
        <label>Movilidad</label>
        <p>{dependiente.movilidad}</p>
      </div>

      <div className="form-group-dep">
        <label>Enfermedades</label>
        <p>{dependiente.enfermedades}</p>
      </div>

      <div className="form-group-dep">
        <label>Alergias</label>
        <p>{dependiente.alergias}</p>
      </div>

      <div className="form-group-dep">
        <label>Vacunas</label>
        <p>{dependiente.vacunas}</p>
      </div>

      {isAdmin && (
        <div className="form-actions-dep" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <button onClick={handleDelete} className="btn-delete-dep">
            Eliminar
          </button>
          <button 
            onClick={() => navigate(`/dependientes/${dependienteId}/editar`)} 
            className="btn-edit-dep" 
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
};

export default PerfilDependiente;