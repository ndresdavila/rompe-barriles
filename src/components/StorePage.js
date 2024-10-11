import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const StorePage = () => {
  const { coins, updateCoins } = useUser(); // Eliminado tokens y updateTokens
  const [userPrizes, setUserPrizes] = useState([]);

  const coinPrizeCost = 30;
  const sellPrice = 20;
  const allCoinPrizes = Array.from({ length: 5 }, (_, i) => `Premio ${i + 1}`);

  useEffect(() => {
    const loadUserPrizes = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const prizes = userDoc.data().prizes || [];
          setUserPrizes(prizes);
        }
      }
    };

    loadUserPrizes();
  }, []);

  const buyCoinPrize = async (prize) => {
    if (coins >= coinPrizeCost) {
      if (!userPrizes.includes(prize)) {
        const newPrizes = [...userPrizes, prize];
        updateCoins(coins - coinPrizeCost);
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { prizes: newPrizes }, { merge: true });
        setUserPrizes(newPrizes);
      } else {
        alert('Ya tienes este premio.');
      }
    } else {
      alert('No tienes suficientes monedas para comprar este premio.');
    }
  };

  const sellPrizeHandler = async (prize) => {
    const newPrizes = userPrizes.filter(p => p !== prize);
    updateCoins(coins + sellPrice);
    const user = auth.currentUser;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { prizes: newPrizes }, { merge: true });
    setUserPrizes(newPrizes);
  };

  return (
    <div>
      <h1>Tienda de Premios</h1>
      <p>Monedas disponibles: {coins}</p>

      <h2>Premios disponibles para comprar con Monedas</h2>
      <ul>
        {allCoinPrizes.map((prize) => (
          <li key={prize}>
            {prize} 
            {userPrizes.includes(prize) ? (
              <span> - Ya lo tienes</span>
            ) : (
              <button onClick={() => buyCoinPrize(prize)}>Comprar (30 monedas)</button>
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
