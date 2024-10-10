import { useState } from 'react';
import { useUser } from '../context/UserContext'; // Importa el contexto
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const GamePage = () => {
  const [numberInput, setNumberInput] = useState('');
  const [attempts, setAttempts] = useState(7);
  const [result, setResult] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);
  const { coins, updateCoins } = useUser(); // Usa el contexto
  const navigate = useNavigate(); // Crea la instancia de navigate

  const handleGuess = () => {
    // Generar el número aleatorio solo al inicio del juego
    if (randomNumber === null) {
      const newRandomNumber = Math.floor(Math.random() * 10) + 1;
      setRandomNumber(newRandomNumber);
    }

    if (parseInt(numberInput) === randomNumber) {
      setResult('¡Acertaste!');
      updateCoins(coins + 10); // Actualizar monedas
      setAttempts(7); // Reiniciar intentos
      setRandomNumber(null); // Reiniciar el número aleatorio para el próximo juego
    } else {
      setAttempts(attempts - 1);
      setResult(`¡Intenta de nuevo! El número es ${parseInt(numberInput) < randomNumber ? 'mayor' : 'menor'} que ${numberInput}.`);

      if (attempts === 1) {
        alert('Se han acabado los intentos. Reiniciando el juego.');
        setAttempts(7); // Reiniciar intentos
        updateCoins(coins > 0 ? coins - 5 : 0); // Actualizar monedas
        setRandomNumber(null); // Reiniciar el número aleatorio para el próximo juego
      }
    }
    setNumberInput(''); // Limpiar el input después de cada intento
  };

  return (
    <div className="game-page">
      <h2>Adivina el número (1-10)</h2>
      <input
        type="number"
        value={numberInput}
        onChange={(e) => setNumberInput(e.target.value)}
        min="1"
        max="10"
        style={{ appearance: 'none', WebkitAppearance: 'none' }}
      />
      <button onClick={handleGuess}>Enviar</button>
      {result && <p>{result}</p>}
      <p>Intentos restantes: {attempts}</p>
      <p>Monedas actuales: {coins}</p>
      <button onClick={() => navigate('/menu')}>Regresar al Menú Principal</button> {/* Botón de regresar al menú */}
    </div>
  );
};

export default GamePage;
