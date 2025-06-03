import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import api from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarioEventos.css';
import { useNavigate } from 'react-router-dom';

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
          tipo: evento.tipo_evento
        }));
        setEventos(eventosFormateados);
      } catch (err) {
        console.error('Error cargando eventos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [dependienteId]);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad'; // Color por defecto
    
    // Asigna colores según el tipo de evento
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
      default:
        backgroundColor = '#3498db';
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

  if (loading) return <div>Cargando calendario...</div>;

  return (
    <div className="calendario-container">
            <div className="calendario-header">
        <h2>Calendario de Eventos</h2>
        <button 
          onClick={() => navigate(`/dependientes/${dependienteId}/eventos`)} 
          className="btn-toggle-view"
        >
          Ver Lista
        </button>
      </div>
      <div className="calendario-wrapper">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          messages={{
            today: 'Hoy',
            previous: 'Anterior',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
          }}
          eventPropGetter={eventStyleGetter}
          defaultView="month"
          popup
          onSelectEvent={event => alert(`Detalles:\n${event.title}\n${event.desc}`)}
        />
      </div>
      
      <div className="leyenda">
        <h4>Leyenda:</h4>
        <div className="leyenda-item"><span className="color-cita"></span> Cita médica</div>
        <div className="leyenda-item"><span className="color-visita"></span> Visita</div>
        <div className="leyenda-item"><span className="color-cumple"></span> Cumpleaños</div>
        <div className="leyenda-item"><span className="color-otro"></span> Otros eventos</div>
      </div>
    </div>
  );
};

export default CalendarioEventos;