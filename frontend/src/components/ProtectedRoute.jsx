import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const { dependienteId } = useParams(); 
  const [rolUsuario, setRolUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); 
    if (!user) {
      setLoading(false);
      return;
    }

    const accesos = user.accesos || []; 
    const accesoActual = accesos.find(
      (acceso) => acceso.dependienteId === parseInt(dependienteId)
    );

    if (accesoActual) {
      setRolUsuario(accesoActual.rol);
    }
    setLoading(false);
  }, [dependienteId]);

  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!rolUsuario || (rolesPermitidos && !rolesPermitidos.includes(rolUsuario))) {
    return <Navigate to="/404" replace />;
  }

  return children; 
};

export default ProtectedRoute;