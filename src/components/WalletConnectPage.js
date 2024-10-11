import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext'; // Importa el contexto

const WalletConnectPage = () => {
  const [account, setAccount] = useState('');
  const { updateWalletAccount } = useUser(); // Obtiene la función para actualizar la cuenta de la billetera

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        alert(`Billetera conectada: ${accounts[0]}`);
        updateWalletAccount(accounts[0]); // Actualiza la cuenta en el contexto y Firestore
      } catch (error) {
        console.error('Error al conectar la billetera:', error);
      }
    } else {
      alert('Por favor, instala MetaMask!');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateWalletAccount(accounts[0]); // Actualiza la cuenta en el contexto y Firestore si cambia
        } else {
          setAccount(''); // Limpiar la cuenta si se desconecta
        }
      });
    }
  }, [updateWalletAccount]); // Asegúrate de incluir updateWalletAccount en las dependencias

  return (
    <div>
      <h1>Conectar Billetera Digital</h1>
      <button onClick={connectWallet}>Conectar MetaMask</button>
      {account && <p>Billetera conectada: {account}</p>}
    </div>
  );
};

export default WalletConnectPage;
