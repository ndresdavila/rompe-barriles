import { useState } from 'react';

const GamePage = () => {
  const [numberInput, setNumberInput] = useState('');
  const [attempts, setAttempts] = useState(7); // Cambiado a 7 intentos
  const [result, setResult] = useState(null);
  const [points, setPoints] = useState(100); // Agregar estado para los puntos

  const handleGuess = () => {
    const randomNumber = Math.floor(Math.random() * 10) + 1; // Número aleatorio del 1 al 10
    if (parseInt(numberInput) === randomNumber) {
      setResult('¡Acertaste!');
      setPoints(points + 10); // Aumentar puntos al acertar
      setAttempts(7); // Reiniciar intentos al acertar
    } else {
      setAttempts(attempts - 1);
      setResult('¡Intenta de nuevo!');

      // Si no hay más intentos, reiniciar el juego
      if (attempts === 1) {
        alert('Se han acabado los intentos. Reiniciando el juego.');
        setAttempts(7); // Reiniciar intentos
        setPoints(points > 0 ? points - 5 : 0); // Quitar puntos si hay intentos agotados
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
        style={{ appearance: 'none', WebkitAppearance: 'none' }} // Quitar las flechas
      />
      <button onClick={handleGuess}>Enviar</button>
      {result && <p>{result}</p>}
      <p>Intentos restantes: {attempts}</p>
      <p>Puntos actuales: {points}</p> {/* Mostrar puntos actuales */}
    </div>
  );
};

export default GamePage;
