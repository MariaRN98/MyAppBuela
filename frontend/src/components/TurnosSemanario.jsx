import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaUserClock, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import api from '../services/api';
import './TurnosSemanario.css';

const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const horasDelDia = Array.from({ length: 24 }, (_, i) => i);

const TurnosSemanario = () => {
  const { dependienteId } = useParams();
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [turnosRes, usuariosRes] = await Promise.all([
          api.get(`/api/dependientes/${dependienteId}/turnos/`),
          api.get('/api/usuarios/')
        ]);
        setTurnos(turnosRes.data);
        setUsuarios(usuariosRes.data);

        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasAdminAccess = userAccess.some(
          (access) => access.dependienteId === parseInt(dependienteId) && access.rol === 'Admin'
        );
        setIsAdmin(hasAdminAccess);

      } catch (err) {
        setError('Error al cargar los turnos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dependienteId]);

  const cambiarSemana = (semanas) => {
    const nuevaFecha = new Date(semanaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + semanas * 7);
    setSemanaActual(nuevaFecha);
  };

  const getTurnosPorDiaYHora = (dia, hora) => {
    return turnos.filter(turno =>
      turno.dias_semana === dia &&
      parseInt(turno.hora_inicio.split(':')[0]) <= hora &&
      parseInt(turno.hora_fin.split(':')[0]) > hora
    );
  };

  const handleDelete = async (turnoId) => {
    if (window.confirm('¿Eliminar este turno?')) {
      try {
        await api.delete(`/api/dependientes/${dependienteId}/turnos/${turnoId}/`);
        setTurnos(turnos.filter(t => t.id !== turnoId));
      } catch (err) {
        setError('Error al eliminar el turno');
      }
    }
  };

  if (loading) return <div className="loading">Cargando turnos...</div>;
  if (error) return <div className="error">{error}</div>;

  // return (
  //   <div className="turnos-container">
  //     <div className="turnos-header">
  //       <h2><FaUserClock /> Semanario de Turnos</h2>
  //       {isAdmin && (
  //         <button
  //           onClick={() => navigate(`/dependientes/${dependienteId}/turnos/crear`)}
  //           className="btn-add"
  //         >
  //           <FaPlus /> Nuevo Turno
  //         </button>
  //       )}
  //     </div>

  //     <div className="semanario-scroll-container">
  //       <div className="semanario-inner">
  //         <div className="header-grid">
  //           <div className="hora-cell">Hora</div>
  //           {diasSemana.map(dia => (
  //             <div key={dia} className="dia-cell">{dia}</div>
  //           ))}
  //         </div>

  //         <div className="grid-container">
  //           {horasDelDia.map(hora => (
  //             <React.Fragment key={hora}>
  //               <div className="hora-cell">{hora}:00</div>
  //               {diasSemana.map(dia => {
  //                 const turnosCelda = getTurnosPorDiaYHora(dia, hora);
  //                 return (
  //                   <div key={`${dia}-${hora}`} className="celda">
  //                     {turnosCelda.map(turno => (
  //                       <div key={turno.id} className="turno-item">
  //                         <div className="turno-info">
  //                           <FaUser /> {usuarios.find(u => u.id === turno.usuario)?.first_name || 'Usuario'}
  //                         </div>
  //                         {isAdmin && (
  //                           <div className="turno-actions">
  //                             <button
  //                               onClick={(e) => {
  //                                 e.stopPropagation();
  //                                 navigate(`/dependientes/${dependienteId}/turnos/${turno.id}/editar`);
  //                               }}
  //                               className="btn-edit"
  //                             >
  //                               <FaEdit />
  //                             </button>
  //                             <button
  //                               onClick={(e) => {
  //                                 e.stopPropagation();
  //                                 handleDelete(turno.id);
  //                               }}
  //                               className="btn-delete"
  //                             >
  //                               <FaTrash />
  //                             </button>
  //                           </div>
  //                         )}
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
  <div className="turnos-container">
    <div className="turnos-header">
      <h2><FaUserClock /> Semanario de Turnos</h2>
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
                const turnosCelda = getTurnosPorDiaYHora(dia, hora);
                return (
                  <div key={`${dia}-${hora}`} className="celda">
                    {turnosCelda.map(turno => (
                      <div key={turno.id} className="turno-item">
                        <div className="turno-info">
                          <FaUser /> {usuarios.find(u => u.id === turno.usuario)?.first_name || 'Usuario'}
                        </div>
                        {isAdmin && (
                          <div className="turno-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dependientes/${dependienteId}/turnos/${turno.id}/editar`);
                              }}
                              className="btn-edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(turno.id);
                              }}
                              className="btn-delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
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

    {isAdmin && (
      <button
        onClick={() => navigate(`/dependientes/${dependienteId}/turnos/crear`)}
        className="btn-add-floating"
      >
        <FaPlus />
      </button>
    )}
  </div>
);
};

export default TurnosSemanario;
