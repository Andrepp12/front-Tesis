import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');

  // Fetch de los pedidos al cargar el componente
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axiosInstance.get('gestion/pedidos/');
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
        setError('No se pudieron cargar los pedidos. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchPedidos();
  }, []);

  // Función para mostrar el estado en texto
  const renderEstado = (estado) => {
    switch (estado) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'Recibido';
      case 0:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Pedidos</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Proveedor
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha del Pedido
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
            {pedidos.map((pedido) => (
              <tr
                key={pedido.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {pedido.proveedor.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {pedido.fecha_pedido}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {renderEstado(pedido.estado)}
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
