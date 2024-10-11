import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext'; 
import { useNavigate } from 'react-router-dom';

const GamePage = () => {
  const [playerY, setPlayerY] = useState(200);
  const [obstacles, setObstacles] = useState([]);
  const [coinsOnMap, setCoinsOnMap] = useState([]);
  const [isJumping, setIsJumping] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [bullets, setBullets] = useState([]);
  const { coins, updateCoins } = useUser(); 
  const navigate = useNavigate();
  
  const minCoinDistanceX = 50;
  const minCoinDistanceY = 30;

  const isTooCloseToOtherCoins = useCallback((newCoinX, newCoinY) => {
    return coinsOnMap.some(coin => {
      const distanceX = Math.abs(newCoinX - coin.x);
      const distanceY = Math.abs(newCoinY - coin.y);
      return distanceX < minCoinDistanceX && distanceY < minCoinDistanceY;
    });
  }, [coinsOnMap, minCoinDistanceX, minCoinDistanceY]);

  // Función para detectar colisiones entre el personaje y los obstáculos
  const detectCollision = useCallback(() => {
    return obstacles.some(obstacle => {
      const isCollision = 
        50 < obstacle.x + obstacle.width && // Verifica si el personaje (posición en X) está dentro del rango del obstáculo
        50 + 20 > obstacle.x && // Verifica si el personaje (ancho del personaje) choca con el obstáculo
        playerY < obstacle.y + obstacle.height && // Verifica si el personaje (posición en Y) está dentro del rango vertical del obstáculo
        playerY + 20 > obstacle.y; // Verifica si el personaje (altura) choca con el obstáculo
      return isCollision;
    });
  }, [obstacles, playerY]);

  useEffect(() => {
    let interval;
    if (isGameStarted && !isGamePaused) {
      interval = setInterval(() => {
        setObstacles((prev) => prev.map((obstacle) => ({ ...obstacle, x: obstacle.x - 5 })));
        setCoinsOnMap((prev) => prev.map((coin) => ({ ...coin, x: coin.x - 5 })));

        if (Math.random() < 0.05) {
          setObstacles((prev) => [...prev, { x: 400, y: 200, width: 20, height: 20 }]);
        }

        if (Math.random() < 0.05) {
          const newCoinY = Math.random() > 0.5 ? 150 : 200;
          if (!isTooCloseToOtherCoins(400, newCoinY)) {
            setCoinsOnMap((prev) => [...prev, { x: 400, y: newCoinY, radius: 10 }]);
          }
        }

        setBullets((prev) => prev.map((bullet) => ({ ...bullet, x: bullet.x + 10 })));

        setObstacles((prevObstacles) => prevObstacles.filter((obstacle, oIndex) => {
          let shouldKeep = true;

          bullets.forEach((bullet, bIndex) => {
            const isCollision = bullet.x < obstacle.x + obstacle.width &&
                                bullet.x + bullet.width > obstacle.x &&
                                bullet.y < obstacle.y + obstacle.height &&
                                bullet.y + bullet.height > obstacle.y;

            if (isCollision) {
              setBullets((prev) => prev.filter((_, i) => i !== bIndex));
              shouldKeep = false;
            }
          });

          return shouldKeep;
        }));

        setCoinsOnMap((prevCoins) => prevCoins.filter((coin, index) => {
          const isCollisionWithPlayer = coin.x < 70 && coin.x > 50 && playerY === coin.y;
          if (isCollisionWithPlayer) {
            updateCoins(coins + 1);
            return false;
          }
          return true;
        }));

        // Verificar colisión entre el personaje y los obstáculos
        if (detectCollision()) {
          alert('Perdiste! Reiniciando el juego...');
          startGame(); // Reinicia el juego después de la colisión
        }

      }, 100);
    }

    return () => clearInterval(interval);
  }, [isGameStarted, isGamePaused, bullets, playerY, coins, updateCoins, coinsOnMap, isTooCloseToOtherCoins, detectCollision]);

  useEffect(() => {
    if (isJumping) {
      setPlayerY(150);
      setTimeout(() => setPlayerY(200), 500);
      setIsJumping(false);
    }
  }, [isJumping]);

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && !isJumping) {
      setIsJumping(true);
    }
    if (e.code === 'KeyF') {
      setBullets((prev) => [...prev, { x: 60, y: playerY + 10, width: 5, height: 2 }]);
    }
  }, [isJumping, playerY]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Inicia el juego automáticamente al cargar
  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setIsGameStarted(true);
    setObstacles([]);
    setCoinsOnMap([]);
    setBullets([]);
    setIsGamePaused(false);
    setPlayerY(200);
  };

  const togglePause = () => {
    setIsGamePaused((prev) => !prev);
  };

  const endGame = () => {
    setIsGameStarted(false);
    setIsGamePaused(false);
    setObstacles([]);
    setCoinsOnMap([]);
    setBullets([]);
    setPlayerY(200);
    navigate('/menu'); // Redirecciona al menú
  };

  return (
    <div className="game-page">
      <h2>Juego de Monedas</h2>
      <p>Monedas actuales: {coins}</p>

      {isGameStarted && (
        <div className="game-screen">
          <div 
            className="player" 
            style={{ position: 'absolute', left: '50px', top: `${playerY}px`, width: '20px', height: '20px', background: 'blue' }} 
          />
          {obstacles.map((obstacle, index) => (
            <div
              key={index}
              style={{ position: 'absolute', left: `${obstacle.x}px`, top: `${obstacle.y}px`, width: '20px', height: '20px', background: 'red' }}
            />
          ))}
          {coinsOnMap.map((coin, index) => (
            <div
              key={index}
              style={{ position: 'absolute', left: `${coin.x}px`, top: `${coin.y}px`, width: '10px', height: '10px', background: 'gold', borderRadius: '50%' }}
            />
          ))}
          {bullets.map((bullet, index) => (
            <div
              key={index}
              style={{ position: 'absolute', left: `${bullet.x}px`, top: `${bullet.y}px`, width: '5px', height: '2px', background: 'black' }}
            />
          ))}
        </div>
      )}

      {isGameStarted && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '10px' }}>
          <button onClick={togglePause}>{isGamePaused ? 'Reanudar' : 'Pausar'}</button>
          <button onClick={endGame}>Terminar Partida</button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
