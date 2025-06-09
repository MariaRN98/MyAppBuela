import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaTimes, FaUser } from 'react-icons/fa';
import api from '../services/api';
import './AgregarUsuario.css';

const AgregarUsuario = () => {
  const { dependienteId } = useParams();
  const navigate = useNavigate();
  const [telefono, setTelefono] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buscarUsuario = async () => {
    if (!telefono) {
      setError('Por favor ingresa un número de teléfono');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/usuarios/buscar/?telefono=${telefono}`);
      if (response.data) {
        setUsuarioEncontrado(response.data);
        setError('');
      } else {
        setError('Usuario no encontrado');
        setUsuarioEncontrado(null);
      }
    } catch (err) {
      setError('Error buscando usuario');
      setUsuarioEncontrado(null);
    } finally {
      setLoading(false);
    }
  };

  const asignarAcceso = async () => {
    try {
      await api.post(`/api/dependientes/${dependienteId}/accesos/nuevo/`, {
        usuario: usuarioEncontrado.id,
        rol: 'Lector'
      });
      navigate(`/dependientes/${dependienteId}/accesos`);
    } catch (err) {
      setError('Error asignando acceso');
    }
  };

  return (
    <div className="agregar-usuario-container">
      <div className="nuevo_acceso_header">
        <h2>
          <FaUserPlus /> Agregar Usuario
        </h2>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <button onClick={buscarUsuario} disabled={loading}>
            <FaSearch /> {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

{usuarioEncontrado && (
  <div className="user-found-section">
    <div className="user-card">
      <div className="user-icon">
        {usuarioEncontrado.foto_perfil ? (
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${usuarioEncontrado.foto_perfil}`} 
            alt="Foto del usuario" 
            className="user-photo"
          />
        ) : (
          <FaUser size={40} />
        )}
      </div>
      <div className="user-info">
        <h3>{usuarioEncontrado.first_name} {usuarioEncontrado.last_name}</h3>
        <p>Teléfono: {usuarioEncontrado.telefono}</p>
        <p>Email: {usuarioEncontrado.email}</p>
      </div>
    </div>

    <div className="role-section">
      <h4>Asignar Rol:</h4>
      <div className="role-badge lector">Lector</div>
      <p className="role-description">
        Podrá ver la información pero no realizar modificaciones
      </p>
    </div>

    <div className="action-buttons">
      <button onClick={() => navigate(`/dependientes/${dependienteId}/accesos`)} className="cancel-btn">
        <FaTimes /> Cancelar
      </button>
      <button onClick={asignarAcceso} className="confirm-btn">
        <FaUserPlus /> Confirmar Acceso
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default AgregarUsuario;