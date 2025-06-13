import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUtensils, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../services/api';
import './ListaComidas.css';

const ListaComidas = () => {
  const { dependienteId } = useParams();
  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComidas = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/comidas/`);
        setComidas(response.data);

        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          access =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);
      } catch (err) {
        setError('Error al cargar las comidas.');
      } finally {
        setLoading(false);
      }
    };

    fetchComidas();
  }, [dependienteId]);

  const handleDelete = async (comidaId) => {
    if (window.confirm('¿Eliminar esta comida permanentemente?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/comidas/${comidaId}`);
        setComidas(comidas.filter((comida) => comida.id !== comidaId));
      } catch (err) {
        setError('Error al eliminar la comida.');
      }
    }
  };

  if (loading) return <div className="loading">Cargando comidas...</div>;
  if (error) return <div className="error">{error}</div>;

return (
  <div className="lista-comidas-container">
    <div className="comidas-header">
      <h2>
        <FaUtensils /> Lista de Comidas
      </h2>
    </div>

    <button
      onClick={() => navigate(`/dependientes/${dependienteId}/comidas`)}
      className="btn-view-semanario"
    >
      <FaUtensils /> Ver Semanario
    </button>

    <div className="header-actions">
      {canEdit && (
        <button
          onClick={() => navigate(`/dependientes/${dependienteId}/comidas/crear`)}
          className="btn-add"
        >
          <FaPlus /> Nueva Comida
        </button>
      )}
    </div>

    <div className="comidas-list">
      {comidas.length === 0 ? (
        <p className="no-comidas">No hay comidas registradas</p>
      ) : (
        comidas.map((comida) => (
          <div key={comida.id} className="comida-card">
            <div className="comida-header">
              <h3>{comida.nombre}</h3>
              <span className="comida-type">{comida.tipo_comida}</span>
            </div>

            <div className="comida-dates">
              <p>
                <strong>Hora:</strong> {comida.hora}
              </p>
            </div>

            <p className="comida-desc">{comida.descripcion || 'Sin descripción'}</p>

            {canEdit && (
              <div className="comida-actions">
                <button
                  onClick={() => navigate(`/dependientes/${dependienteId}/comidas/${comida.id}/editar`)}
                  className="btn-edit"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => handleDelete(comida.id)}
                  className="btn-delete"
                >
                  <FaTrash /> Eliminar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>

    {canEdit && (
      <button
        onClick={() => navigate(`/dependientes/${dependienteId}/comidas/crear`)}
        className="btn-float"
      >
        <FaPlus />
      </button>
    )}
  </div>
);
};

export default ListaComidas;