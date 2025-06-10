import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUtensils, FaPlus, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './NotasDependiente.css';

const NotasDependiente = () => {
  const { dependienteId } = useParams();
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/notas/`);
        setNotas(response.data);

        // Verifica rol del usuario
        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          access =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);
      } catch (err) {
        setError('Error al cargar las notas');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, [dependienteId]);

  const handleDelete = async (notaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta nota?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/notas/${notaId}/`);
        setNotas(notas.filter(nota => nota.id !== notaId));
      } catch (err) {
        setError('Error al eliminar la nota');
      }
    }
  };

  if (loading) return <div>Cargando notas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="notas-container">
      <div className="notas-header">
        <h2>Notas del Dependiente</h2>
      </div>

      <div className="notas-list">
        {notas.length === 0 ? (
          <p>No hay notas registradas</p>
        ) : (
          notas.map(nota => (
            <div key={nota.id} className="nota-card">
              <div className="nota-header">
                <h3>{nota.titulo}</h3>
                {canEdit && (
                  <div className="nota-actions">
                    <button
                      onClick={() => navigate(`/dependientes/${dependienteId}/notas/${nota.id}`)}
                      className="btn-edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(nota.id)}
                      className="btn-delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              <p className="nota-body">{nota.cuerpo}</p>
              <div className="nota-footer">
                <span className="nota-author">
                  Por: {nota.autor.nombre} {nota.autor.apellido}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón flotante para crear una nueva nota */}
      {canEdit && (
        <button
          onClick={() => navigate(`/dependientes/${dependienteId}/notas/crear`)}
          className="btn-float_nota"
        >
          <FaPlus />
        </button>
      )}
    </div>
  );
};

export default NotasDependiente;
