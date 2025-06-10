import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import api from '../services/api';
import './EditarPerfil.css';

const EditarPerfil = () => {
  const [usuario, setUsuario] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    foto_perfil: null,
    previewFoto: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const response = await api.get('/api/current-user/');
        setUsuario({
          ...response.data,
          previewFoto: response.data.foto_perfil || '',
          fecha_nacimiento: response.data.fecha_nacimiento?.split('T')[0] || ''
        });
      } catch (err) {
        setErrors({ general: 'Error cargando datos del usuario' });
      } finally {
        setLoading(false);
      }
    };
    cargarDatosUsuario();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
    // Limpiar errores cuando el usuario edita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUsuario(prev => ({
        ...prev,
        foto_perfil: file,
        previewFoto: URL.createObjectURL(file)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Validación de fecha de nacimiento
    if (usuario.fecha_nacimiento && usuario.fecha_nacimiento > today) {
      newErrors.fecha_nacimiento = 'La fecha no puede ser posterior a hoy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});
  
  // Validación frontend
  if (!validateForm()) {
    setIsSubmitting(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('first_name', usuario.first_name);
    formData.append('last_name', usuario.last_name);
    formData.append('email', usuario.email);
    formData.append('telefono', usuario.telefono);
    formData.append('fecha_nacimiento', usuario.fecha_nacimiento);
    
    if (usuario.foto_perfil instanceof File) {
      formData.append('foto_perfil', usuario.foto_perfil);
    }

    // ¡Falta esta línea crucial que hace la petición PUT!
    const response = await api.put('/api/current-user/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Verifica que la respuesta sea exitosa antes de navegar
    if (response.status === 200 || response.status === 201) {
      navigate('/perfil', { 
        state: { 
          mensaje: 'Perfil actualizado correctamente',
          tipo: 'exito'
        } 
      });
    } else {
      setErrors({ general: 'Error al actualizar el perfil' });
    }
  } catch (err) {
    if (err.response?.data) {
      const backendErrors = err.response.data;
      const formattedErrors = {};
      
      if (typeof backendErrors === 'object') {
        for (const key in backendErrors) {
          if (Array.isArray(backendErrors[key])) {
            formattedErrors[key] = backendErrors[key][0];
          } else if (typeof backendErrors[key] === 'string') {
            formattedErrors[key] = backendErrors[key];
          }
        }
      } else if (typeof backendErrors === 'string') {
        formattedErrors.general = backendErrors;
      }
      
      setErrors(formattedErrors);
    } else {
      setErrors({ general: 'Error de conexión con el servidor' });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="editar-perfil-container">
      <div className="editar-header">
        <h1><FaUser /> Editar Perfil</h1>
      </div>

      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}

      <form onSubmit={handleSubmit} className="form-editar">
        <div className="foto-perfil-group">
          <div className="foto-preview">
            {usuario.previewFoto ? (
              <img src={usuario.previewFoto} alt="Preview" />
            ) : (
              <div className="foto-placeholder">
                <FaUser size={50} />
              </div>
            )}
          </div>
          <label className="btn-cambiar-foto">
            <FaCamera /> Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {errors.foto_perfil && (
            <span className="field-error">{errors.foto_perfil}</span>
          )}
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            name="first_name"
            value={usuario.first_name}
            onChange={handleChange}
            required
          />
          {errors.first_name && (
            <span className="field-error">{errors.first_name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Apellidos</label>
          <input
            type="text"
            name="last_name"
            value={usuario.last_name}
            onChange={handleChange}
            required
          />
          {errors.last_name && (
            <span className="field-error">{errors.last_name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={usuario.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={usuario.telefono}
            onChange={handleChange}
          />
          {errors.telefono && (
            <span className="field-error">{errors.telefono}</span>
          )}
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={usuario.fecha_nacimiento}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Establece la fecha máxima como hoy
          />
          {errors.fecha_nacimiento && (
            <span className="field-error">{errors.fecha_nacimiento}</span>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-guardar-editar"
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="btn-cancelar"
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarPerfil;