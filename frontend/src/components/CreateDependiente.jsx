import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateDependiente.css';

const CreateDependiente = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    movilidad: '',
    enfermedades: '',
    alergias: '',
    vacunas: '',
    medicamentos: '',
    foto_perfil: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, foto_perfil: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.post('/api/dependientes/crear/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // El backend automáticamente creará el Acceso con rol 'Admin'
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el dependiente');
      console.error('Error:', err);
    }
  };

  return (
    <div className="form-container">
      <h1>Crear Nuevo Dependiente</h1>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Apellidos:</label>
          <input
            type="text"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento:</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Movilidad:</label>
          <textarea
            name="movilidad"
            value={formData.movilidad}
            onChange={handleChange}
            placeholder="Describa la movilidad del dependiente"
          />
        </div>

        <div className="form-group">
          <label>Enfermedades:</label>
          <textarea
            name="enfermedades"
            value={formData.enfermedades}
            onChange={handleChange}
            placeholder="Lista de enfermedades conocidas"
          />
        </div>

        <div className="form-group">
          <label>Alergias:</label>
          <textarea
            name="alergias"
            value={formData.alergias}
            onChange={handleChange}
            placeholder="Lista de alergias conocidas"
          />
        </div>

        <div className="form-group">
          <label>Vacunas:</label>
          <textarea
            name="vacunas"
            value={formData.vacunas}
            onChange={handleChange}
            placeholder="Historial de vacunación"
          />
        </div>

        <div className="form-group">
          <label>Medicamentos:</label>
          <textarea
            name="medicamentos"
            value={formData.medicamentos}
            onChange={handleChange}
            placeholder="Medicación actual"
          />
        </div>

        <div className="form-group">
          <label>Foto de perfil (opcional):</label>
          <input
            type="file"
            name="foto_perfil"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Crear Dependiente</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDependiente;