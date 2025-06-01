import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import './VerUsuario.css';

const VerUsuario = () => {
  const { dependienteId, usuarioId } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const response = await api.get(`/api/usuarios/${usuarioId}/`);
        setUsuario(response.data);
      } catch (err) {
        setError('Error cargando datos del usuario');
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [usuarioId]);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!usuario) return <div className="error">Usuario no encontrado</div>;

  return (
    <div className="ver-usuario-container">
      <button onClick={() => navigate(`/dependientes/${dependienteId}/accesos`)} className="back-button">
        <FaArrowLeft /> Volver a gestión de accesos
      </button>

      <div className="user-header">
        <div className="avatar">
          {usuario.foto_perfil ? (
            <img src={usuario.foto_perfil} alt={`${usuario.first_name} ${usuario.last_name}`} />
          ) : (
            <FaUser size={60} />
          )}
        </div>
        <h1>{usuario.first_name} {usuario.last_name}</h1>
        <p className="username">@{usuario.username}</p>
      </div>

      <div className="user-details">
        <div className="detail-item">
          <FaEnvelope className="icon" />
          <div>
            <h3>Email</h3>
            <p>{usuario.email}</p>
          </div>
        </div>

        <div className="detail-item">
          <FaPhone className="icon" />
          <div>
            <h3>Teléfono</h3>
            <p>{usuario.telefono || 'No especificado'}</p>
          </div>
        </div>

        <div className="detail-item">
          <FaCalendarAlt className="icon" />
          <div>
            <h3>Fecha de nacimiento</h3>
            <p>{usuario.fecha_nacimiento || 'No especificada'}</p>
          </div>
        </div>
      </div>

      <div className="user-dependientes">
        <h2>Dependientes asociados</h2>
        {usuario.dependientes && usuario.dependientes.length > 0 ? (
          <div className="dependientes-list">
            {usuario.dependientes.map(dependiente => (
              <div key={dependiente.id} className="dependiente-card">
                <h3>{dependiente.nombre} {dependiente.apellidos}</h3>
                <p className={`rol ${dependiente.rol.toLowerCase()}`}>{dependiente.rol}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-dependientes">No tiene dependientes asociados</p>
        )}
      </div>
    </div>
  );
};

export default VerUsuario;