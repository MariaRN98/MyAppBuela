import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NotaForm.css';

const NotaForm = ({ editMode }) => {
  const { dependienteId, notaId } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    cuerpo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (editMode) {
      const fetchNota = async () => {
        try {
          const response = await api.get(`/api/dependientes/${dependienteId}/notas/${notaId}/`);
          setFormData({
            titulo: response.data.titulo,
            cuerpo: response.data.cuerpo
          });
        } catch (err) {
          setError('Error al cargar la nota');
        }
      };
      fetchNota();
    }
  }, [dependienteId, notaId, editMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/api/dependientes/${dependienteId}/notas/${notaId}/`, formData);
      } else {
        await api.post(`/api/dependientes/${dependienteId}/notas/crear/`, {
          ...formData,
          dependiente: dependienteId
        });
      }
      navigate(`/dependientes/${dependienteId}/notas`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la nota');
    }
  };

  return (
    <div className="nota-form-container">
      <h2>{editMode ? 'Editar Nota' : 'Crear Nueva Nota'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título*</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Contenido*</label>
          <textarea
            value={formData.cuerpo}
            onChange={(e) => setFormData({...formData, cuerpo: e.target.value})}
            required
            rows={6}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            {editMode ? 'Actualizar' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}/notas`)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotaForm;