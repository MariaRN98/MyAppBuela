// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';
// import './Register.css';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     first_name: '',
//     last_name: '',
//     telefono: '',
//     password: '',
//     repetir_password: '',
//     fecha_nacimiento: '',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.password !== formData.repetir_password) {
//       setError('Las contraseñas no coinciden');
//       return;
//     }
//     try {
//       await api.post('/api/auth/register/', formData);
//       navigate('/login');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error en el registro');
//     }
//   };

//   return (
//     <div className="register-container">
//       <h1>Registro</h1>
//       {error && <p className="error">{error}</p>}
//       <form onSubmit={handleSubmit}>
//         <input name="username" placeholder="Usuario" onChange={handleChange} required />
//         <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
//         <input name="first_name" placeholder="Nombre" onChange={handleChange} required />
//         <input name="last_name" placeholder="Apellidos" onChange={handleChange} required />
//         <input name="telefono" placeholder="Móvil" onChange={handleChange} required />
//         <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required />
//         <input
//           name="repetir_password"
//           type="password"
//           placeholder="Repetir Contraseña"
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="fecha_nacimiento"
//           type="date"
//           placeholder="Fecha de Nacimiento"
//           onChange={handleChange}
//           required
//         />
//         <input name="foto_perfil" type="file" accept="image/*" onChange={handleChange} />
//         <div className="buttons">
//           <button type="submit">Aceptar</button>
//           <Link to="/login" className="cancel-btn">Cancelar</Link>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Register;


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
    foto_perfil: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'foto_perfil') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validación frontend básica
    const newErrors = {};
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
        // Manejo de errores del backend
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
            onChange={handleChange} 
            required 
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
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

        <div className="form-group">
          <label>Foto de Perfil</label>
          <input 
            name="foto_perfil" 
            type="file" 
            accept="image/*" 
            onChange={handleChange}
          />
          {errors.foto_perfil && (
            <span className="field-error">{errors.foto_perfil}</span>
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