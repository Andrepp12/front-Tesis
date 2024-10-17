import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Solicitudes() {
  const fechaActual = new Date().toISOString().split('T')[0];
  const [showModal, setShowModal] = useState(false);
  const [stand, setStand] = useState('');
  const [fechaSolicitud, setFechaSolicitud] = useState(fechaActual);
  const [productoId, setProductoId] = useState(''); // Para manejar el producto actual seleccionado
  const [cantidad, setCantidad] = useState(''); // Para manejar la cantidad actual seleccionada
  const [productosSeleccionados, setProductosSeleccionados] = useState([]); // Productos seleccionados con cantidades
  const [stands, setStands] = useState([]);
  const [productos, setProductos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({
      stand_id: stand, // Este debería ser el ID del stand
      fecha_solicitud: fechaSolicitud,
      estado: 1,
    });

    try {
      // Crear la solicitud
      const solicitudResponse = await axiosInstance.post('gestion/solicitudes/', {
        stand_id: stand, // Aquí cambiamos para enviar solo el stand_id
        fecha_solicitud: fechaSolicitud,
        estado: 1,
      });

      const solicitudId = solicitudResponse.data.id;

      // Crear los DetalleSolicitud asociados a la solicitud
      const detallesPromises = productosSeleccionados.map((detalle) =>
        axiosInstance.post('gestion/detalles_solicitud/', {
          solicitud: solicitudId,
          producto: detalle.productoId,
          cantidad: detalle.cantidad,
          estado: 1,
        })
      );

      // Ejecutar todas las promesas
      await Promise.all(detallesPromises);

      // Actualizar la lista de solicitudes
      setSolicitudes([...solicitudes, solicitudResponse.data]);

      setSuccess('Solicitud y productos agregados exitosamente');
      setError('');
      setShowModal(false); // Cerrar el modal
      setStand('');
      setFechaSolicitud('');
      setProductosSeleccionados([]); // Limpiar productos seleccionados
    } catch (error) {
      setError('Error al agregar la solicitud. Intenta de nuevo.');
      setSuccess('');
    }
  };

  // Añadir el producto seleccionado a la lista de productos
  const agregarProducto = () => {
    if (productoId && cantidad) {
      // Encontrar el producto en la lista de productos por su ID
      const productoSeleccionado = productos.find((p) => p.id === parseInt(productoId));
  
      if (productoSeleccionado) {
        // Validar si la cantidad no excede el stock disponible
        if (parseInt(cantidad) > productoSeleccionado.stock_total) {
          setError(`La cantidad deseada excede el stock disponible. Solo hay ${productoSeleccionado.stock_total} unidades disponibles.`);
        } else {
          // Si la cantidad es válida, agregar el producto
          setProductosSeleccionados([
            ...productosSeleccionados,
            {
              productoId,
              cantidad,
              nombre: productoSeleccionado.nombre,
              codigo: productoSeleccionado.codigo,  // Incluir código
              talla: productoSeleccionado.talla     // Incluir talla
            },
          ]);
          // Limpiar después de agregar
          setProductoId('');
          setCantidad('');
          setError(''); // Limpiar cualquier error anterior
        }
      }
    } else {
      setError('Por favor, selecciona un producto y la cantidad.');
    }
  };

  const eliminarProducto = (index) => {
    const productosActualizados = [...productosSeleccionados];
    productosActualizados.splice(index, 1); // Eliminar producto por índice
    setProductosSeleccionados(productosActualizados);
  };

  // Fetch de stands y productos
  useEffect(() => {
    const fetchStands = async () => {
      try {
        const response = await axiosInstance.get('gestion/stands/');
        setStands(response.data);
      } catch (error) {
        console.error('Error fetching stands:', error);
      }
    };

    const fetchProductos = async () => {
      try {
        const response = await axiosInstance.get('gestion/productos/');
        setProductos(response.data);
      } catch (error) {
        console.error('Error fetching productos:', error);
      }
    };

    const fetchSolicitudes = async () => {
      try {
        const response = await axiosInstance.get('gestion/solicitudes/');
        setSolicitudes(response.data);
      } catch (error) {
        console.error('Error fetching Solicitudes:', error);
        setError('No se pudieron cargar las Solicitudes. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchSolicitudes();
    fetchStands();
    fetchProductos();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Solicitudes</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Agregar Nueva Solicitud</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Stand</label>
                <select
                  value={stand}
                  onChange={(e) => setStand(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Stand</option>
                  {stands.map((stand) => (
                    <option key={stand.id} value={stand.id}>
                      {stand.nombre} - {stand.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Solicitud</label>
                <input
                  type="date"
                  value={fechaSolicitud}
                  onChange={(e) => setFechaSolicitud(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <br></br>
              <div className="flex space-x-4">
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  className="block w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.codigo} - {producto.nombre} - {producto.talla}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Cantidad"
                  className="block w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              

                <button
                  type="button"
                  onClick={agregarProducto}
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-4"
                >
                  Agregar Producto
                </button>
              </div>

              {/* Tabla de productos seleccionados */}
              <div className="mb-4">
                {error && <p className="text-red-500">{error}</p>}
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">Producto</th>
                      <th scope="col" className="px-6 py-3">Código</th>
                      <th scope="col" className="px-6 py-3">Talla</th>
                      <th scope="col" className="px-6 py-3">Cantidad</th>
                      <th scope="col" className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosSeleccionados.map((detalle, index) => (
                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">{detalle.nombre}</td>
                        <td className="px-6 py-4">{detalle.codigo}</td>
                        <td className="px-6 py-4">{detalle.talla}</td>
                        <td className="px-6 py-4">{detalle.cantidad}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => eliminarProducto(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      )}

      {/* Mostrar las solicitudes agregadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {solicitudes.map((solicitud) => (
          <div key={solicitud.id} className="max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Solicitud {solicitud.id}</h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Fecha: {solicitud.fecha_solicitud}</p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Estado: {solicitud.estado === 1 ? 'Pendiente' : solicitud.estado === 2 ? 'Aprobada' : 'Rechazada'}</p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Stand: {solicitud.stand.nombre} ({solicitud.stand.ubicacion})</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
