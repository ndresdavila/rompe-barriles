import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Importa auth desde firebase.js
import { onAuthStateChanged } from "firebase/auth"; // Importa onAuthStateChanged de firebase

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Estado para autenticación

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // Usuario autenticado
      } else {
        setIsAuthenticated(false); // Usuario no autenticado
      }
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  // Mientras se verifica el estado de autenticación, no renderizamos nada
  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Podrías cambiar este mensaje o poner un spinner
  }

  // Si no está autenticado, redirige a la página de inicio
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si está autenticado, muestra el componente protegido
  return children;
};

export default ProtectedRoute;
