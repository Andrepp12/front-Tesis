import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Pedidos() {
  const fechaActual = new Date().toISOString().split('T')[0];
  const [showModal, setShowModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [proveedor, setProveedor] = useState('');
  const [factura, setFactura] = useState('');
  const [fechaPedido, setFechaPedido] = useState(fechaActual);
  const [fechaEntrega, setFechaEntrega] = useState(fechaActual);
  // const [precioTotal, setPrecioTotal] = useState(0);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  
  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Crear el pedido
      const pedidoResponse = await axiosInstance.post('gestion/pedidos/', {
        proveedor_id: proveedor,
        factura,
        fecha_pedido: fechaPedido,
        fecha_entrega: fechaEntrega,
        precio_total: calcularPrecioTotal(),
        estado: 1,
      });
  
      const pedidoId = pedidoResponse.data.id;
  
      // Crear los DetallePedido asociados al pedido y actualizar stock
      const detallesPromises = productosSeleccionados.map(async (detalle) => {
        try {
          // Registrar el detalle del pedido
          const response = await axiosInstance.post('gestion/detalles_pedido/', {
            pedido: pedidoId,
            producto_id: detalle.productoId,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            estado: 1,
          });
  
          console.log('Detalle registrado correctamente:', response.data);
  
          // Obtener el producto actual para actualizar su stock
          const productoResponse = await axiosInstance.get(`gestion/productos/${detalle.productoId}/`);
          const producto = productoResponse.data;
  
          // Asegurarse de que las operaciones son numéricas
          const nuevoStockAlmacen = Number(producto.stock_almacen) + Number(detalle.cantidad);
          const nuevoStockTotal = Number(producto.stock_total) + Number(detalle.cantidad);
  
          // Actualizar el stock del producto
          await axiosInstance.patch(`gestion/productos/${detalle.productoId}/`, {
            stock_almacen: nuevoStockAlmacen,
            stock_total: nuevoStockTotal,
          });
  
          console.log(`Stock actualizado para el producto ${producto.nombre}: ${nuevoStockAlmacen}`);
  
          // Registrar el movimiento
          await axiosInstance.post('gestion/movimientos/', {
            producto_id: detalle.productoId,
            cantidad: detalle.cantidad,
            valor_unitario: detalle.precio_unitario,
            monto: detalle.cantidad * detalle.precio_unitario,
            fecha_movimiento: fechaEntrega,
            codigo_trans: pedidoId,
            estado: 1,
            tipo_mov_id: 2, // Tipo de movimiento 2
          });
  
          console.log(`Movimiento registrado para el producto ${producto.nombre}`);
          
          return response.data;
        } catch (error) {
          console.error('Error al registrar el detalle, actualizar el stock o registrar el movimiento:', error);
          throw error; // Re-lanza el error para ser capturado por Promise.all
        }
      });
  
      // Ejecutar todas las promesas de los detalles y actualización de stock
      await Promise.all(detallesPromises);
  
      // Actualizar la lista de pedidos
      setPedidos([...pedidos, pedidoResponse.data]);
  
      setSuccess('Pedido, productos y movimientos agregados exitosamente');
      setError('');
      setShowModal(false); // Cerrar el modal
      resetForm();
    } catch (error) {
      setError('Error al agregar el pedido. Intenta de nuevo.');
      setSuccess('');
    }
  };
  
  
  const handleEliminarPedido = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este Pedido?')) {
      try {
        await axiosInstance.delete(`gestion/pedidos/${id}/`);
        setPedidos(pedidos.filter((pedido) => pedido.id !== id));
        setSuccess('Pedido eliminada exitosamente');
        setError('');
      } catch (error) {
        setError('Error al eliminar el Pedido. Intenta de nuevo.');
      }
    }
  };

  const abrirModalDetalles = async (pedidoId) => {
    setShowDetallesModal(true); // Mostrar el modal de detalles
    setPedidoSeleccionado(pedidoId); // Guardar el pedido seleccionado

    try {
      const response = await axiosInstance.get(`gestion/detalles_pedido/pedido/${pedidoId}/`);
      setDetallesPedido(response.data); // Guardar los detalles del pedido
    } catch (error) {
      setError('Error al obtener los detalles del pedido.');
    }
  };

  const cerrarModalDetalles = () => {
    setShowDetallesModal(false);
    setDetallesPedido([]);
    setPedidoSeleccionado(null);
    setError('');
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    resetForm();
    setShowModal(false);
    setDetallesPedido([]);
    setPedidoSeleccionado(null);
    setError('');
  };

  // Añadir el producto seleccionado a la lista de productos
  const agregarProducto = () => {
    if (productoId && cantidad && precioUnitario) {
      const productoSeleccionado = productos.find((p) => p.id === parseInt(productoId));

      if (productoSeleccionado) {
        setProductosSeleccionados([
          ...productosSeleccionados,
          {
            productoId,
            cantidad,
            nombre: productoSeleccionado.nombre,
            codigo: productoSeleccionado.codigo,
            precio_unitario: precioUnitario,
          },
        ]);
        // Limpiar después de agregar
        setProductoId('');
        setCantidad('');
        setPrecioUnitario('');
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

  // Calcular el precio total
  const calcularPrecioTotal = () => {
    return productosSeleccionados.reduce((total, producto) => {
      return total + producto.precio_unitario * producto.cantidad;
    }, 0);
  };

  const resetForm = () => {
    setProveedor('');
    setFactura('');
    setFechaPedido(fechaActual);
    setFechaEntrega(fechaActual);
    setProductosSeleccionados([]);
    setPrecioTotal(0);
  };

  // Fetch de proveedores y productos
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await axiosInstance.get('gestion/proveedores/');
        setProveedores(response.data);
      } catch (error) {
        console.error('Error fetching proveedores:', error);
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

    const fetchPedidos = async () => {
      try {
        const response = await axiosInstance.get('gestion/pedidos/');
        setPedidos(response.data);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
        setError('No se pudieron cargar los pedidos. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchProveedores();
    fetchProductos();
    fetchPedidos();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Pedidos</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar Pedido
      </button>

      {/* Modal para agregar pedido */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Pedido</h2>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                <select
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre} - {prov.ruc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Factura</label>
                <input
                  type="text"
                  value={factura}
                  onChange={(e) => setFactura(e.target.value.replace(/\D/g, ''))} // Reemplazar todo lo que no sea número
                  required
                  pattern="^\d+$"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>


              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Pedido</label>
                <input
                  type="date"
                  value={fechaPedido}
                  onChange={(e) => setFechaPedido(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Entrega</label>
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Productos</label>
                <div className="flex space-x-4">
                  <select
                    value={productoId}
                    onChange={(e) => setProductoId(e.target.value)}
                    className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Seleccionar Producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.codigo} - {producto.nombre} - {producto.precio}
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
                  <input
                    type="number"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    placeholder="Precio Unidad"
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

              {/* Mostrar productos seleccionados */}
              <div className="mb-4">
                {productosSeleccionados.length > 0 && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Producto</th>
                        <th scope="col" className="px-6 py-3">Cantidad</th>
                        <th scope="col" className="px-6 py-3">Precio Unitario</th>
                        <th scope="col" className="px-6 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosSeleccionados.map((detalle, index) => (
                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{detalle.nombre}</td>
                          <td className="px-6 py-4">{detalle.cantidad}</td>
                          <td className="px-6 py-4">{detalle.precio_unitario}</td>
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Precio Total</label>
                <input
                  type="number"
                  value={calcularPrecioTotal()}
                  readOnly
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
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mostrar los pedidos agregados */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
    <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        <th scope="col" className="px-6 py-3">ID</th>
        <th scope="col" className="px-6 py-3">Fecha Pedido</th>
        <th scope="col" className="px-6 py-3">Fecha Entrega</th>
        <th scope="col" className="px-6 py-3">Estado</th>
        <th scope="col" className="px-6 py-3">Proveedor</th>
        <th scope="col" className="px-6 py-3">Precio Total</th>
        <th scope="col" className="px-6 py-3">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {pedidos.map((pedido) => (
        <tr
          key={pedido.id}
          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
        >
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pedido.id}</td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pedido.fecha_pedido}</td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pedido.fecha_entrega}</td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
            {pedido.estado === 1 ? 'Pendiente' : pedido.estado === 2 ? 'Recibido' : 'Cancelado'}
          </td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pedido.proveedor.nombre}</td>
          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pedido.precio_total}</td>
          <td className="px-6 py-4">
            <button
              onClick={() => abrirModalDetalles(pedido.id)}
              className="text-white bg-blue-500 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Ver Detalles
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
        {/* Modal para mostrar los detalles del pedido */}
      {showDetallesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Detalles del Pedido {pedidoSeleccionado}</h2>

            {/* Botón para cerrar el modal */}
            <button
              onClick={cerrarModalDetalles}
              className="text-white bg-red-500 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 mb-4"
            >
              Cerrar
            </button>

            {/* Tabla de detalles del pedido */}
            {detallesPedido.length > 0 ? (
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cantidad</th>
                    <th className="px-4 py-2">Precio Unitario</th>
                    <th className="px-4 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesPedido.map((detalle) => (
                    <tr key={detalle.id}>
                      <td className="border px-4 py-2">{detalle.producto.nombre} - {detalle.producto.codigo}</td>
                      <td className="border px-4 py-2">{detalle.cantidad}</td>
                      <td className="border px-4 py-2">{detalle.precio_unitario}</td>
                      <td className="border px-4 py-2">{detalle.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay detalles para este pedido.</p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
