import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
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
        setError('Error cargando datos');
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
    if (window.confirm('¿Revocar este acceso?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/accesos/${accesoId}/`);
        setAccesos(accesos.filter(a => a.id !== accesoId));
      } catch (err) {
        setError('Error eliminando acceso');
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gestion-accesos-container">
      <div className="header">
        <h2>
          <FaUser /> Gestión de Accesos: {dependiente?.nombre} {dependiente?.apellidos}
        </h2>
      </div>

      <div className="accesos-list">
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
              >
                <FaEdit /> Editar
              </button>
              <button
                onClick={() => handleEliminarAcceso(acceso.id)}
                className="btn-eliminar"
              >
                <FaTrash /> Eliminar
              </button>
              <button
                onClick={() => navigate(`/dependientes/${dependienteId}/usuarios/${acceso.usuario.id}`)}
                className="btn-ver"
              >
                <FaSearch /> Ver
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-actions">
        <button 
          onClick={() => navigate(`/dependientes/${dependienteId}`)}
          className="btn-cancelar"
        >
          <FaTimes /> Cancelar
        </button>
        <button
          onClick={() => navigate(`/dependientes/${dependienteId}/accesos/nuevo`)}
          className="btn-agregar"
        >
          <FaPlus /> Agregar Usuario
        </button>
      </div>
    </div>
  );
};

export default GestionAccesos;