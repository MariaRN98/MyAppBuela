import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserClock, FaSave, FaTimes } from 'react-icons/fa';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const horasDisponibles = Array.from({ length: 13 }, (_, i) => {
    const hora = i + 8; // De 8:00 a 20:00
    return `${hora.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuariosRes = await api.get('/api/usuarios/');
        setUsuarios(usuariosRes.data);
        
        if (editMode) {
          const turnoRes = await api.get(`/api/dependientes/${dependienteId}/turnos/${turnoId}/`);
          setFormData(turnoRes.data);
        }
      } catch (err) {
        setError('Error al cargar los datos');
      }
    };
    fetchData();
  }, [dependienteId, turnoId, editMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/api/dependientes/${dependienteId}/turnos/${turnoId}/`, formData);
      } else {
        await api.post(`/api/dependientes/${dependienteId}/turnos/crear/`, {
          ...formData,
          dependiente: dependienteId
        });
      }
      navigate(`/dependientes/${dependienteId}/turnos`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el turno');
    }
  };

  return (
    <div className="turno-form-container">
      <h2><FaUserClock /> {editMode ? 'Editar Turno' : 'Crear Nuevo Turno'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cuidador:</label>
          <select
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un cuidador</option>
            {usuarios.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Día de la semana:</label>
          <select
            name="dias_semana"
            value={formData.dias_semana}
            onChange={handleChange}
            required
          >
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
            <option value="Domingo">Domingo</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Hora de inicio:</label>
            <select
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              required
            >
              {horasDisponibles.map(hora => (
                <option key={`inicio-${hora}`} value={hora}>{hora}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Hora de fin:</label>
            <select
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleChange}
              required
            >
              {horasDisponibles.map(hora => (
                <option key={`fin-${hora}`} value={hora}>{hora}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            <FaSave /> {editMode ? 'Actualizar' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/dependientes/${dependienteId}/turnos`)}
          >
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TurnoForm;