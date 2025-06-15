import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

      localStorage.clear();
      
    try {
      const response = await api.post('/api/auth/login/', { username, password });

      
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        username: response.data.user.username,
        first_name: response.data.user.first_name,
        last_name: response.data.user.last_name,
        email: response.data.user.email,
        foto_perfil: response.data.user.foto_perfil || null,
        telefono: response.data.user.telefono || '',
        accesos: response.data.user.accesos 
      }));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciales incorrectas');
      console.error('Error en login:', err);
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <div className="login-links">
        <Link to="/register">¿No tienes cuenta? Regístrate</Link>
      </div>
    </div>
  );
};

export default Login;