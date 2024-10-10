import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // Usuario autenticado
      } else {
        setIsAuthenticated(false); // Usuario no autenticado
      }
    });

    return () => unsubscribe();
  }, []);

  // Mientras se verifica el estado de autenticación
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Mensaje de carga o spinner
  }

  // Si está autenticado, redirige a la página actual (ej. /menu)
  if (isAuthenticated) {
    return <Navigate to="/menu" />; // Redirigir a una página autenticada (ej. menú principal)
  }

  // Si no está autenticado, permite el acceso a la ruta pública
  return children;
};

export default PublicRoute;
