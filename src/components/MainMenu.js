// src/components/MainMenu.js

import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importa el contexto

const MainMenu = () => {
  const { coins } = useUser(); // Usa el contexto

  return (
    <div>
      <h1>Menu Principal</h1>
      <Link to="/game">
        <button>Iniciar Juego</button>
      </Link>
      <Link to="/store">
        <button>Tienda de Premios</button>
      </Link>
      <div>
        <p>Monedas acumuladas: {coins}</p>
        {/* Manejo de premios puede ir aquí */}
      </div>
    </div>
  );
};

export default MainMenu;
