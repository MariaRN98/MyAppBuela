import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserClock, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './TurnoForm.css';

const TurnoForm = ({ editMode }) => {
  const { dependienteId, turnoId } = useParams();
  const [formData, setFormData] = useState({
    usuario: '',
    dias_semana: 'Lunes',
    hora_inicio: '08:00',
    hora_fin: '12:00'
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();



  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value,
  });
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const { data: usuariosConAcceso } = await api.get(
          `/api/dependientes/${dependienteId}/usuarios-con-acceso/`
        );
        
        if (!usuariosConAcceso || usuariosConAcceso.length === 0) {
          throw new Error('No hay cuidadores disponibles para este dependiente');
        }

        setUsuarios(usuariosConAcceso);

        if (editMode) {
          const { data: turno } = await api.get(
            `/api/dependientes/${dependienteId}/turnos/${turnoId}/`
          );
          
          const usuarioValido = usuariosConAcceso.some(
            u => u.id === turno.usuario
          );
          
          if (!usuarioValido && turno.usuario) {
            throw new Error('El cuidador asignado no tiene acceso actualmente');
          }

          setFormData({
            usuario: usuarioValido ? turno.usuario : '',
            dias_semana: turno.dias_semana,
            hora_inicio: turno.hora_inicio,
            hora_fin: turno.hora_fin
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dependienteId, turnoId, editMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        dependiente: dependienteId
      };

      if (editMode) {
        await api.put(
          `/api/dependientes/${dependienteId}/turnos/${turnoId}/`, 
          payload
        );
      } else {
        await api.post(
          `/api/dependientes/${dependienteId}/turnos/crear/`, 
          payload
        );
      }
      
      navigate(`/dependientes/${dependienteId}/turnos`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el turno');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="turno-form-container">
      <h2>
        <FaUserClock /> {editMode ? 'Editar Turno' : 'Crear Nuevo Turno'}
      </h2>
      
      {error && (
        <div className="alert error">
          {error}
          <button onClick={() => setError('')} className="close-btn">
            <FaTimes />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cuidador*</label>
          <select
            name="usuario"
            value={formData.usuario}
            onChange={(e) => setFormData({...formData, usuario: e.target.value})}
            required
            disabled={loading || usuarios.length === 0}
          >
            <option value="">{usuarios.length ? 'Seleccione un cuidador' : 'No hay cuidadores disponibles'}</option>
            {usuarios.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Día de la semana*</label>
          <select
            name="dias_semana"
            value={formData.dias_semana}
            onChange={handleChange}
            required
          >
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miercoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sabado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
        </div>
        
<div className="form-row">
  <div className="form-group">
    <label>Hora de inicio*</label>
    <input
      type="time"
      name="hora_inicio"
      value={formData.hora_inicio}
      onChange={handleChange}
      required
    />
  </div>
  
  <div className="form-group">
    <label>Hora de fin*</label>
    <input
      type="time"
      name="hora_fin"
      value={formData.hora_fin}
      onChange={handleChange}
      required
    />
  </div>
</div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}/turnos`)}
          >
            <FaTimes /> Cancelar
          </button>
          <button type="submit" className="btn-save">
            <FaSave /> {editMode ? 'Actualizar' : 'Guardar'}
          </button>

        </div>
      </form>
    </div>
  );
};

export default TurnoForm;