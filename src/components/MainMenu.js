import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { useUser } from '../context/UserContext'; // Importa el contexto
import { auth } from '../firebase'; // Importa Firebase Auth
import { signOut } from 'firebase/auth'; // Importa la función signOut

const MainMenu = () => {
  const { coins, tokens } = useUser(); // Usa el contexto
  const navigate = useNavigate(); // Crea la instancia de navigate

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión en Firebase
      navigate('/'); // Redirige a la página de inicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
        <p>Tokens acumulados: {tokens}</p> {/* Mostrar tokens */}
        <button onClick={handleLogout}>Cerrar Sesión</button> {/* Botón de cerrar sesión */}
      </div>
    </div>
  );
};

export default MainMenu;
