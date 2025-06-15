import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarioEventos.css';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaPlus } from 'react-icons/fa';

const locales = {
  'es': esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarioEventos = () => {
  const { dependienteId } = useParams();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get(`/api/dependientes/${dependienteId}/eventos/`);
        const eventosFormateados = response.data.map(evento => ({
          id: evento.id,
          title: `${evento.tipo_evento}: ${evento.titulo}`,
          start: new Date(evento.fecha_inicio),
          end: evento.fecha_fin ? new Date(evento.fecha_fin) : new Date(evento.fecha_inicio),
          desc: evento.descripcion,
          tipo: evento.tipo_evento,
        }));
        setEventos(eventosFormateados);

        const userAccess = JSON.parse(localStorage.getItem('user'))?.accesos || [];
        const hasEditAccess = userAccess.some(
          access =>
            access.dependienteId === parseInt(dependienteId) &&
            (access.rol === 'Admin' || access.rol === 'Editor')
        );
        setCanEdit(hasEditAccess);

      } catch (err) {
        console.error('Error cargando eventos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [dependienteId]);

  const onNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
  switch(event.tipo) {
    case 'Cita medica':
      backgroundColor = '#e74c3c'; 
      break;
    case 'Visita':
      backgroundColor = '#2ecc71'; 
      break;
    case 'Cumpleaños':
      backgroundColor = '#f39c12'; 
      break;
    case 'Cura':
      backgroundColor = '#3498db'; 
      break;
    case 'Vacuna':
      backgroundColor = '#9b59b6'; 
      break;
    case 'Otros':
      backgroundColor = '#95a5a6'; 
      break;
    default:
      backgroundColor = '#95a5a6'; 
  }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
      },
    };
  };

    const handleAddEvent = () => {
    navigate(`/dependientes/${dependienteId}/eventos/crear`);
  };

  if (loading) return <div>Cargando calendario...</div>;

  return (
  <div className="calendario-container">
    <h2 className="calendario-titulo">Calendario de Eventos</h2>

    <div className="calendario-wrapper">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        date={currentDate}
        onNavigate={onNavigate}
        views={['month']}
        defaultView="month"
        //culture="es" si lo pongo en el formato español se descuadra el calendario :')
        messages={{
          previous: 'Anterior',
          next: 'Siguiente',
          today: 'Hoy',
          
        }}
        
        eventPropGetter={eventStyleGetter}

        popup
        onSelectEvent={event => alert(`Detalles:\n${event.title}\n${event.desc}`)}
      />
    </div>

    <div className="calendar-footer">
      <button
        onClick={() => navigate(`/dependientes/${dependienteId}/eventos`)}
        className="btn-toggle-view"
      >
        Ver Lista
      </button>
    </div>
      
<div className="leyenda">
  <h4>Leyenda:</h4>
  <div className="leyenda-item"><span className="color-cita"></span> Cita médica</div>
  <div className="leyenda-item"><span className="color-visita"></span> Visita</div>
  <div className="leyenda-item"><span className="color-cumple"></span> Cumpleaños</div>
  <div className="leyenda-item"><span className="color-cura"></span> Cura</div>
  <div className="leyenda-item"><span className="color-vacuna"></span> Vacuna</div>
  <div className="leyenda-item"><span className="color-otros"></span> Otros</div>
</div>

      {canEdit && (
        <button className="btn-add-floating" onClick={handleAddEvent}>
          <FaPlus />
        </button>
      )}

    </div>
  );
};

export default CalendarioEventos;