import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import axiosInstance from '../utils/axiosConfig';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('auth/login/', {
        username,
        password,
      });

      // Si el login es exitoso, almacenar el token en las cookies
      Cookies.set('access_token', response.data.access);
      Cookies.set('refresh_token', response.data.refresh);
      
      // Redirigir al usuario a la página protegida o dashboard
      router.push('/');
    } catch (error) {
      // Manejar el error en caso de credenciales incorrectas
      setError('Login failed. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className=" p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-300" >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Ingresar al Sistema</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 text-gray-700"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 text-gray-700"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
