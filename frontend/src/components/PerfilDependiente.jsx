import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './PerfilDependiente.css';

const PerfilDependiente = () => {
  const { dependienteId } = useParams();
  const [dependiente, setDependiente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDependiente = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/`);
        setDependiente(response.data);
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

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!dependiente) return <div>No se encontró el dependiente</div>;

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h2>Perfil de {dependiente.nombre} {dependiente.apellidos}</h2>
        <div className="perfil-actions">
          <Link 
            to={`/dependientes/${dependienteId}/editar`}
            className="btn-edit"
          >
            Editar Perfil
          </Link>
          <button onClick={handleDelete} className="btn-delete">
            Eliminar Perfil
          </button>
        </div>
      </div>

      <div className="perfil-content">
        <div className="perfil-foto">
          {dependiente.foto_perfil ? (
            <img 
              src={dependiente.foto_perfil} 
              alt={`${dependiente.nombre} ${dependiente.apellidos}`}
            />
          ) : (
            <div className="avatar-placeholder">
              {dependiente.nombre.charAt(0)}{dependiente.apellidos.charAt(0)}
            </div>
          )}
        </div>

        <div className="perfil-info">
          <div className="info-group">
            <h3>Información Básica</h3>
            <p><strong>Nombre:</strong> {dependiente.nombre} {dependiente.apellidos}</p>
            <p><strong>Fecha de Nacimiento:</strong> {new Date(dependiente.fecha_nacimiento).toLocaleDateString()}</p>
            <p><strong>Edad:</strong> {calculateAge(dependiente.fecha_nacimiento)} años</p>
          </div>

          <div className="info-group">
            <h3>Salud</h3>
            <p><strong>Movilidad:</strong> {dependiente.movilidad || 'No especificado'}</p>
            <p><strong>Enfermedades:</strong> {dependiente.enfermedades || 'Ninguna conocida'}</p>
            <p><strong>Alergias:</strong> {dependiente.alergias || 'Ninguna conocida'}</p>
            <p><strong>Vacunas:</strong> {dependiente.vacunas || 'Al día'}</p>
            <p><strong>Medicamentos:</strong> {dependiente.medicamentos || 'Ninguno'}</p>
          </div>
        </div>
      </div>

      <div className="perfil-links">
        <Link to={`/dependientes/${dependienteId}/notas`} className="section-link">
          Ver Notas
        </Link>
        <Link to={`/dependientes/${dependienteId}/medicamentos`} className="section-link">
          Ver Medicamentos
        </Link>
        <Link to={`/dependientes/${dependienteId}/eventos`} className="section-link">
          Ver Eventos
        </Link>
      </div>
    </div>
  );
};

// Función auxiliar para calcular edad
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export default PerfilDependiente;