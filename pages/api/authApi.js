// utils/authApi.js
// import axios from 'axios';

// const API_URL = 'http://localhost:8000/api';  // URL de tu backend en Django

// export const login = async (email, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/token/`, { email, password });
//     return response.data; // Devuelve los tokens
//   } catch (error) {
//     throw error;
//   }
// };

// export const refreshToken = async (refreshToken) => {
//   try {
//     const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });
//     return response.data; // Devuelve un nuevo token de acceso
//   } catch (error) {
//     throw error;
//   }
// };
