import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Select from 'react-select';
import DevolucionModal from '../../components/DevolucionModal';

export default function Solicitudes() {
  const fechaActual = new Date().toISOString().split('T')[0];
  const [showModal, setShowModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
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
  const [detallesSolicitud, setDetallesSolicitud] = useState([]);
  const [solicitudSeleccionado, setSolicitudSeleccionado] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [solicitudesPerPage] = useState(10); // Número de solicitudes por página
  const indexOfLastSolicitud = currentPage * solicitudesPerPage;
  const indexOfFirstSolicitud = indexOfLastSolicitud - solicitudesPerPage;
  const currentSolicitudes = solicitudes.slice(indexOfFirstSolicitud, indexOfLastSolicitud);
  const opcionesProductos = productos.map((producto) => ({
    value: producto.id,
    label: `${producto.codigo} - ${producto.nombre} - ${producto.talla}`,
  }));
  
  const handleSelectProducto = (selectedOption) => {
    setProductoId(selectedOption ? selectedOption.value : '');
  };


  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(solicitudes.length / solicitudesPerPage); i++) {
    pageNumbers.push(i);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solicitudId, setSolicitudId] = useState(null);

  const openModal = (id) => {
    setSolicitudId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSolicitudId(null);
  };

  const handleDevolucionCreated = () => {
    // Optionally refresh solicitudes or update state here
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();



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
          producto_id: detalle.productoId,
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

  const handleEliminarSolicitud = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta Solicitud?')) {
      try {
        await axiosInstance.delete(`gestion/solicitudes/${id}/`);
        setSolicitudes(solicitudes.filter((solicitud) => solicitud.id !== id));
        setSuccess('Solicitud eliminada exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar la Solicitud. Intenta de nuevo.');
      }
    }
  };

  const actualizarEstadoSolicitud = async (solicitudId) => {
    try {
      // Actualizar el estado de la solicitud a 2 (aprobada)
      const response = await axiosInstance.patch(`gestion/solicitudes/${solicitudId}/`, {
        estado: 2,
      });
      
      console.log('Estado actualizado:', response.data);
      
      // Obtener los detalles de la solicitud
      const detallesResponse = await axiosInstance.get(`gestion/detalles_solicitud/solicitud/${solicitudId}/`);
      const detallesSolicitud = detallesResponse.data;
  
      // Actualizar el stock de los productos en base a los detalles de la solicitud
      for (let detalle of detallesSolicitud) {
        const productoId = detalle.producto.id;
        const cantidadSolicitada = detalle.cantidad;
        
        // Obtener el producto actual para obtener el stock_almacen actual
        const productoResponse = await axiosInstance.get(`gestion/productos/${productoId}/`);
        const producto = productoResponse.data;
  
        // Calcular el nuevo stock almacen
        const nuevoStockAlmacen = producto.stock_almacen - cantidadSolicitada;
  
        // Actualizar el stock_almacen del producto
        await axiosInstance.patch(`gestion/productos/${productoId}/`, {
          stock_almacen: nuevoStockAlmacen,
        });
  
        console.log(`Stock actualizado para el producto ${producto.nombre}: ${nuevoStockAlmacen}`);
      }
  
      alert('Solicitud aprobada y stock actualizado exitosamente');
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar el estado de la solicitud o el stock de los productos:', error);
      alert('Hubo un error al intentar aprobar la solicitud y actualizar el stock.');
    }
  };

  const handleAtenderSolicitud = async (id) => {
    try {
      // Update the backend
      await axiosInstance.patch(`gestion/solicitudes/${id}/`, { estado: 2 });
      
      // Update the main solicitudes array in the frontend
      setSolicitudes((prevSolicitudes) =>
        prevSolicitudes.map((solicitud) =>
          solicitud.id === id ? { ...solicitud, estado: 2 } : solicitud
        )
      );
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  
  
  const abrirModalDetalles = async (solicitudId) => {
    setShowDetallesModal(true); // Mostrar el modal de detalles
    setSolicitudSeleccionado(solicitudId); // Guardar el devolucion seleccionado

    try {
      const response = await axiosInstance.get(`gestion/detalles_solicitud/solicitud/${solicitudId}/`);
      setDetallesSolicitud(response.data); // Guardar los detalles del devolucion
    } catch (error) {
      setError('Error al obtener los detalles de la solicitud.');
    }
  };

  const cerrarModalDetalles = () => {
    setShowDetallesModal(false);
    setDetallesSolicitud([]);
    setSolicitudSeleccionado(null);
    setError('');
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
                <label className="block text-sm font-medium text-gray-700">Productos</label>
                <div className="flex space-x-4">
                <Select
                    options={opcionesProductos}
                    onChange={handleSelectProducto}
                    placeholder="Buscar producto..."
                    isClearable
                    className="w-3/4"
                  />

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
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Fecha de Solicitud</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Stand</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSolicitudes.map((solicitud) => (
              <tr key={solicitud.id} className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500">
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {solicitud.id}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {solicitud.fecha_solicitud}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {solicitud.estado === 1 ? 'Pendiente' : solicitud.estado === 2 ? 'Aprobada' : solicitud.estado === 3 ? 'Devuelta' :'Rechazada'}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                  {solicitud.stand.nombre} ({solicitud.stand.ubicacion})
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => abrirModalDetalles(solicitud.id)} className="text-white bg-blue-500 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5">Ver Detalles</button>
                  <button onClick={() => handleEliminarSolicitud(solicitud.id)} className="text-white bg-red-500 hover:bg-red-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5">Eliminar</button>

                  {/* Botón para cambiar el estado */}
                  {solicitud.estado === 1 && (
                    <button onClick={() => handleAtenderSolicitud(solicitud.id)} className="text-white bg-green-500 hover:bg-green-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ml-2">
                      Atender
                    </button>
                  )}
                  {solicitud.estado === 2 && (
                    <button onClick={() => openModal(solicitud.id)} className="text-white bg-yellow-500 hover:bg-yellow-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ml-2">
                    Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <DevolucionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        solicitudId={solicitudId}
        onDevolucionCreated={handleDevolucionCreated}
      />


    {/* Paginación */}
    <div className="flex justify-center mt-4">
      {pageNumbers.map((number) => (
        <button key={number} onClick={() => setCurrentPage(number)} className={`px-4 py-2 mx-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          {number}
        </button>
      ))}
    </div>
  </div>

    
      {showDetallesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Detalles de la Solicitud {solicitudSeleccionado}</h2>

            {/* Botón para cerrar el modal */}
            <button
              onClick={cerrarModalDetalles}
              className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 mb-4"
            >
              Cerrar
            </button>

            {/* Tabla de detalles del devolucion */}
            {detallesSolicitud.length > 0 ? (
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesSolicitud.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td className="border px-4 py-2">{solicitud.producto.nombre} - {solicitud.producto.codigo} - {solicitud.producto.talla}</td>
                      <td className="border px-4 py-2">{solicitud.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay detalles para esta solicitud.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
