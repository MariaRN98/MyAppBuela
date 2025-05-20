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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;