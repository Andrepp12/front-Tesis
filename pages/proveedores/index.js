import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Proveedores() {
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [contacto, setContacto] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState(null); // Null means "add mode"

  // Open modal for edit mode
  const openEditModal = (proveedor) => {
    setProveedorId(proveedor.id);
    setNombre(proveedor.nombre);
    setRuc(proveedor.ruc);
    setContacto(proveedor.contacto);
    setDireccion(proveedor.direccion);
    setShowModal(true);
  };

  // Open modal for create mode
  const openCreateModal = () => {
    setProveedorId(null); // Reset ID for create mode
    setNombre('');
    setRuc('');
    setContacto('');
    setDireccion('');
    setShowModal(true);
  };

  // Handle submitting for editing or creating a proveedor
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (proveedorId) {
        // Update existing proveedor
        response = await axiosInstance.patch(`gestion/proveedores/${proveedorId}/`, {
          nombre,
          ruc,
          contacto,
          direccion,
          estado: 1,
        });

        // Update provider list
        setProveedores(
          proveedores.map((proveedor) => (proveedor.id === proveedorId ? response.data : proveedor))
        );
        setSuccess('Proveedor actualizado exitosamente');
      } else {
        // Create new proveedor
        response = await axiosInstance.post('gestion/proveedores/', {
          nombre,
          ruc,
          contacto,
          direccion,
          estado: 1,
        });

        setProveedores([...proveedores, response.data]);
        setSuccess('Proveedor agregado exitosamente');
      }

      setError('');
      setShowModal(false);
      setNombre('');
      setRuc('');
      setContacto('');
      setDireccion('');
    } catch (error) {
      setError('Error al procesar el proveedor. Intenta de nuevo.');
      setSuccess('');
    }
  };

  const handleEliminarProveedor = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este Proveedor?')) {
      try {
        await axiosInstance.delete(`gestion/proveedores/${id}/`);
        setProveedores(proveedores.filter((proveedor) => proveedor.id !== id));
        setSuccess('Proveedor eliminado exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar el proveedor. Intenta de nuevo.');
      }
    }
  };

  // Fetch the providers on component mount
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axiosInstance.get('gestion/proveedores/');
        setProveedores(response.data);
      } catch (error) {
        setError('No se pudieron cargar los proveedores. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchProveedores();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Proveedores</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={openCreateModal}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {proveedorId ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
            </h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nombre del Proveedor</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">RUC</label>
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  maxLength={11}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Contacto</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  {proveedorId ? 'Guardar Cambios' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {proveedores.map((proveedor) => (
          <div key={proveedor.id} className="max-w-l bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 row">
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {proveedor.nombre}
              </h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {proveedor.contacto}
              </p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                Dirección: {proveedor.direccion}
              </p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                RUC: {proveedor.ruc}
              </p>
              <button
                onClick={() => openEditModal(proveedor)}
                className="text-blue-500"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminarProveedor(proveedor.id)}
                className="text-red-500 ms-4"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
