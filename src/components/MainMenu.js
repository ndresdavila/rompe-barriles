import { Link } from 'react-router-dom';

const MainMenu = () => {
  return (
    <div>
      <h1>Bienvenido al Juego de Adivinanza</h1>
      <Link to="/game">
        <button>Iniciar Juego</button>
      </Link>
      <Link to="/store">
        <button>Tienda de Premios</button>
      </Link>
      <p>Puntos acumulados: 0</p> {/* Aquí podrías mostrar los puntos obtenidos del backend */}
    </div>
  );
};

export default MainMenu;
