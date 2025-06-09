// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
// import api from '../services/api';
// import './VerUsuario.css';

// const VerUsuario = () => {
//   const { dependienteId, usuarioId } = useParams();
//   const navigate = useNavigate();
//   const [usuario, setUsuario] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const cargarUsuario = async () => {
//       try {
//         const response = await api.get(`/api/usuarios/${usuarioId}/`);
//         setUsuario(response.data);
//       } catch (err) {
//         setError('Error cargando datos del usuario');
//       } finally {
//         setLoading(false);
//       }
//     };
//     cargarUsuario();
//   }, [usuarioId]);

//   if (loading) return <div className="loading">Cargando...</div>;
//   if (error) return <div className="error">{error}</div>;
//   if (!usuario) return <div className="error">Usuario no encontrado</div>;

//   return (
//     <div className="ver-usuario-container">

//       <div className="user-header">
//         <div className="avatar">
//           {usuario.foto_perfil ? (
//             <img src={usuario.foto_perfil} alt={`${usuario.first_name} ${usuario.last_name}`} />
//           ) : (
//             <FaUser size={60} />
//           )}
//         </div>
//         <h1>{usuario.first_name} {usuario.last_name}</h1>
//         <p className="username">{usuario.username}</p>
//       </div>

//       <div className="user-details">
//         <div className="detail-item">
//           <FaEnvelope className="icon" />
//           <div>
//             <h3>Email</h3>
//             <p>{usuario.email}</p>
//           </div>
//         </div>

//         <div className="detail-item">
//           <FaPhone className="icon" />
//           <div>
//             <h3>Teléfono</h3>
//             <p>{usuario.telefono || 'No especificado'}</p>
//           </div>
//         </div>

//         <div className="detail-item">
//           <FaCalendarAlt className="icon" />
//           <div>
//             <h3>Fecha de nacimiento</h3>
//             <p>{usuario.fecha_nacimiento || 'No especificada'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerUsuario;

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
        setLoading(true);
        setError('');
        const response = await api.get(`/api/usuarios/${usuarioId}/`);
        setUsuario(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error cargando datos del usuario');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [usuarioId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => navigate(-1)} className="btn-volver">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="error-message">
        Usuario no encontrado
        <button onClick={() => navigate(-1)} className="btn-volver">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="ver-usuario-container">
      <button 
        onClick={() => navigate(`/dependientes/${dependienteId}/accesos`)} 
        className="btn-volver"
      >
        <FaArrowLeft /> Volver
      </button>

      <div className="user-header">
        <div className="avatar">
          {usuario.foto_perfil ? (
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${usuario.foto_perfil}`} 
              alt={`${usuario.first_name} ${usuario.last_name}`} 
            />
          ) : (
            <FaUser size={60} />
          )}
        </div>
        <h1>{usuario.first_name} {usuario.last_name}</h1>
        <p className="username">{usuario.username}</p>
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
            <p>
              {usuario.fecha_nacimiento 
                ? new Date(usuario.fecha_nacimiento).toLocaleDateString() 
                : 'No especificada'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerUsuario;