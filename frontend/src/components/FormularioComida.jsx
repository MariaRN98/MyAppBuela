import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUtensils, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const FormularioComida = ({ editMode }) => {
  const { dependienteId, comidaId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    dias_semana: 'Lunes',
    tipo_comida: 'Desayuno',
    hora: '08:00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && comidaId) {
      const fetchComida = async () => {
        try {
          const response = await api.get(`/api/dependientes/${dependienteId}/comidas/${comidaId}/`);
          setFormData({
            ...response.data,
            hora: response.data.hora.substring(0, 5),
          });
        } catch (err) {
          console.error(err);
        }
      };
      fetchComida();
    }
  }, [editMode, comidaId, dependienteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        hora: `${formData.hora}:00`,
      };
      
      if (editMode) {
        await api.put(`/api/dependientes/${dependienteId}/comidas/${comidaId}/`, payload);
      } else {
        await api.post(`/api/dependientes/${dependienteId}/comidas/crear/`, payload);
      }
      navigate(`/dependientes/${dependienteId}/comidas`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-comida-container">
      <h2><FaUtensils /> {editMode ? 'Editar Comida' : 'Nueva Comida'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Día</label>
            <select
              value={formData.dias_semana}
              onChange={(e) => setFormData({...formData, dias_semana: e.target.value})}
            >
              {['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map(dia => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select
              value={formData.tipo_comida}
              onChange={(e) => setFormData({...formData, tipo_comida: e.target.value})}
            >
              {['Desayuno', 'Mediamañana', 'Almuerzo', 'Merienda', 'Cena'].map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hora</label>
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({...formData, hora: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioComida;