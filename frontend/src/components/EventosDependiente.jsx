import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './EventosDependiente.css';

const EventosDependiente = () => {
  const { dependienteId } = useParams();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/eventos/`);
        setEventos(response.data);

        // Verifica rol del usuario
        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          access =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);
      } catch (err) {
        setError('Error al cargar eventos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [dependienteId]);

  const handleDelete = async (eventoId) => {
    if (window.confirm('¿Eliminar este evento permanentemente?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/eventos/${eventoId}/`);
        setEventos(eventos.filter(evento => evento.id !== eventoId));
      } catch (err) {
        setError('Error al eliminar evento');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  if (loading) return <div className="loading">Cargando eventos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="eventos-container">
      <div className="eventos-header">
        <h2>
          <FaCalendarAlt /> Lista de Eventos
        </h2>
      </div>
      <button 
        onClick={() => navigate(`/dependientes/${dependienteId}/calendario`)} 
        className="btn-toggle-view"
      >
        <FaCalendarAlt /> Ver Calendario
      </button>

      <div className="eventos-list">
        {eventos.length === 0 ? (
          <p className="no-events">No hay eventos programados</p>
        ) : (
          eventos.map(evento => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <h3>{evento.titulo}</h3>
                <span className={`evento-type ${evento.tipo_evento.toLowerCase()}`}>
                  {evento.tipo_evento}
                </span>
              </div>
              
              <div className="evento-dates">
                <p>
                  <strong>Inicio:</strong> {formatDate(evento.fecha_inicio)}
                  {evento.fecha_inicio && ` a las ${new Date(evento.fecha_inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                </p>
                {evento.fecha_fin && (
                  <p>
                    <strong>Fin:</strong> {formatDate(evento.fecha_fin)}
                    {` a las ${new Date(evento.fecha_fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                  </p>
                )}
              </div>
              
              <p className="evento-desc">{evento.descripcion}</p>
              
              {canEdit && (
                <div className="evento-actions">
                  <button 
                    onClick={() => navigate(`/dependientes/${dependienteId}/eventos/${evento.id}/editar`)}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(evento.id)}
                    className="btn-delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botón flotante para crear un nuevo evento */}
      {canEdit && (
        <button 
          onClick={() => navigate(`/dependientes/${dependienteId}/eventos/crear`)}
          className="btn-float"
        >
          <FaPlus />
        </button>
      )}
    </div>
  );
};

export default EventosDependiente;