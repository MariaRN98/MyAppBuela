// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import './CreateDependiente.css';

// const CreateDependiente = () => {
//   const [formData, setFormData] = useState({
//     nombre: '',
//     apellidos: '',
//     fecha_nacimiento: '',
//     movilidad: '',
//     enfermedades: '',
//     alergias: '',
//     vacunas: '',
//     foto_perfil: null
//   });
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     setFormData({ ...formData, foto_perfil: e.target.files[0] });
//   };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setIsSubmitting(true);
//   setError('');
  
//   try {
//     const formDataToSend = new FormData();
//     Object.keys(formData).forEach(key => {
//       if (formData[key] !== null && formData[key] !== '') {
//         formDataToSend.append(key, formData[key]);
//       }
//     });

//     // 1. Crear el dependiente
//     await api.post('/api/dependientes/crear/', formDataToSend, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });

//     // 2. Obtener los accesos actualizados
//     const { data: nuevosAccesos } = await api.get('/api/auth/actualizar-localstorage/');
    
//     // 3. Actualizar localStorage manteniendo el mismo formato que en login
//     const userData = JSON.parse(localStorage.getItem('user'));
//     const updatedUserData = {
//       ...userData,
//       accesos: nuevosAccesos  // Ahora tiene el mismo formato que en el login
//     };
//     localStorage.setItem('user', JSON.stringify(updatedUserData));

//     // 4. Redirigir al dashboard con mensaje de éxito
//     navigate('/dashboard', { state: { successMessage: 'Dependiente creado correctamente' } });
    
//   } catch (err) {
//     console.error('Error al crear dependiente:', err);
//     setError(err.response?.data?.message || 'Error al crear el dependiente. Por favor, inténtalo de nuevo.');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   return (
//     <div className="create-dependiente-container">
//       <h1>Crear Nuevo Dependiente</h1>
//       {error && <div className="alert alert-danger">{error}</div>}
      
//       <form onSubmit={handleSubmit} className="dependiente-form">
//         <div className="form-group">
//           <label htmlFor="nombre">Nombre:</label>
//           <input
//             id="nombre"
//             type="text"
//             name="nombre"
//             value={formData.nombre}
//             onChange={handleChange}
//             required
//             className="form-control"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="apellidos">Apellidos:</label>
//           <input
//             id="apellidos"
//             type="text"
//             name="apellidos"
//             value={formData.apellidos}
//             onChange={handleChange}
//             required
//             className="form-control"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
//           <input
//             id="fecha_nacimiento"
//             type="date"
//             name="fecha_nacimiento"
//             value={formData.fecha_nacimiento}
//             onChange={handleChange}
//             required
//             className="form-control"
//             max={new Date().toISOString().split('T')[0]}
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="movilidad">Movilidad:</label>
//           <textarea
//             id="movilidad"
//             name="movilidad"
//             value={formData.movilidad}
//             onChange={handleChange}
//             className="form-control"
//             placeholder="Describa la movilidad del dependiente"
//             rows="3"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="enfermedades">Enfermedades:</label>
//           <textarea
//             id="enfermedades"
//             name="enfermedades"
//             value={formData.enfermedades}
//             onChange={handleChange}
//             className="form-control"
//             placeholder="Lista de enfermedades conocidas"
//             rows="3"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="alergias">Alergias:</label>
//           <textarea
//             id="alergias"
//             name="alergias"
//             value={formData.alergias}
//             onChange={handleChange}
//             className="form-control"
//             placeholder="Lista de alergias conocidas"
//             rows="3"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="vacunas">Vacunas:</label>
//           <textarea
//             id="vacunas"
//             name="vacunas"
//             value={formData.vacunas}
//             onChange={handleChange}
//             className="form-control"
//             placeholder="Historial de vacunación"
//             rows="3"
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="foto_perfil">Foto de perfil (opcional):</label>
//           <input
//             id="foto_perfil"
//             type="file"
//             name="foto_perfil"
//             onChange={handleFileChange}
//             accept="image/*"
//             className="form-control-file"
//           />
//         </div>

//         <div className="form-actions">
//           <button 
//             type="submit" 
//             className="btn btn-primary"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Creando...' : 'Crear Dependiente'}
//           </button>
//           <button 
//             type="button" 
//             className="btn btn-secondary"
//             onClick={() => navigate('/dashboard')}
//             disabled={isSubmitting}
//           >
//             Cancelar
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateDependiente;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Register.css'; // Reutiliza los estilos de registro

const CreateDependiente = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    movilidad: '',
    enfermedades: '',
    alergias: '',
    vacunas: '',
    foto_perfil: null,
    previewFoto: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // 1. Crear el dependiente
      await api.post('/api/dependientes/crear/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 2. Obtener los accesos actualizados
      const { data: nuevosAccesos } = await api.get('/api/auth/actualizar-localstorage/');

      // 3. Actualizar localStorage manteniendo el mismo formato que en login
      const userData = JSON.parse(localStorage.getItem('user'));
      const updatedUserData = {
        ...userData,
        accesos: nuevosAccesos // Ahora tiene el mismo formato que en el login
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      // 4. Redirigir al dashboard con mensaje de éxito
      navigate('/dashboard', { state: { successMessage: 'Dependiente creado correctamente' } });
    } catch (err) {
      console.error('Error al crear dependiente:', err);
      setError(err.response?.data?.message || 'Error al crear el dependiente. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Crear Nuevo Dependiente</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="foto-perfil-group">
        <div className="foto-preview">
          {formData.previewFoto ? (
            <img src={formData.previewFoto} alt="Preview" />
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
          Agregar foto
          <input
            type="file"
            name="foto_perfil"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        </label>
        {error && <span className="field-error">{error}</span>}
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Nombre*</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Apellidos*</label>
          <input
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento*</label>
          <input
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label>Movilidad*</label>
          <textarea
            name="movilidad"
            value={formData.movilidad}
            onChange={handleChange}
            placeholder="(Ejemplo: Puede caminar con ayuda, usa silla de ruedas, etc.)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Enfermedades*</label>
          <textarea
            name="enfermedades"
            value={formData.enfermedades}
            onChange={handleChange}
            placeholder="(Ejemplo: Diabetes, hipertensión, etc.)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Alergias*</label>
          <textarea
            name="alergias"
            value={formData.alergias}
            onChange={handleChange}
            placeholder="(Ejemplo: Alergia a la penicilina, al polen, etc.)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Vacunas*</label>
          <textarea
            name="vacunas"
            value={formData.vacunas}
            onChange={handleChange}
            placeholder="(Ejemplo: Vacuna contra la gripe, COVID-19, etc.)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Aceptar'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/dashboard')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDependiente;