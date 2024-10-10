import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Asegúrate de tener bien configurada la importación de Firestore
import { useNavigate } from 'react-router-dom'; // Cambiar a useNavigate

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate(); // Crea la instancia de navigate

  // Función para asignar valores iniciales de premios y monedas al registrar usuario
  const createUserData = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    
    await setDoc(userRef, {
      coins: 100, // Asignamos 100 monedas al usuario nuevo
      prizes: [], // El usuario comienza con la lista de premios vacía
    });
  };

  // Función para obtener los datos de un usuario existente (monedas y premios)
  const getUserData = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data(); // Devolvemos los datos del usuario
    } else {
      console.log('No hay datos para este usuario');
      return null;
    }
  };

  const handleSubmit = () => {
    if (isRegistering) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert('Usuario registrado con éxito');
          createUserData(userCredential.user);  // Asignamos los valores iniciales al usuario registrado
        })
        .catch((error) => {
          console.error('Error al registrar usuario:', error);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          alert('Sesión iniciada');
          const userData = await getUserData(userCredential.user);  // Obtenemos los datos del usuario existente (monedas y premios)
          if (userData) {
            // Redirige a /menu después de obtener los datos del usuario
            navigate('/menu', { state: { userData } }); // Usa navigate para redirigir
          }
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
