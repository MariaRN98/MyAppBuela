import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './EditarDependiente.css';

const EditarDependiente = () => {
  const { dependienteId } = useParams();
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
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDependiente = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/`);
        setFormData({
          nombre: response.data.nombre,
          apellidos: response.data.apellidos,
          fecha_nacimiento: response.data.fecha_nacimiento.split('T')[0],
          movilidad: response.data.movilidad,
          enfermedades: response.data.enfermedades,
          alergias: response.data.alergias,
          vacunas: response.data.vacunas,
          medicamentos: response.data.medicamentos,
          foto_perfil: null
        });
        if (response.data.foto_perfil) {
          setPreview(response.data.foto_perfil);
        }
      } catch (err) {
        setError('Error al cargar el perfil');
      }
    };
    fetchDependiente();
  }, [dependienteId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, foto_perfil: file });
    
    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }

      await api.put(`/api/dependientes/${dependienteId}/gestionar/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/dependientes/${dependienteId}`);
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  return (
    <div className="editar-container">
      <h2>Editar Perfil</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
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
          <label>Foto de Perfil:</label>
          <div className="foto-upload">
            {preview && (
              <img src={preview} alt="Preview" className="foto-preview" />
            )}
            <input
              type="file"
              name="foto_perfil"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Movilidad:</label>
          <textarea
            name="movilidad"
            value={formData.movilidad}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Enfermedades:</label>
            <textarea
              name="enfermedades"
              value={formData.enfermedades}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Alergias:</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Vacunas:</label>
            <textarea
              name="vacunas"
              value={formData.vacunas}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Medicamentos:</label>
            <textarea
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Guardar Cambios
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}`)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarDependiente;