import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [error, setError] = useState('');

  // Fetch de las devoluciones al cargar el componente
  useEffect(() => {
    const fetchDevoluciones = async () => {
      try {
        const response = await axiosInstance.get('gestion/devoluciones/');
        setDevoluciones(response.data);
      } catch (error) {
        console.error('Error fetching devoluciones:', error);
        setError('No se pudieron cargar las devoluciones. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchDevoluciones();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Devoluciones</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Proveedor
              </th>
              <th scope="col" className="px-6 py-3">
                Razón
              </th>
              <th scope="col" className="px-6 py-3">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha de Devolución
              </th>
              <th scope="col" className="px-6 py-3">
                Estado
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {devoluciones.map((devolucion) => (
              <tr
                key={devolucion.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {devolucion.proveedor.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {devolucion.razon}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {devolucion.descripcion}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {devolucion.fecha_devolucion}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {devolucion.estado === 1 ? 'Activa' : 'Inactiva'}
                </td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline p-3"
                  >
                    Editar
                  </a>
                  <a
                    href="#"
                    className="font-medium text-red-600 dark:text-red-500 hover:underline p-3"
                  >
                    Eliminar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
