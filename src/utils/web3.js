// src/utils/web3.js
import Web3 from 'web3';

// URL del nodo de Chainstack para la red Sepolia
const chainstackUrl = 'https://ethereum-sepolia.core.chainstack.com/bfa914ad5acc9db64dac38ba29b01512';
let web3;

if (window.ethereum) {
    // Si MetaMask está disponible, utiliza MetaMask
    web3 = new Web3(window.ethereum);
    window.ethereum.request({ method: 'eth_requestAccounts' });
} else {
    // Si no está disponible, usa la conexión al nodo de Chainstack
    web3 = new Web3(new Web3.providers.HttpProvider(chainstackUrl));
}

export default web3;
