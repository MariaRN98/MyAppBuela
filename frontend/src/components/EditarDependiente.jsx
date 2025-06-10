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
    foto_perfil: null,
    previewFoto: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        foto_perfil: response.data.foto_perfil || null, 
        previewFoto: '' 
      });
    } catch (err) {
      setError('Error al cargar el perfil');
    }
  };
  fetchDependiente();
}, [dependienteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'foto_perfil') {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        foto_perfil: file,
        previewFoto: file ? URL.createObjectURL(file) : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formDataToSend = new FormData();
    
    // Solo agregar campos que tienen valor
    const fields = ['nombre', 'apellidos', 'fecha_nacimiento', 'movilidad', 
                   'enfermedades', 'alergias', 'vacunas'];
    
    fields.forEach(field => {
      if (formData[field] !== null && formData[field] !== undefined) {
        formDataToSend.append(field, formData[field]);
      }
    });

    // Manejar la imagen solo si se seleccionó una nueva
    if (formData.foto_perfil instanceof File) {
      formDataToSend.append('foto_perfil', formData.foto_perfil);
    }



    const response = await api.put(
      `/api/dependientes/${dependienteId}/gestionar/`, 
      formDataToSend, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.status === 200) {
      navigate(`/dependientes/${dependienteId}`);
    } else {
      setError('Error al actualizar el perfil');
    }
  } catch (err) {
    console.error('Error detallado:', err.response?.data || err.message);
    setError(err.response?.data?.message || 'Error al actualizar el perfil');
  }
};

  return (
    <div className="register-container">
      <h1>Editar Perfil</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="foto-perfil-group-edep">
        <div className="foto-preview">
          {formData.previewFoto ? (
            <img
              src={formData.previewFoto}
              alt="Preview"
            />
          ) : formData.foto_perfil ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${formData.foto_perfil}`}
              alt="Foto actual"
            />
          ) : (
            <div className="foto-placeholder">
              {/* Ícono de usuario genérico */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="#777"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            </div>
          )}
        </div>
        <label className="btn-cambiar-foto">
          Cambiar foto
          <input
            type="file"
            name="foto_perfil"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>

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
            rows="3"
          />
        </div>

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

        <div className="form-group">
          <label>Vacunas:</label>
          <textarea
            name="vacunas"
            value={formData.vacunas}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-actions-edep">
          <button
            type="button"
            className="btn-cancel-edep"
            onClick={() => navigate(`/dependientes/${dependienteId}`)}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save-edep">
            Guardar
          </button>

        </div>
      </form>
    </div>
  );
};

export default EditarDependiente;