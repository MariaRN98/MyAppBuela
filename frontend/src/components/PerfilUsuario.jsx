import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaUsers, FaArrowLeft, FaPowerOff } from 'react-icons/fa';
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
        // Obtener datos del usuario
        const userResponse = await api.get('/api/current-user/');
        setUsuario(userResponse.data);
        
        // Obtener dependientes del usuario
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
      `✅ Tus datos se conservarán\n` +
      `🔒 No podrás iniciar sesión\n` +
      `📞 Contacta al administrador para reactivarla`
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
    <div className="perfil-container">
      {!mostrarDependientes ? (
        <>
          <div className="perfil-header">
            <h1><FaUser /> Mi Perfil</h1>
          </div>
          
          <div className="perfil-info">
            {usuario.foto_perfil && (
              <img 
                src={usuario.foto_perfil} 
                alt="Foto de perfil" 
                className="foto-perfil"
              />
            )}
            
            <div className="datos-usuario">
              <p><strong>Usuario:</strong> {usuario.username}</p>
              <p><strong>Email:</strong> {usuario.email}</p>
              <p><strong>Nombre:</strong> {usuario.first_name} {usuario.last_name}</p>
              <p><strong>Teléfono:</strong> {usuario.telefono || 'No especificado'}</p>
              <p><strong>Fecha Nacimiento:</strong> {usuario.fecha_nacimiento || 'No especificada'}</p>
            </div>
          </div>

           <div className="perfil-acciones">
            <button 
              onClick={() => navigate('/editar-perfil')}
              className="btn-editar"
            >
              <FaEdit /> Editar Perfil
            </button>
            
            <button 
              onClick={handleDesactivarCuenta}
              className="btn-desactivar"
            >
              <FaPowerOff /> Desactivar Cuenta
            </button>
            
            <button 
              onClick={() => setMostrarDependientes(true)}
              className="btn-dependientes"
            >
              <FaUsers /> Personas que cuido
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
            <h2><FaUsers /> Personas que cuido</h2>
            
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
                        onClick={() => navigate(`/dependientes/${dependiente.id}`)}
                        className="btn-ver"
                      >
                        Ver Perfil
                      </button>
                      
                      <button
                        onClick={() => handleEliminarDependiente(dependiente.id)}
                        className="btn-eliminar"
                      >
                        <FaTrash /> Dejar de cuidar
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