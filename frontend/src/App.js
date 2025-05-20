// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import CreateDependiente from './components/CreateDependiente';
// import Header from './components/Header';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/crear-dependiente" element={<CreateDependiente />} />
//         <Route path="/" element={<Login />} />  // Ruta por defecto
//       </Routes>
//     </Router>
//   );
// }

// export default App;

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
        
        {/* Rutas CON Header */}
        <Route element={<LayoutWithHeader />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crear-dependiente" element={<CreateDependiente />} />
          <Route path="/perfil" element={<div>Perfil del Usuario</div>} />
          <Route path="/" element={<Dashboard />} />
          {/* <Route path="/dependientes/:dependienteId/notas" element={<NotasDependiente />} />
<Route path="/dependientes/:dependienteId/notas/crear" element={<NotaForm editMode={false} />} />
<Route path="/dependientes/:dependienteId/notas/:notaId" element={<NotaForm editMode={true} />} /> */}
        </Route>

                {/* Rutas con menú de dependiente */}
        <Route path="/dependiente" element={<DependienteLayout />}>
          <Route path=":dependienteId/notas" element={<NotasDependiente />} />
          <Route path=":dependienteId/notas/crear" element={<NotaForm editMode={false} />} />
          <Route path=":dependienteId/notas/:notaId" element={<NotaForm editMode={true} />} />
          {/* Añade aquí el resto de rutas de dependiente */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;