import axiosInstance from './axiosConfig';
import Cookies from 'js-cookie';


export const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get('refresh_token');
    const response = await axiosInstance.post('auth/token/refresh/', {
      refresh: refreshToken,
    });

    // Actualiza el access token en las cookies
    Cookies.set('access_token', response.data.access);
  } catch (error) {
    console.error('Error refreshing token', error);
    // Redirigir al login si no se puede renovar el token
  }
};
