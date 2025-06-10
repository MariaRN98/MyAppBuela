import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUtensils, FaPlus, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import './ComidasSemanario.css';

const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const tiposComida = ['Desayuno', 'Mediamañana', 'Almuerzo', 'Merienda', 'Cena'];

const ComidasSemanario = () => {
  const { dependienteId } = useParams();
  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComidas = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/comidas/`);
        setComidas(response.data);

        // Verifica el rol del usuario
        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          (access) =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);
      } catch (err) {
        setError('Error al cargar las comidas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComidas();
  }, [dependienteId]);

  const handleDelete = async (comidaId) => {
    try {
      await api.delete(`/api/dependientes/${dependienteId}/comidas/${comidaId}/`);
      setComidas(comidas.filter((comida) => comida.id !== comidaId));
    } catch (err) {
      setError('Error al eliminar la comida');
      console.error(err);
    }
  };

  const handleMarcarComido = async (comidaId, comido) => {
    try {
      await api.patch(`/api/dependientes/${dependienteId}/comidas/${comidaId}/marcar-comido/`, {
        comido: !comido,
      });
      setComidas(
        comidas.map((c) => (c.id === comidaId ? { ...c, comido: !c.comido } : c))
      );
    } catch (err) {
      setError('Error al actualizar');
    }
  };

  if (loading) return <div>Cargando comidas...</div>;
  if (error) return <div className="error">{error}</div>;

  // return (
  //   <div className="comidas-container">
  //     <div className="comidas-header">
  //       <h2>
  //         <FaUtensils /> Planificación Semanal de Comidas
  //       </h2>
  //       {canEdit && (
  //         <button
  //           onClick={() => navigate(`/dependientes/${dependienteId}/comidas/crear`)}
  //           className="btn-add"
  //         >
  //           <FaPlus /> Nueva Comida
  //         </button>
  //       )}
  //     </div>

  //     <div className="semanario-scroll-container">
  //       <div className="semanario-inner">
  //         <div className="grid-container">
  //           <div className="tipo-comida-cell">Comida</div>
  //           {diasSemana.map((dia) => (
  //             <div key={`header-${dia}`} className="dia-cell">
  //               {dia}
  //             </div>
  //           ))}

  //           {tiposComida.map((tipo) => (
  //             <React.Fragment key={tipo}>
  //               <div className="tipo-comida-cell">{tipo}</div>
  //               {diasSemana.map((dia) => {
  //                 const comidasDia = comidas
  //                   .filter((c) => c.dias_semana === dia && c.tipo_comida === tipo)
  //                   .sort((a, b) => a.hora.localeCompare(b.hora));

  //                 return (
  //                   <div key={`${dia}-${tipo}`} className="celda">
  //                     {comidasDia.map((comida) => (
  //                       <div
  //                         key={comida.id}
  //                         className={`comida-item ${comida.comido ? 'completado' : ''}`}
  //                       >
  //                         <div className="comida-info">
  //                           <strong>{comida.nombre}</strong>
  //                           <span>{comida.hora.substring(0, 5)}</span>
  //                         </div>
  //                         <div className="comida-actions">
  //                           <button
  //                             onClick={() => handleMarcarComido(comida.id, comida.comido)}
  //                             className={`btn-check ${comida.comido ? 'active' : ''}`}
  //                           >
  //                             <FaCheck />
  //                           </button>
  //                           {canEdit && (
  //                             <>
  //                               <button
  //                                 onClick={() =>
  //                                   navigate(
  //                                     `/dependientes/${dependienteId}/comidas/${comida.id}/editar`
  //                                   )
  //                                 }
  //                                 className="btn-edit"
  //                               >
  //                                 <FaEdit />
  //                               </button>
  //                               <button
  //                                 onClick={() => handleDelete(comida.id)}
  //                                 className="btn-delete"
  //                               >
  //                                 <FaTrash />
  //                               </button>
  //                             </>
  //                           )}
  //                         </div>
  //                       </div>
  //                     ))}
  //                   </div>
  //                 );
  //               })}
  //             </React.Fragment>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
  <div className="comidas-container">
    <div className="comidas-header">
      <h2>
        <FaUtensils /> Planificación Semanal de Comidas
      </h2>
    </div>

    <div className="semanario-scroll-container">
      <div className="semanario-inner">
        <div className="grid-container">
          <div className="tipo-comida-cell">Comida</div>
          {diasSemana.map((dia) => (
            <div key={`header-${dia}`} className="dia-cell">
              {dia}
            </div>
          ))}

          {tiposComida.map((tipo) => (
            <React.Fragment key={tipo}>
              <div className="tipo-comida-cell">{tipo}</div>
              {diasSemana.map((dia) => {
                const comidasDia = comidas
                  .filter((c) => c.dias_semana === dia && c.tipo_comida === tipo)
                  .sort((a, b) => a.hora.localeCompare(b.hora));

                return (
                  <div key={`${dia}-${tipo}`} className="celda">
                    {comidasDia.map((comida) => (
                      <div
                        key={comida.id}
                        className={`comida-item ${comida.comido ? 'completado' : ''}`}
                      >
                        <div className="comida-info">
                          <strong>{comida.nombre}</strong>
                          <span>{comida.hora.substring(0, 5)}</span>
                        </div>
                        <div className="comida-actions">
                          <button
                            onClick={() => handleMarcarComido(comida.id, comida.comido)}
                            className={`btn-check ${comida.comido ? 'active' : ''}`}
                          >
                            <FaCheck />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dependientes/${dependienteId}/comidas/${comida.id}/editar`
                                  )
                                }
                                className="btn-edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(comida.id)}
                                className="btn-delete"
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

    {canEdit && (
      <button
        onClick={() => navigate(`/dependientes/${dependienteId}/comidas/crear`)}
        className="btn-add-floating"
      >
        <FaPlus />
      </button>
    )}
  </div>
);
};

export default ComidasSemanario;
