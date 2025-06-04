import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaPills, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './MedicamentosSemanario.css';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const horasDelDia = Array.from({ length: 24 }, (_, i) => i); // De 0:00 a 23:00

const MedicamentosSemanario = () => {
  const { dependienteId } = useParams();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/medicamentos/`);
        setMedicamentos(response.data);
      } catch (err) {
        setError('Error al cargar los medicamentos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicamentos();
  }, [dependienteId]);

  const getMedicamentosPorDiaYHora = (dia, hora) => {
    return medicamentos.filter(med => 
      med.dias_semana === dia && 
      parseInt(med.hora.split(':')[0]) === hora
    );
  };

  const handleMarcarTomado = async (medicamentoId, tomado) => {
    try {
      await api.patch(
        `/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/marcar-tomado/`,
        { tomado: !tomado }
      );
      setMedicamentos(medicamentos.map(med => 
        med.id === medicamentoId ? { ...med, tomado: !med.tomado } : med
      ));
    } catch (err) {
      setError('Error al actualizar el estado');
    }
  };

const handleDelete = async (medicamentoId) => {
  if (window.confirm('¿Eliminar este medicamento?')) {
    try {
      await api.delete(`/api/dependientes/${dependienteId}/medicamentos/${medicamentoId}/eliminar/`);
      setMedicamentos(medicamentos.filter(m => m.id !== medicamentoId));
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError('Error al eliminar el medicamento');
    }
  }
};

  if (loading) return <div className="loading">Cargando medicamentos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="medicamentos-container">
      <div className="medicamentos-header">
        <h2><FaPills /> Semanario de Medicamentos</h2>
        <button 
          onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos/crear`)}
          className="btn-add"
        >
          <FaPlus /> Nuevo Medicamento
        </button>
      </div>

      <div className="semanario">
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
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos/${med.id}/editar`)}
                            className="btn-edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="btn-delete"
                          >
                            <FaTrash />
                          </button>
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
  );
};

export default MedicamentosSemanario;