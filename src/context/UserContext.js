import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [coins, setCoins] = useState(null); // Cambia el valor inicial a null
  const [prizes, setPrizes] = useState([]); // Estado para los premios del usuario

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setCoins(userDoc.data().coins || 0); // Asegúrate de establecer un valor por defecto
          setPrizes(userDoc.data().prizes || []); // Cargar premios del usuario
        } else {
          console.log('No hay datos para este usuario');
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData();
      } else {
        setCoins(null); // Limpiar monedas si el usuario cierra sesión
        setPrizes([]); // Limpiar premios si el usuario cierra sesión
      }
    });

    return () => unsubscribe();
  }, []);

  const updateCoins = async (newCoins) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { coins: newCoins }, { merge: true });
      setCoins(newCoins);
    }
  };

  const updatePrizes = async (newPrizes) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { prizes: newPrizes }, { merge: true });
      setPrizes(newPrizes);
    }
  };

  return (
    <UserContext.Provider value={{ coins, updateCoins, prizes, updatePrizes }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
