import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Stands() {
  const [stands, setStands] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false); // Saber si estás editando o creando
  const [standId, setStandId] = useState(null); // Para guardar el ID del stand a editar

  // Función para manejar el envío del formulario para crear un nuevo stand
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('gestion/stands/', {
        nombre,
        ubicacion,
        estado: 1, // Estado por defecto
      });

      // Agregar el nuevo stand al estado de stands
      setStands([...stands, response.data]);

      setSuccess('Stand agregado exitosamente');
      setError('');
      closeModal(); // Oculta el modal tras éxito
    } catch (error) {
      setError('Error al agregar el stand. Intenta de nuevo.');
      setSuccess('');
    }
  };

  // Función para manejar el envío del formulario para editar un stand
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.patch(`gestion/stands/${standId}/`, {
        nombre,
        ubicacion,
        estado: 1, // Estado por defecto
      });

      // Actualizar el stand en el estado de stands
      setStands(stands.map((stand) => (stand.id === standId ? response.data : stand)));

      setSuccess('Stand actualizado exitosamente');
      setError('');
      closeModal(); // Oculta el modal tras éxito
    } catch (error) {
      setError('Error al actualizar el stand. Intenta de nuevo.');
      setSuccess('');
    }
  };

  // Abrir modal en modo creación
  const openCreateModal = () => {
    setIsEditMode(false); // Cambiar a modo crear
    setNombre(''); // Limpiar los campos
    setUbicacion('');
    setShowModal(true); // Mostrar el modal
  };

  // Abrir modal en modo edición con los datos del stand
  const openEditModal = (stand) => {
    setIsEditMode(true); // Cambiar a modo editar
    setStandId(stand.id); // Establecer el ID del stand a editar
    setNombre(stand.nombre); // Rellenar los campos con los datos actuales
    setUbicacion(stand.ubicacion);
    setShowModal(true); // Mostrar el modal
  };

  // Función para cerrar el modal y resetear los campos
  const closeModal = () => {
    setShowModal(false);
    setNombre('');
    setUbicacion('');
    setError('');
    setSuccess('');
  };

  const handleEliminarStand = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este Stand?')) {
      try {
        await axiosInstance.delete(`gestion/stands/${id}/`);
        setStands(stands.filter((stand) => stand.id !== id));
        setSuccess('Stand eliminado exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar el Stand. Intenta de nuevo.');
      }
    }
  };

  // Fetch de los stands al cargar el componente
  useEffect(() => {
    const fetchStands = async () => {
      try {
        const response = await axiosInstance.get('gestion/stands/');
        setStands(response.data);
      } catch (error) {
        console.error('Error fetching stands:', error);
        setError('No se pudieron cargar los stands. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchStands();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Stands</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={openCreateModal} // Mostrar el modal para agregar un nuevo stand
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal para crear o editar */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Editar Stand' : 'Agregar Nuevo Stand'}</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={isEditMode ? handleEditSubmit : handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nombre del Stand</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal} // Cerrar el modal sin guardar
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

      {/* Tabla de stands */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Ubicación
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
            {stands.map((stand) => (
              <tr
                key={stand.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {stand.ubicacion}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {stand.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {stand.estado === 1 ? 'Activo' : 'Inactivo'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openEditModal(stand)} // Abrir modal en modo editar
                    className="font-medium text-blue-600 dar khover p-3" > Editar </button> 
                    <button onClick={() => handleEliminarStand(stand.id)} // Eliminar stand 
                    className="font-medium text-red-600 dark hoverp-3" > Eliminar </button> 
                </td> 
            </tr> ))} 
          </tbody> 
      </table> 
    </div> 
  </div> ); }