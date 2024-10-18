import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Existencias() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [talla, setTalla] = useState('');
  const [precio, setPrecio] = useState('');
  const [stockAlmacen, setStockAlmacen] = useState('');
  const [stockTotal, setStockTotal] = useState(0); // Define stockTotal
  const [ubicacion, setUbicacion] = useState('almacén');
  const [marca, setMarca] = useState('');
  const [imagen, setImagen] = useState(null); // Estado para la imagen
  const [success, setSuccess] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [estado, setEstado] = useState(1); // Define estado aquí

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Verifica si tienes todos los datos correctos
    console.log("nombre:", nombre);
    console.log("codigo:", codigo);
    console.log("descripcion:", descripcion);
    console.log("talla:", talla);
    console.log("precio:", precio);
    console.log("stock_almacen:", stockAlmacen);
    console.log("stock_total:", stockTotal); // Asegúrate de que stockTotal esté aquí
    console.log("ubicacion:", ubicacion);
    console.log("marca:", marca);  // Asegúrate de que es el ID numérico
    console.log("imagen:", imagen);
    console.log("estado:", estado);
  
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('codigo', codigo);
    formData.append('descripcion', descripcion);
    formData.append('talla', talla);
    formData.append('precio', precio);
    formData.append('stock_almacen', stockAlmacen);
    formData.append('stock_total', stockAlmacen);
    formData.append('ubicacion', ubicacion);
    formData.append('marca_id', marca);  // En lugar de 'marca' // Asegúrate de que sea el ID numérico de la marca
    if (imagen) {
      formData.append('imagen', imagen);  // Aquí debes tener un input de tipo file
    } // La imagen debe ser un objeto File
    formData.append('estado', estado);
  
    try {
      const response = await axiosInstance.post('gestion/productos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Producto agregado exitosamente:', response.data);

      window.location.reload();
    } catch (error) {
      console.error('Error al agregar el producto:', error.response.data);
      setError('Error al agregar el producto. Intenta de nuevo.');
    }
  };
  
  const handleEliminarProducto = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axiosInstance.delete(`gestion/productos/${id}/`);
        setProductos(productos.filter((producto) => producto.id !== id));
        setSuccess('Producto eliminado exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar el producto. Intenta de nuevo.');
      }
    }
  };

  // Fetch de los productos y marcas al cargar el componente
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

    const fetchMarcas = async () => {
      try {
        const response = await axiosInstance.get('gestion/marcas/');
        setMarcas(response.data);
      } catch (error) {
        console.error('Error fetching marcas:', error);
      }
    };

    fetchProductos();
    fetchMarcas();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Existencias</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={() => setShowModal(true)} // Mostrar el modal al hacer clic
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal para agregar productos */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Producto</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Talla</label>
                <input
                  type="number"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  value={stockAlmacen}
                  onChange={(e) => setStockAlmacen(e.target.value)}
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Marca</label>
                <select
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
                <input
                  type="file"
                  onChange={(e) => setImagen(e.target.files[0])}
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

      {/* Tabla de productos */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
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
                Stock Almacén
              </th>
              <th scope="col" className="px-6 py-3">
                Stock Total
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
                    src={producto.imagen}  // Usa la URL completa del servidor para la imagen
                    className="w-16 md:w-32 max-w-full max-h-full"
                    alt={producto.imagen}
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.codigo}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.nombre}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.marca?.nombre || 'Sin marca'}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.talla}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {producto.stock_almacen}
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
                    onClick={() => handleEliminarProducto(producto.id)}
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
