import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Marcas() {
  const [marcas, setMarcas] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [success, setSuccess] = useState('');
  const [marcaId, setMarcaId] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);

  // Handle editing a marca
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.patch(`gestion/marcas/${marcaId}/`, {
        nombre,
        codigo,
        estado: 1, 
      });

      setMarcas(marcas.map((marca) => (marca.id === marcaId ? response.data : marca)));
      setSuccess('Marca actualizada exitosamente');
      setError('');
      closeModal(); 
    } catch (error) {
      setError('Error al actualizar la marca. Intenta de nuevo.');
      setSuccess('');
    }
  };

  // Open the modal in create mode
  const openCreateModal = () => {
    setIsEditMode(false); 
    setNombre(''); 
    setCodigo('');
    setShowModal(true); 
  };

  // Open the modal in edit mode with the existing data
  const openEditModal = (marca) => {
    setIsEditMode(true); 
    setMarcaId(marca.id); 
    setNombre(marca.nombre); 
    setCodigo(marca.codigo);
    setShowModal(true); 
  };

  // Close the modal and reset form
  const closeModal = () => {
    setShowModal(false);
    setNombre('');
    setCodigo('');
    setError('');
    setSuccess('');
  };

  // Handle form submission for creating a new marca
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('gestion/marcas/', {
        nombre,
        codigo,
        estado: 1, 
      });

      setMarcas([...marcas, response.data]);
      setSuccess('Marca agregada exitosamente');
      setError('');
      closeModal(); 
    } catch (error) {
      setError('Error al agregar la marca. Intenta de nuevo.');
      setSuccess('');
    }
  };

  // Handle deleting a marca
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
        onClick={openCreateModal}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
      >
        + Agregar
      </button>

      {/* Modal for add/edit */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {isEditMode ? 'Editar Marca' : 'Agregar Nueva Marca'}
            </h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={isEditMode ? handleEditSubmit : handleSubmit}>
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
                  onClick={closeModal}
                  className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  {isEditMode ? 'Guardar Cambios' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Table of marcas */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca) => (
              <tr key={marca.id} className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500">
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{marca.codigo}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{marca.nombre}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{marca.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => openEditModal(marca)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => handleEliminarMarca(marca.id)} className="text-red-600 hover:underline ml-4">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
