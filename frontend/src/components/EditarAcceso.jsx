import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './EditarAcceso.css';

const EditarAcceso = () => {
  const { dependienteId, accesoId } = useParams();
  const navigate = useNavigate();
  const [acceso, setAcceso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rol, setRol] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/accesos/${accesoId}/editar/`);
        if (response.data) {
          setAcceso(response.data);
          setRol(response.data.rol);
        } else {
          setError('No se recibieron datos del servidor');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.error || 
                            'Error cargando datos del acceso';
        setError(errorMessage);
        console.error('Error en la petición:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [dependienteId, accesoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/dependientes/${dependienteId}/accesos/${accesoId}/editar/`, { rol });
      if (response.data) {
        navigate(`/dependientes/${dependienteId}/accesos`);
      } else {
        setError('No se recibió respuesta del servidor');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error || 
                          'Error actualizando el acceso';
      setError(errorMessage);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!acceso) return <div className="error">Acceso no encontrado</div>;

  return (
    <div className="editar-acceso-container">
      <h2>Editar Permisos</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rol:</label>
          <select 
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="form-control"
          >
            <option value="Admin">Administrador</option>
            <option value="Editor">Editor</option>
            <option value="Lector">Lector</option>
          </select>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/dependientes/${dependienteId}/accesos`)}
            className="btn btn-cancel"
          >
            <FaTimes /> Cancelar
          </button>
          <button type="submit" className="btn btn-save">
            <FaSave /> Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarAcceso;