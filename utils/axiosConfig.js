import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from './auth';  // Importa la función para renovar el token

// Crear una instancia de Axios
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',  // URL base de la API
});

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  response => response,  // Si la respuesta es exitosa, simplemente la devuelve
  async (error) => {
    const originalRequest = error.config;

    // Si el error es un 401 (no autorizado) y no es un intento de renovar el token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Intentar renovar el token
      await refreshAccessToken();

      // Obtener el nuevo token
      const newAccessToken = Cookies.get('access_token');
      
      // Establecer el nuevo token en el encabezado de la solicitud original
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      
      // Reintentar la solicitud original con el nuevo token
      return axiosInstance(originalRequest);
    }

    // Si no es un error 401 o si no se puede renovar el token, rechaza la promesa
    return Promise.reject(error);
  }
);

export default axiosInstance;
