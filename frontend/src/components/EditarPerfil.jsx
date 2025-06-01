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
  const [error, setError] = useState('');
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
        setError('Error cargando datos del usuario');
      } finally {
        setLoading(false);
      }
    };
    cargarDatosUsuario();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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

      const response = await api.put('/api/current-user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/perfil', { state: { mensaje: 'Perfil actualizado correctamente' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="editar-perfil-container">
      <div className="editar-header">
        <h1><FaUser /> Editar Perfil</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

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
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={usuario.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={usuario.fecha_nacimiento}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar">
            <FaSave /> Guardar Cambios
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