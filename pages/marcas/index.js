import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [success, setSuccess] = useState('');

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('gestion/marcas/', {
        nombre,
        codigo,
        estado: 1, // Estado por defecto
      });

      // Agregar la nueva marca al estado de marcas
      setMarcas([...marcas, response.data]);

      setSuccess('Marca agregada exitosamente');
      setError('');
      setShowModal(false); // Oculta el modal tras éxito
      setNombre('');
      setCodigo('');
    } catch (error) {
      setError('Error al agregar la marca. Intenta de nuevo.');
      setSuccess('');
    }
  };

  const handleEliminarMarca = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
      try {
        await axiosInstance.delete(`gestion/marcas/${id}/`);
        setMarcas(marcas.filter((marca) => marca.id !== id));
        setSuccess('Marca eliminada exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar la marca. Intenta de nuevo.');
      }
    }
  };

  // Fetch de las marcas al cargar el componente
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await axiosInstance.get('gestion/marcas/');
        setMarcas(response.data);
      } catch (error) {
        console.error('Error fetching marcas:', error);
        setError('No se pudieron cargar las marcas. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchMarcas();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Marcas</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={() => setShowModal(true)} // Mostrar el modal al hacer clic
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Agregar Nueva Marca</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nombre de la Marca</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)} // Cerrar el modal sin guardar
                  className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Tabla de marcas */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Código
              </th>
              <th scope="col" className="px-6 py-3">
                Nombre
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
            {marcas.map((marca) => (
              <tr
                key={marca.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {marca.codigo}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {marca.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {marca.estado === 1 ? 'Activo' : 'Inactivo'}
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
                    onClick={() => handleEliminarMarca(marca.id)}
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
