import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPills, FaEdit, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import api from '../services/api';

const ListaMedicamentos = () => {
  const { dependienteId } = useParams();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/medicamentos/`);
        setMedicamentos(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicamentos();
  }, [dependienteId]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este medicamento?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/medicamentos/${id}/`);
        setMedicamentos(medicamentos.filter(med => med.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="lista-medicamentos">
      <div className="header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <FaArrowLeft /> Volver
        </button>
        <h2><FaPills /> Lista de Medicamentos</h2>
        <button
          onClick={() => navigate(`/dependientes/${dependienteId}/medicamentos/crear`)}
          className="btn-add"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Dosis</th>
            <th>Día</th>
            <th>Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map(med => (
            <tr key={med.id}>
              <td>{med.medicamento}</td>
              <td>{med.dosis}</td>
              <td>{med.dias_semana}</td>
              <td>{med.hora.substring(0, 5)}</td>
              <td className="actions">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaMedicamentos;