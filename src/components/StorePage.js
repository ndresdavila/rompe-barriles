import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext'; // Importa el contexto
import { auth } from '../firebase'; // Asegúrate de importar auth
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate de importar db
import { Link } from 'react-router-dom';

const StorePage = () => {
  // eslint-disable-next-line no-unused-vars
  const { coins, updateCoins, prizes, updatePrizes } = useUser(); // Usa el contexto
  const [userPrizes, setUserPrizes] = useState([]); // Estado para premios del usuario

  const prizeCost = 30; // Costo de los premios
  const sellPrice = 20; // Precio de venta de los premios
  const allPrizes = Array.from({ length: 5 }, (_, i) => `Premio ${i + 1}`); // Define los premios disponibles

  // Cargar premios del usuario al iniciar la página
  useEffect(() => {
    const loadUserPrizes = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const prizes = userDoc.data().prizes || []; // Cargar premios del usuario
          setUserPrizes(prizes);
        }
      }
    };

    loadUserPrizes();
  }, []);

  // Función para comprar un premio
  const buyPrize = async (prize) => {
    if (coins >= prizeCost) {
      if (!userPrizes.includes(prize)) { // Verificar si el usuario ya tiene el premio
        const newPrizes = [...userPrizes, prize];
        updateCoins(coins - prizeCost); // Actualiza monedas

        // Actualiza los premios en Firebase
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { prizes: newPrizes }, { merge: true });

        setUserPrizes(newPrizes); // Actualiza el estado local
      } else {
        alert('Ya tienes este premio.');
      }
    } else {
      alert('No tienes suficientes monedas para comprar este premio.');
    }
  };

  // Función para vender un premio
  const sellPrizeHandler = async (prize) => {
    const newPrizes = userPrizes.filter(p => p !== prize);
    updateCoins(coins + sellPrice); // Actualiza monedas

    // Actualiza los premios en Firebase
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { prizes: newPrizes }, { merge: true });

    setUserPrizes(newPrizes); // Actualiza el estado local
  };

  return (
    <div>
      <h1>Tienda de Premios</h1>
      <p>Monedas disponibles: {coins}</p>

      <h2>Premios disponibles para comprar</h2>
      <ul>
        {allPrizes.map((prize) => (
          <li key={prize}>
            {prize} 
            {userPrizes.includes(prize) ? (
              <span> - Ya lo tienes</span>
            ) : (
              <button onClick={() => buyPrize(prize)}>Comprar (30 monedas)</button>
            )}
          </li>
        ))}
      </ul>

      <h2>Tus premios</h2>
      <ul>
        {userPrizes.map((prize, index) => (
          <li key={index}>
            {prize} 
            <button onClick={() => sellPrizeHandler(prize)}>Vender (20 monedas)</button>
          </li>
        ))}
      </ul>

      <Link to="/menu">
        <button>Regresar al menú principal</button>
      </Link>
    </div>
  );
};

export default StorePage;
