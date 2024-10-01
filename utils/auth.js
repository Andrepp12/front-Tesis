import axios from 'axios';
import Cookies from 'js-cookie';

export const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get('refresh_token');
    const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
      refresh: refreshToken,
    });

    // Actualiza el access token en las cookies
    Cookies.set('access_token', response.data.access);
  } catch (error) {
    console.error('Error refreshing token', error);
    // Redirigir al login si no se puede renovar el token
  }
};
