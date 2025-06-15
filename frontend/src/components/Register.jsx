import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefono: '',
    password: '',
    repetir_password: '',
    fecha_nacimiento: '',
    foto_perfil: null,
    previewFoto: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const evaluatePasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength += 1; 
  if (/[A-Z]/.test(password)) strength += 1; 
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1; 
  if (/[^A-Za-z0-9]/.test(password)) strength += 1; 

  return strength;
};

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
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};

    if (passwordStrength < 3) {
      newErrors.password = 'La contraseña debe ser al menos aceptable.';
    }

    if (formData.password !== formData.repetir_password) {
      newErrors.repetir_password = 'Las contraseñas no coinciden';
    }

    const today = new Date();
    const birthDate = new Date(formData.fecha_nacimiento);
    if (birthDate > today) {
      newErrors.fecha_nacimiento = 'La fecha no puede ser futura';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      }

      const response = await api.post('/api/auth/register/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        navigate('/login', { state: { registrationSuccess: true } });
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

  return (
    <div className="register-container">
      <h1>Registro</h1>

      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="foto-perfil-group">
        <div className="foto-preview">
          {formData.previewFoto ? (
            <img src={formData.previewFoto} alt="Preview" />
          ) : (
            <div className="foto-placeholder">
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
          Agregar foto
          <input
            type="file"
            name="foto_perfil"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </label>
        {errors.foto_perfil && <span className="field-error">{errors.foto_perfil}</span>}
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Usuario*</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Email*</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Nombre*</label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          {errors.first_name && <span className="field-error">{errors.first_name}</span>}
        </div>

        <div className="form-group">
          <label>Apellidos*</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          {errors.last_name && <span className="field-error">{errors.last_name}</span>}
        </div>

        <div className="form-group">
          <label>Teléfono*</label>
          <input
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
          {errors.telefono && <span className="field-error">{errors.telefono}</span>}
        </div>

        <div className="form-group">
          <label>Contraseña*</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              handleChange(e);
              setPasswordStrength(evaluatePasswordStrength(e.target.value)); 
            }}
            required
          />
          {errors.password && <span className="field-error">{errors.password}</span>}

          <div className="password-strength-bar">
            <div
              className={`strength-level strength-${passwordStrength}`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            ></div>
          </div>
          <p className="password-strength-text">
            {passwordStrength === 1 && "Muy débil"}
            {passwordStrength === 2 && "Débil"}
            {passwordStrength === 3 && "Aceptable"}
            {passwordStrength === 4 && "Fuerte"}
            {passwordStrength === 5 && "Muy fuerte"}
          </p>
        </div>

        <div className="form-group">
          <label>Repetir Contraseña*</label>
          <input
            name="repetir_password"
            type="password"
            value={formData.repetir_password}
            onChange={handleChange}
            required
          />
          {errors.repetir_password && (
            <span className="field-error">{errors.repetir_password}</span>
          )}
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento*</label>
          <input
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
          {errors.fecha_nacimiento && (
            <span className="field-error">{errors.fecha_nacimiento}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
          <Link to="/login" className="cancel-btn">Cancelar</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;