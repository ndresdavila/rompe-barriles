import { useState } from 'react';
import { auth } from '../firebase';  // Asegúrate de que esta importación esté correcta
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';  // Importa useNavigate

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleSubmit = () => {
    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert('Usuario registrado con éxito');
        })
        .catch((error) => {
          console.error('Error al registrar usuario:', error);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert('Sesión iniciada');
          navigate('/game'); // Redirige a la página del juego
        })
        .catch((error) => {
          console.error('Error al iniciar sesión:', error);
        });
    }
  };

  return (
    <div>
      <h2>{isRegistering ? 'Registro' : 'Inicio de Sesión'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>
        {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Ya tengo cuenta' : 'Registrarme'}
      </button>
    </div>
  );
};

export default LoginPage;
