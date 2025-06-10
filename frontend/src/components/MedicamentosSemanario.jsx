import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaPills, FaCheck, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './MedicamentosSemanario.css';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const horasDelDia = Array.from({ length: 24 }, (_, i) => i);

const MedicamentosSemanario = () => {
  const { dependienteId } = useParams();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Verificar rol de admin
        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasAdminAccess = userAccess.some(
          (access) => access.dependienteId === parseInt(dependienteId) && access.rol === 'Admin'
        );
        setIsAdmin(hasAdminAccess);

        // Cargar medicamentos
        const response = await api.get(`/api/dependientes/${dependienteId}/medicamentos/`);
        setMedicamentos(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar los medicamentos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dependienteId]);

  const getMedicamentosPorDiaYHora = (dia, hora) => {
    return medicamentos.filter(med => 
      med.dias_semana === dia && 
      parseInt(med.hora.split(':')[0]) === hora
    );
  };

  const handleMarcarTomado = async (medicamentoId, tomado) => {
    try {
      setLoading(true);
      await api.patch(
        `/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/marcar-tomado/`,
        { tomado: !tomado }
      );
      setMedicamentos(medicamentos.map(med => 
        med.id === medicamentoId ? { ...med, tomado: !med.tomado } : med
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medicamentoId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este medicamento?')) {
      try {
        setLoading(true);
        await api.delete(`/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/eliminar/`);
        setMedicamentos(medicamentos.filter(m => m.id !== medicamentoId));
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar el medicamento');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && medicamentos.length === 0) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Cargando medicamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => setError('')} className="btn-close">
          <FaTimes />
        </button>
      </div>
    );
  }

  return (
    <div className="medicamentos-container">
      <div className="medicamentos-header">
        <h2><FaPills /> Semanario de Medicamentos</h2>
        {isAdmin && (
          <button 
            onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos/crear`)}
            className="btn-add"
            disabled={loading}
          >
            {loading ? <FaSpinner className="spinner" /> : <FaPlus />}
            {loading ? 'Cargando...' : 'Nuevo Medicamento'}
          </button>
        )}
      </div>

      <div className="semanario-scroll-container">
        <div className="semanario-inner">
          <div className="header-grid">
            <div className="hora-cell">Hora</div>
            {diasSemana.map(dia => (
              <div key={dia} className="dia-cell">{dia}</div>
            ))}
          </div>

          <div className="grid-container">
            {horasDelDia.map(hora => (
              <React.Fragment key={hora}>
                <div className="hora-cell">{hora}:00</div>
                {diasSemana.map(dia => {
                  const medicamentosCelda = getMedicamentosPorDiaYHora(dia, hora);
                  return (
                    <div key={`${dia}-${hora}`} className="celda">
                      {medicamentosCelda.map(med => (
                        <div key={med.id} className={`medicamento-item ${med.tomado ? 'completado' : ''}`}>
                          <div className="medicamento-info">
                            <strong>{med.medicamento}</strong> ({med.dosis})
                          </div>
                          <div className="medicamento-actions">
                            <button
                              onClick={() => handleMarcarTomado(med.id, med.tomado)}
                              className={`btn-check ${med.tomado ? 'active' : ''}`}
                              disabled={loading}
                              aria-label={med.tomado ? 'Marcar como no tomado' : 'Marcar como tomado'}
                            >
                              <FaCheck />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos/${med.id}/editar`)}
                                  className="btn-edit"
                                  disabled={loading}
                                  aria-label="Editar medicamento"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(med.id)}
                                  className="btn-delete"
                                  disabled={loading}
                                  aria-label="Eliminar medicamento"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicamentosSemanario;