import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Select from 'react-select';

export default function Dev_Solicitudes() {
  const fechaActual = new Date().toISOString().split('T')[0];
  const [showModal, setShowModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [devolucion, setDevolucion] = useState('');
  const [solicitud, setSolicitud] = useState('');
  const [boleta, setBoleta] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState(fechaActual);
  const [razon, setRazon] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descripcionDetalle, setDescripcionDetalle] = useState('');
  // const [precioTotal, setPrecioTotal] = useState(0);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detallesDevolucion, setDetallesDevolucion] = useState([]);
  const [devolucionSeleccionado, setDevolucionSeleccionado] = useState(null);
  const opcionesProductos = productos.map((producto) => ({
    value: producto.id,
    label: `${producto.codigo} - ${producto.nombre} - ${producto.talla}`,
  }));
  
  const handleSelectProducto = (selectedOption) => {
    setProductoId(selectedOption ? selectedOption.value : '');
  };

  
  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Crear la devolución
      const devolucionResponse = await axiosInstance.post('gestion/devoluciones/', {
        solicitud_id: solicitud,
        razon,
        descripcion,
        fecha_devolucion: fechaDevolucion,
        estado: 1,
      });
  
      const devolucionId = devolucionResponse.data.id;
  
      // Crear los DetalleDevolucion asociados a la devolución y actualizar el stock de los productos
      const detallesPromises = productosSeleccionados.map(async (detalle) => {
        try {
          // Registrar el detalle de la devolución
          const response = await axiosInstance.post('gestion/detalles_devolucion/', {
            devolucion: devolucionId,
            producto_id: detalle.productoId,
            cantidad: detalle.cantidad,
            descripcion: detalle.descripcionDetalle,
            estado: 1,
          });
  
          // Obtener el producto para actualizar su stock
          const productoResponse = await axiosInstance.get(`gestion/productos/${detalle.productoId}/`);
          const producto = productoResponse.data;
  
          // Asegurarse de que las operaciones son numéricas
          const nuevoStockAlmacen = Number(producto.stock_almacen) + Number(detalle.cantidad);
  
          // Actualizar el stock del producto
          await axiosInstance.patch(`gestion/productos/${detalle.productoId}/`, {
            stock_almacen: nuevoStockAlmacen,
          });
  
          return response.data;
        } catch (error) {
          console.error('Error al registrar el detalle o actualizar el stock:', error);
          throw error; // Re-lanza el error para ser capturado por Promise.all
        }
      });
  
      // Ejecutar todas las promesas de los detalles
      await Promise.all(detallesPromises);
  
      // Actualizar la lista de devoluciones
      setDevoluciones([...devoluciones, devolucionResponse.data]);
  
      setSuccess('Devolución y productos agregados exitosamente');
      setError('');
      setShowModal(false); // Cerrar el modal
      resetForm();
    } catch (error) {
      setError('Error al agregar la devolución. Intenta de nuevo.');
      setSuccess('');
    }
  };
  

  const handleEliminarDevolucion = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta devolucion?')) {
      try {
        await axiosInstance.delete(`gestion/devoluciones/${id}/`);
        setDevoluciones(devoluciones.filter((devolucion) => devolucion.id !== id));
        setSuccess('Devolucion eliminada exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar la Devolucion. Intenta de nuevo.');
      }
    }
  };

  const abrirModalDetalles = async (devolucionId) => {
    setShowDetallesModal(true); // Mostrar el modal de detalles
    setDevolucionSeleccionado(devolucionId); // Guardar el devolucion seleccionado

    try {
      const response = await axiosInstance.get(`gestion/detalles_devolucion/devolucion/${devolucionId}/`);
      setDetallesDevolucion(response.data); // Guardar los detalles del devolucion
    } catch (error) {
      setError('Error al obtener los detalles del devolucion.');
    }
  };

  const cerrarModalDetalles = () => {
    setShowDetallesModal(false);
    setDetallesDevolucion([]);
    setDevolucionSeleccionado(null);
    setError('');
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    resetForm();
    setShowModal(false);
    setDetallesDevolucion([]);
    setDevolucionSeleccionado(null);
    setError('');
  };

  // Añadir el producto seleccionado a la lista de productos
  const agregarProducto = () => {
    if (productoId && cantidad && descripcionDetalle) {
      const productoSeleccionado = productos.find((p) => p.id === parseInt(productoId));

      if (productoSeleccionado) {
        setProductosSeleccionados([
          ...productosSeleccionados,
          {
            productoId,
            cantidad,
            nombre: productoSeleccionado.nombre,
            codigo: productoSeleccionado.codigo,
            talla: productoSeleccionado.talla,
            descripcionDetalle: descripcionDetalle,
          },
        ]);
        // Limpiar después de agregar
        setProductoId('');
        setCantidad('');
        setDescripcionDetalle('');
        setError('');
      }
    } else {
      setError('Por favor, selecciona un producto y la cantidad.');
    }
  };

  // Eliminar un producto seleccionado
  const eliminarProducto = (index) => {
    const productosActualizados = [...productosSeleccionados];
    productosActualizados.splice(index, 1);
    setProductosSeleccionados(productosActualizados);
  };

  const resetForm = () => {
    setSolicitud('');
    setRazon('');
    setDescripcion('');
    setFechaDevolucion(fechaActual);
    setProductosSeleccionados([]);
  };

  // Fetch de solicitudes y productos
  useEffect(() => {
    const fetchSolicitudes= async () => {
      try {
        const response = await axiosInstance.get('gestion/solicitudes/');
        setSolicitudes(response.data);
      } catch (error) {
        console.error('Error fetching solicitudes:', error);
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

    

    const fetchDevoluciones = async () => {
      try {
        const response = await axiosInstance.get('gestion/devoluciones-con-solicitud/');

        setDevoluciones(response.data);
      } catch (error) {
        console.error('Error fetching devoluciones:', error);
        setError('No se pudieron cargar los devoluciones. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchSolicitudes();
    fetchProductos();
    fetchDevoluciones();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Devoluciones</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar Devolucion
      </button>

      {/* Modal para agregar devolucion */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Agregar Nueva Devolucion</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Solicitud</label>
                <select
                  value={solicitud}
                  onChange={(e) => setSolicitud(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Solicitud</option>
                  {solicitudes.map((solicitud) => (
                    <option key={solicitud.id} value={solicitud.id}>
                      {solicitud.id} - {solicitud.stand.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Razon</label>
                <input
                  type="text"
                  value={razon}
                  onChange={(e) => setRazon(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descripcion</label>
                <input
                  type="textarea"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Devolucion</label>
                <input
                  type="date"
                  value={fechaDevolucion}
                  onChange={(e) => setFechaDevolucion(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Productos</label>
                <div className="flex space-x-4">
                <Select
                    options={opcionesProductos}
                    onChange={handleSelectProducto}
                    placeholder="Buscar producto..."
                    isClearable
                    className="w-full"
                  />
                </div>
                <br></br>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    value={descripcionDetalle}
                    onChange={(e) => setDescripcionDetalle(e.target.value)}
                    placeholder="Descripcion"
                    className="block w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

              {/* Mostrar productos seleccionados */}
              <div className="mb-4">
                {productosSeleccionados.length > 0 && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Producto</th>
                        <th scope="col" className="px-6 py-3">Código</th>
                        <th scope="col" className="px-6 py-3">Talla</th>
                        <th scope="col" className="px-6 py-3">Cantidad</th>
                        <th scope="col" className="px-6 py-3">Descripcion</th>
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
                          <td className="px-6 py-4">{detalle.descripcionDetalle}</td>
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
                )}
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
                  Guardar Devolucion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mostrar los devoluciones agregados */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
    <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th scope="col" className="px-6 py-3">ID</th>
        <th scope="col" className="px-6 py-3">Fecha Devolución</th>
        <th scope="col" className="px-6 py-3">Razón</th>
        <th scope="col" className="px-6 py-3">Estado</th>
        <th scope="col" className="px-6 py-3">Descripción</th>
        <th scope="col" className="px-6 py-3">Solicitud</th>
        <th scope="col" className="px-6 py-3">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {devoluciones.map((devolucion) => (
        <tr
          key={devolucion.id}
          className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
        >
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.id}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.fecha_devolucion}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.razon}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.estado === 1 ? 'Pendiente' : devolucion.estado === 2 ? 'Recibido' : 'Cancelado'}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.descripcionDetalle}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {devolucion.solicitud ? devolucion.solicitud.id : 'N/A'}
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => abrirModalDetalles(devolucion.id)}
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline p-3"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => handleEliminarDevolucion(devolucion.id)}
              className="text-white bg-red-500 hover:bg-red-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Modal para mostrar los detalles del devolucion */}
{showDetallesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Detalles del Devolucion {devolucionSeleccionado}</h2>

      {/* Botón para cerrar el modal */}
      <button
        onClick={cerrarModalDetalles}
        className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 mb-4"
      >
        Cerrar
      </button>

      {/* Tabla de detalles del devolucion */}
      {detallesDevolucion.length > 0 ? (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {detallesDevolucion.map((detalle) => (
              <tr key={detalle.id}>
                <td className="border px-4 py-2">{detalle.producto.nombre} - {detalle.producto.codigo}</td>
                <td className="border px-4 py-2">{detalle.cantidad}</td>
                <td className="border px-4 py-2">{detalle.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay detalles para este devolucion.</p>
      )}
    </div>
  </div>
)}

    </div>
  );
}