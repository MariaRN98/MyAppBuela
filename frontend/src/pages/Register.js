import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

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
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.repetir_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errData = await response.json();
        const errMsg = Object.values(errData).flat().join(', ');
        throw new Error(errMsg || 'Error al registrar usuario');
      }

      alert('Usuario registrado exitosamente');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Usuario*:</label><br />
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email*:</label><br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Nombre*:</label><br />
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Apellidos*:</label><br />
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Teléfono*:</label><br />
          <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
        </div>
        <div>
          <label>Contraseña*:</label><br />
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Repetir Contraseña*:</label><br />
          <input type="password" name="repetir_password" value={formData.repetir_password} onChange={handleChange} required />
        </div>
        <div>
          <label>Fecha de nacimiento:</label><br />
          <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
        </div>
        <div>
          <label>Foto de perfil:</label><br />
          <input type="file" name="foto_perfil" accept="image/*" onChange={handleChange} />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="button" onClick={() => navigate('/login')}>Cancelar</button>
          <button type="submit" style={{ marginLeft: '10px' }}>Registrarse</button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
