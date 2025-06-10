import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaSearch, FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './GestionAccesos.css';

const GestionAccesos = () => {
  const { dependienteId } = useParams();
  const [accesos, setAccesos] = useState([]);
  const [dependiente, setDependiente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [dependienteRes, accesosRes] = await Promise.all([
          api.get(`/api/dependientes/${dependienteId}/`),
          api.get(`/api/dependientes/${dependienteId}/accesos/`)
        ]);
        
        setDependiente(dependienteRes.data);

        // Ordenar accesos por rol (admin, editor, lector)
        const rolesOrden = ['admin', 'editor', 'lector'];
        const accesosOrdenados = accesosRes.data.sort((a, b) => {
          return rolesOrden.indexOf(a.rol.toLowerCase()) - rolesOrden.indexOf(b.rol.toLowerCase());
        });

        setAccesos(accesosOrdenados);
      } catch (err) {
        setError(err.message || 'Error cargando los datos de acceso');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [dependienteId]);

  const handleEditarRol = (accesoId) => {
    navigate(`/dependientes/${dependienteId}/accesos/${accesoId}/editar`);
  };

  const handleEliminarAcceso = async (accesoId) => {
    if (window.confirm('¿Estás seguro de que deseas revocar este acceso?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/accesos/${accesoId}/`);
        setAccesos(accesos.filter(a => a.id !== accesoId));
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar el acceso');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => setError('')} className="close-btn">
          <FaTimes />
        </button>
      </div>
    );
  }

  // return (
  //   <div className="gestion-accesos-container">
  //     <div className="acceso_header">
  //       <h2>
  //         <FaUser /> Gestión de Accesos
  //       </h2>
  //     </div>

  //     <div className="accesos-list">
  //       {accesos.length > 0 ? (
  //         <>
  //           <div className="table-header">
  //             <div>Usuario</div>
  //             <div>Rol</div>
  //             <div>Acciones</div>
  //           </div>

  //           {accesos.map(acceso => (
  //             <div key={acceso.id} className="acceso-item">
  //               <div className="usuario-info">
  //                 {acceso.usuario.first_name} {acceso.usuario.last_name}
  //               </div>
  //               <div className={`rol ${acceso.rol.toLowerCase()}`}>
  //                 {acceso.rol}
  //               </div>
  //               <div className="acciones">
  //                 <button 
  //                   onClick={() => handleEditarRol(acceso.id)}
  //                   className="btn-editar"
  //                   aria-label="Editar acceso"
  //                 >
  //                   <FaEdit /> <span>Editar</span>
  //                 </button>
  //                 <button
  //                   onClick={() => handleEliminarAcceso(acceso.id)}
  //                   className="btn-eliminar"
  //                   aria-label="Eliminar acceso"
  //                 >
  //                   <FaTrash /> <span>Eliminar</span>
  //                 </button>
  //                 <button
  //                   onClick={() => navigate(`/dependientes/${dependienteId}/usuarios/${acceso.usuario.id}`)}
  //                   className="btn-ver"
  //                   aria-label="Ver usuario"
  //                 >
  //                   <FaSearch /> <span>Ver</span>
  //                 </button>
  //               </div>
  //             </div>
  //           ))}
  //         </>
  //       ) : (
  //         <div className="no-accesos">
  //           No hay usuarios con acceso a este dependiente
  //         </div>
  //       )}
  //     </div>

  //     <div className="footer-actions">
  //       <button 
  //         onClick={() => navigate(`/dependientes/${dependienteId}`)}
  //         className="btn-cancelar"
  //       >
  //         <FaTimes /> Volver al dependiente
  //       </button>
  //       <button
  //         onClick={() => navigate(`/dependientes/${dependienteId}/accesos/nuevo`)}
  //         className="btn-agregar"
  //       >
  //         <FaPlus /> Agregar Usuario
  //       </button>
  //     </div>
  //   </div>
  // );
  return (
  <div className="gestion-accesos-container">
    <div className="acceso_header">
      <h2>
        <FaUser /> Gestión de Accesos
      </h2>
    </div>

    <div className="accesos-list">
      {accesos.length > 0 ? (
        <>
          <div className="table-header">
            <div>Usuario</div>
            <div>Rol</div>
            <div>Acciones</div>
          </div>

          {accesos.map(acceso => (
            <div key={acceso.id} className="acceso-item">
              <div className="usuario-info">
                {acceso.usuario.first_name} {acceso.usuario.last_name}
              </div>
              <div className={`rol ${acceso.rol.toLowerCase()}`}>
                {acceso.rol}
              </div>
              <div className="acciones">
                <button 
                  onClick={() => handleEditarRol(acceso.id)}
                  className="btn-editar"
                  aria-label="Editar acceso"
                >
                  <FaEdit /> 
                </button>
                <button
                  onClick={() => handleEliminarAcceso(acceso.id)}
                  className="btn-eliminar"
                  aria-label="Eliminar acceso"
                >
                  <FaTrash /> 
                </button>
                <button
                  onClick={() => navigate(`/dependientes/${dependienteId}/usuarios/${acceso.usuario.id}`)}
                  className="btn-ver"
                  aria-label="Ver usuario"
                >
                  <FaSearch /> 
                </button>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="no-accesos">
          No hay usuarios con acceso a este dependiente
        </div>
      )}
    </div>

    <button
      onClick={() => navigate(`/dependientes/${dependienteId}/accesos/nuevo`)}
      className="btn-add-floating"
    >
      <FaPlus />
    </button>
  </div>
);
};

export default GestionAccesos;