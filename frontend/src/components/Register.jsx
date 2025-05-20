import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

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
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.repetir_password) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await api.post('/api/auth/register/', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro');
    }
  };

  return (
    <div className="register-container">
      <h1>Registro</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Usuario" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="first_name" placeholder="Nombre" onChange={handleChange} required />
        <input name="last_name" placeholder="Apellidos" onChange={handleChange} required />
        <input name="telefono" placeholder="Móvil" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
        <input
          name="repetir_password"
          type="password"
          placeholder="Repetir Contraseña"
          onChange={handleChange}
          required
        />
        <input
          name="fecha_nacimiento"
          type="date"
          placeholder="Fecha de Nacimiento"
          onChange={handleChange}
          required
        />
        <input name="foto_perfil" type="file" accept="image/*" onChange={handleChange} />
        <div className="buttons">
          <button type="submit">Aceptar</button>
          <Link to="/login" className="cancel-btn">Cancelar</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;