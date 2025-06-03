import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateDependiente from './components/CreateDependiente';
import Header from './components/Header';
import NotasDependiente from './components/NotasDependiente';
import NotaForm from './components/NotaForm';
import DependienteLayout from './components/DependienteLayout';
import PerfilDependiente from './components/PerfilDependiente';
import EditarDependiente from './components/EditarDependiente';
import EventosDependiente  from './components/EventosDependiente';
import EventoForm  from './components/EventoForm';
import CalendarioEventos from './components/CalendarioEventos';
import ListaCompras from './components/ListaCompras';
import CompraForm from './components/CompraForm';
import TurnoForm from './components/TurnoForm';
import TurnosSemanario from './components/TurnosSemanario';
import MedicamentosSemanario from './components/MedicamentosSemanario';
import FormularioMedicamento from './components/FormularioMedicamento';
import ListaMedicamentos from './components/ListaMedicamentos';
import ComidasSemanario from './components/ComidasSemanario';
import FormularioComida from './components/FormularioComida';
import PerfilUsuario from './components/PerfilUsuario';
import EditarPerfil from './components/EditarPerfil';
import GestionAccesos from './components/GestionAccesos';
import EditarAcceso from './components/EditarAcceso';
import VerUsuario from './components/VerUsuario';
import AgregarUsuario from './components/AgregarUsuario';
import Error404 from './components/Error404';
import ProtectedRoute from './components/ProtectedRoute';

// Layout que incluye el Header
const LayoutWithHeader = () => (
  <>
    <Header />
    <Outlet /> {/* Esto renderizará las rutas hijas */}
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas SIN Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Error404 />} />
        
        {/* Rutas CON Header */}
        <Route element={<LayoutWithHeader />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crear-dependiente" element={<CreateDependiente />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/" element={<Dashboard />} />
        </Route>

                {/* Rutas con menú de dependiente */}
        {/* <Route path="/dependientes" element={
              <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
                <DependienteLayout />
              </ProtectedRoute>
            }>
          <Route path=":dependienteId/notas" element={<ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}><NotasDependiente /></ProtectedRoute>} />
          <Route path=":dependienteId/notas/crear" element={<NotaForm editMode={false} />} />
          <Route path=":dependienteId/notas/:notaId" element={<NotaForm editMode={true} />} />
          <Route path=":dependienteId" element={<PerfilDependiente />} />
          <Route path=":dependienteId/editar" element={<EditarDependiente />} />
          <Route path=":dependienteId/eventos" element={<EventosDependiente />} />
          <Route path=":dependienteId/eventos/crear" element={<EventoForm editMode={false} />} />
          <Route path=":dependienteId/eventos/:eventoId/editar" element={<EventoForm editMode={true} />} />
          <Route path=":dependienteId/calendario" element={<CalendarioEventos />} />
          <Route path=":dependienteId/compras" element={<ListaCompras />} />
          <Route path=":dependienteId/compras/crear" element={<CompraForm editMode={false} />} />
          <Route path=":dependienteId/compras/:compraId/editar" element={<CompraForm editMode={true} />} />
          <Route path=":dependienteId/turnos" element={<TurnosSemanario />} />
          <Route path=":dependienteId/turnos/crear" element={<TurnoForm editMode={false} />} />
          <Route path=":dependienteId/turnos/:turnoId/editar" element={<TurnoForm editMode={true} />} />
          <Route path=":dependienteId/medicamentos" element={<MedicamentosSemanario />} />
          <Route path=":dependienteId/medicamentos/crear" element={<FormularioMedicamento editMode={false} />} />
          <Route path=":dependienteId/medicamentos/:medicamentoId/editar" element={<FormularioMedicamento editMode={true} />} />
          <Route path=":dependienteId/medicamentos/lista" element={<ListaMedicamentos />} />
          <Route path=":dependienteId/comidas" element={<ComidasSemanario />} />
          <Route path=":dependienteId/comidas/crear" element={<FormularioComida editMode={false} />} />
          <Route path=":dependienteId/comidas/:comidaId/editar" element={<FormularioComida editMode={true} />} />
          <Route path=":dependienteId/accesos" element={
              <ProtectedRoute rolesPermitidos={['Admin']}>
                <GestionAccesos />
              </ProtectedRoute>
            } />
          <Route path=":dependienteId/accesos/:accesoId/editar" element={<EditarAcceso />} />
          <Route path=":dependienteId/usuarios/:usuarioId" element={<VerUsuario />} />
          <Route path=":dependienteId/accesos/nuevo" element={<AgregarUsuario />} />
        </Route> */}

        <Route path="/dependientes" element={
  <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
    <DependienteLayout />
  </ProtectedRoute>
}>
  <Route path=":dependienteId/notas" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <NotasDependiente />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/notas/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <NotaForm editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/notas/:notaId" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <NotaForm editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <PerfilDependiente />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <EditarDependiente />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/eventos" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <EventosDependiente />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/eventos/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <EventoForm editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/eventos/:eventoId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <EventoForm editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/calendario" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <CalendarioEventos />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/compras" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <ListaCompras />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/compras/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <CompraForm editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/compras/:compraId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <CompraForm editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/turnos" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <TurnosSemanario />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/turnos/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <TurnoForm editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/turnos/:turnoId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <TurnoForm editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/medicamentos" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <MedicamentosSemanario />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/medicamentos/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <FormularioMedicamento editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/medicamentos/:medicamentoId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <FormularioMedicamento editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/medicamentos/lista" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <ListaMedicamentos />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/comidas" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <ComidasSemanario />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/comidas/crear" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <FormularioComida editMode={false} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/comidas/:comidaId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <FormularioComida editMode={true} />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/accesos" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <GestionAccesos />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/accesos/:accesoId/editar" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor']}>
      <EditarAcceso />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/usuarios/:usuarioId" element={
    <ProtectedRoute rolesPermitidos={['Admin', 'Editor', 'Lector']}>
      <VerUsuario />
    </ProtectedRoute>
  } />
  <Route path=":dependienteId/accesos/nuevo" element={
    <ProtectedRoute rolesPermitidos={['Admin']}>
      <AgregarUsuario />
    </ProtectedRoute>
  } />
</Route>

      </Routes>
    </Router>
  );
}

export default App;