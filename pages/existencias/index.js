import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';


export default function Existencias() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');

  // Fetch de los productos al cargar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axiosInstance.get('gestion/productos/');
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching productos:', error);
        setError('No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Existencias</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-16 py-3">
                Imagen
              </th>
              <th scope="col" className="px-6 py-3">
                Código
              </th>
              <th scope="col" className="px-6 py-3">
                Producto
              </th>
              <th scope="col" className="px-6 py-3">
                Marca
              </th>
              <th scope="col" className="px-6 py-3">
                Talla
              </th>
              <th scope="col" className="px-6 py-3">
                Cantidad
              </th>
              <th scope="col" className="px-6 py-3">
                Precio
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr
                key={producto.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="p-4">
                  <img
                    src={`../images/${producto.imagen}`}
                    className="w-16 md:w-32 max-w-full max-h-full"
                    alt={producto.nombre}
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.codigo}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.marca.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.talla}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.stock_total}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  ${producto.precio}
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