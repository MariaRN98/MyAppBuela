import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPills, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './FormularioMedicamento.css';

const FormularioMedicamento = ({ editMode }) => {
  const { dependienteId, medicamentoId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicamento: '',
    dosis: '',
    dias_semana: 'Lunes',
    hora: '08:00',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (editMode && medicamentoId) {
          const response = await api.get(`/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/`);
          setFormData({
            medicamento: response.data.medicamento,
            dosis: response.data.dosis,
            dias_semana: response.data.dias_semana,
            hora: response.data.hora.substring(0, 5),
          });
        }
      } catch (err) {
        setError(err.message || 'Error al cargar el medicamento');
        console.error("Error detallado:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editMode, medicamentoId, dependienteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        hora: `${formData.hora}:00`,
      };

      if (editMode) {
        await api.put(`/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/`, payload);
      } else {
        await api.post(`/api/dependientes/${dependienteId}/medicamentos/crear/`, payload);
      }
      navigate(`/dependientes/${dependienteId}/medicamentos`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el medicamento');
      console.error("Error en submit:", err.response?.data || err.message);
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
    <div className="form-medicamento-container">
      <h2>
        <FaPills /> {editMode ? 'Editar Medicamento' : 'Nuevo Medicamento'}
      </h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-btn">
            <FaTimes />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Medicamento*</label>
          <input
            type="text"
            name="medicamento"
            value={formData.medicamento}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Dosis*</label>
          <input
            type="text"
            name="dosis"
            value={formData.dosis}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Día de la Semana*</label>
          <select
            name="dias_semana"
            value={formData.dias_semana}
            onChange={handleChange}
            disabled={loading}
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

        <div className="form-group">
          <label>Hora*</label>
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-actions">
            <button
            type="button"
            onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos`)}
            className="btn-cancel"
            disabled={loading}
          >
            <FaTimes /> Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-save">
            {loading ? <FaSpinner className="spinner" /> : <FaSave />}
            {loading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}
          </button>

        </div>
      </form>
    </div>
  );
};

export default FormularioMedicamento;