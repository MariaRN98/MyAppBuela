import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const { dependienteId } = useParams(); // Obtén el ID del dependiente desde la URL
  const [rolUsuario, setRolUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); // Obtén el usuario desde localStorage
    if (!user) {
      setLoading(false);
      return;
    }

    // Busca el rol del usuario para el dependiente actual
    const accesos = user.accesos || []; // Asegúrate de que los accesos estén almacenados
    const accesoActual = accesos.find(
      (acceso) => acceso.dependienteId === parseInt(dependienteId)
    );

    if (accesoActual) {
      setRolUsuario(accesoActual.rol);
    }
    setLoading(false);
  }, [dependienteId]);

  if (loading) {
    return <div>Cargando...</div>; // Muestra un indicador de carga mientras se verifica el acceso
  }

  // Si no tiene rol o el rol no está permitido, redirige al 404
  if (!rolUsuario || (rolesPermitidos && !rolesPermitidos.includes(rolUsuario))) {
    return <Navigate to="/404" replace />;
  }

  return children; // Renderiza el componente si tiene acceso
};

export default ProtectedRoute;