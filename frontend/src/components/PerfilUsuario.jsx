import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUsers, FaArrowLeft, FaPhone } from 'react-icons/fa';
import api from '../services/api';
import './PerfilUsuario.css';

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [mostrarDependientes, setMostrarDependientes] = useState(false);
  const [dependientes, setDependientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const userResponse = await api.get('/api/current-user/');
        setUsuario(userResponse.data);

        const dependientesResponse = await api.get('/api/dependientes-usuario/');
        setDependientes(dependientesResponse.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleDesactivarCuenta = async () => {
    if (window.confirm(
      `¿Desactivar tu cuenta?\n\n` +
      `Tus datos se conservarán\n` +
      `No podrás iniciar sesión\n` +
      `Contacta al administrador para reactivarla`
    )) {
      try {
        await api.post('/api/desactivar-cuenta/');
        navigate('/login');
      } catch (err) {
        console.error("Error desactivando cuenta:", err);
        alert('Ocurrió un error al desactivar la cuenta');
      }
    }
  };

  const handleEliminarDependiente = async (dependienteId) => {
    if (window.confirm('¿Dejar de cuidar a esta persona?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/eliminar-acceso/`);
        setDependientes(dependientes.filter(d => d.id !== dependienteId));
      } catch (err) {
        console.error("Error eliminando acceso:", err);
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!usuario) return <div className="error">Error cargando perfil</div>;

  return (
    <div className="register-container">
      {!mostrarDependientes ? (
        <>
          <h1>{usuario.first_name} {usuario.last_name}</h1>

          <div className="foto-perfil-group">
            <div className="foto-preview">
              {usuario.foto_perfil ? (
                <img 
                  src={usuario.foto_perfil} 
                  alt="Foto de perfil"
                />
              ) : (
                <div className="foto-placeholder">
                  <FaUser size={100} color="#777" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group-usu">
            <label>Usuario</label>
            <p>{usuario.username}</p>
          </div>

          <div className="form-group-usu">
            <label>Email</label>
            <p>{usuario.email}</p>
          </div>

          <div className="form-group-usu">
            <label>Teléfono</label>
            <p>{usuario.telefono || 'No especificado'}</p>
          </div>

          <div className="form-group-usu">
            <label>Fecha de Nacimiento</label>
            <p>
              {usuario.fecha_nacimiento 
                ? new Date(usuario.fecha_nacimiento).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : 'No especificada'}
            </p>
          </div>

          <div className="form-actions-usu">
          
            <button 
              onClick={handleDesactivarCuenta} 
              className="btn-delete-usu"
            > Desactivar Cuenta
            </button>
            <button 
              onClick={() => navigate('/editar-perfil')} 
              className="btn-edit-usu"
            > Editar Perfil
            </button>
            <button 
              onClick={() => setMostrarDependientes(true)} 
              className="btn-dependientes"
            >Personas que cuido
            </button>
          </div>
        </>
      ) : (
        <>
          <button 
            onClick={() => setMostrarDependientes(false)} 
            className="btn-volver"
          >
            <FaArrowLeft /> Volver al perfil
          </button>

          <div className="dependientes-container">
            <h1><FaUsers /> Personas que cuido</h1>

            {dependientes.length === 0 ? (
              <p>No tienes personas asignadas actualmente</p>
            ) : (
              <div className="lista-dependientes">
                {dependientes.map(dependiente => (
                  <div key={dependiente.id} className="dependiente-card">
                    <div className="dependiente-info">
                      <h3>{dependiente.nombre} {dependiente.apellidos}</h3>
                      <p><strong>Mi acceso:</strong> {dependiente.rol}</p>
                    </div>

                    <div className="dependiente-acciones">

                      <button
                        onClick={() => handleEliminarDependiente(dependiente.id)}
                        className="btn-eliminar"
                      > Dejar de cuidar
                      </button>

                      <button
                        onClick={() => navigate(`/dependientes/${dependiente.id}`)}
                        className="btn-ver"
                      >
                        Ver Perfil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PerfilUsuario;