import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './EventoForm.css';

const EventoForm = ({ editMode }) => {
  const { dependienteId, eventoId } = useParams();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_evento: 'Cita medica'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const tiposEvento = [
    'Cita medica',
    'Visita',
    'Cumpleaños',
    'Cura',
    'Vacuna',
    'Otros'
  ];

  useEffect(() => {
    if (editMode) {
      const fetchEvento = async () => {
        try {
          const response = await api.get(`/api/dependientes/${dependienteId}/eventos/${eventoId}/`);
          const evento = response.data;
          setFormData({
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            fecha_inicio: evento.fecha_inicio.slice(0, 16),
            fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 16) : '',
            tipo_evento: evento.tipo_evento
          });
        } catch (err) {
          setError('Error al cargar evento');
        }
      };
      fetchEvento();
    }
  }, [dependienteId, eventoId, editMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const data = {
  //       ...formData,
  //       dependiente: dependienteId
  //     };

  //     if (editMode) {
  //       await api.put(`/api/dependientes/${dependienteId}/eventos/${eventoId}/`, data);
  //     } else {
  //       await api.post(`/api/dependientes/${dependienteId}/eventos/crear/`, data);
  //     }
  //     navigate(`/dependientes/${dependienteId}/eventos`);
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Error al guardar evento');
  //   }
  // };

// Función principal mejorada
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validación frontend
  if (!formData.titulo || !formData.tipo_evento || !formData.fecha_inicio) {
    return setError('Título, tipo y fecha de inicio son obligatorios');
  }

  try {
    const payload = {
      titulo: formData.titulo,
      descripcion: formData.descripcion || '', // Envía string vacío si es null
      tipo_evento: formData.tipo_evento,
      fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
      fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null
    };

    // Depuración
    console.log('Enviando:', JSON.stringify(payload, null, 2));

    const url = editMode 
      ? `/api/dependientes/${dependienteId}/eventos/${eventoId}/`
      : `/api/dependientes/${dependienteId}/eventos/crear/`;

    const method = editMode ? 'put' : 'post';
    
    await api[method](url, payload);
    navigate(`/dependientes/${dependienteId}/eventos`);

  } catch (err) {
    console.error('Error completo:', err.response);
    showBackendError(err);
  }
};

// Muestra errores del backend de forma legible
const showBackendError = (err) => {
  const backendError = err.response?.data;
  
  if (!backendError) {
    return setError('Error de conexión con el servidor');
  }

  // Maneja diferentes formatos de error
  if (typeof backendError === 'string') {
    setError(backendError);
  } else if (Array.isArray(backendError)) {
    setError(backendError.join('\n'));
  } else if (backendError.detail) {
    setError(backendError.detail);
  } else {
    // Para errores de serializer (ej: {"fecha_inicio": ["Este campo es requerido"]})
    const errorMessages = Object.entries(backendError)
      .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
      .join('\n');
    setError(errorMessages || 'Error desconocido');
  }
};

  return (
    <div className="evento-form-container">
      <h2>
        <FaCalendarAlt /> {editMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título:</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Tipo de Evento:</label>
          <select
            name="tipo_evento"
            value={formData.tipo_evento}
            onChange={handleChange}
            required
          >
            {tiposEvento.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fecha y Hora de Inicio:</label>
            <input
              type="datetime-local"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Fecha y Hora de Fin (opcional):</label>
            <input
              type="datetime-local"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            <FaSave /> {editMode ? 'Actualizar' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}/eventos`)}
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventoForm;