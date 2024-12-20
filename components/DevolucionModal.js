import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // if using react-modal
import axiosInstance from '../utils/axiosConfig';
import Select from 'react-select';
Modal.setAppElement('#__next');

const DevolucionModal = ({ isOpen, onClose, solicitudId, onDevolucionCreated }) => {
  const [razon, setRazon] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split('T')[0]);
  const [detalleProductos, setDetalleProductos] = useState([]); // Productos de la solicitud
  const [productos, setProductos] = useState([]); // Productos seleccionados para devolución
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [showCodigoTransForm, setShowCodigoTransForm] = useState(false);
  const [codigoTrans, setCodigoTrans] = useState('');
  const [diferencia, setDiferencia] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0); // índice actual del producto

  // Obtener detalles de la solicitud
  useEffect(() => {
    const fetchDetalleProductos = async () => {
      try {
        const response = await axiosInstance.get(`gestion/detalles_solicitud/solicitud/${solicitudId}/`);
        setDetalleProductos(response.data);
      } catch (error) {
        console.error('Error al obtener los detalles de la solicitud:', error);
      }
    };
    if (solicitudId) {
      fetchDetalleProductos();
    }
  }, [solicitudId]);

  // Agregar producto a la lista de devolución
  const handleAddProduct = () => {
    // Encuentra la cantidad máxima permitida para el producto seleccionado
    const maxCantidad = detalleProductos.find((prod) => prod.producto.id === Number(selectedProduct))?.cantidad || 0;

    if (cantidad > maxCantidad) {
      alert(`La cantidad no puede exceder ${maxCantidad} para este producto.`);
      return;
    }

    setProductos([...productos, { producto: selectedProduct, cantidad }]);
    setSelectedProduct('');
    setCantidad(0);
  };

  // Enviar la Devolución y los DetalleDevolucion
  // Comienza a procesar cada producto y pausa si es necesario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const devolucionResponse = await axiosInstance.post('gestion/devoluciones/', {
        solicitud_id: solicitudId,
        razon,
        descripcion,
        fecha_devolucion: fechaDevolucion,
        estado: 1
      });

      await axiosInstance.patch(`gestion/solicitudes/${solicitudId}/`, {
        estado: 3
      });

      const devolucionId = devolucionResponse.data.id;
      setCurrentIndex(0); // Comienza desde el primer producto
      await procesarProductos(devolucionId, 0); // Inicia el procesamiento
    } catch (error) {
      console.error('Error al crear la devolución:', error);
    }
  };

  const registrarMovimiento = async (productoId, diferencia) => {
    const response = await axiosInstance.get(`gestion/solicitudes/${solicitudId}/`);
    console.log(response.data)
    // Registrar el Movimiento con el codigo_trans ingresado
    await axiosInstance.post('gestion/movimientos/', {
      producto_id: productoId,
      cantidad: diferencia,
      fecha_movimiento: new Date().toISOString().split('T')[0],
      tipo_mov_id: 1,
      stand: response.data.stand.id,
      estado: 1,
      codigo_trans: codigoTrans
    });
    
    const productoResponse = await axiosInstance.get(`gestion/productos/${productoId}/`);
    const producto = productoResponse.data;
  
    // Actualizar el stock del producto
    const nuevoStockTotal = Number(producto.stock_total) - Number(diferencia);


    await axiosInstance.patch(`gestion/productos/${productoId}/`, {
      stock_total: nuevoStockTotal,
    });

    // Restablecer estado del formulario de código de transacción
    setCodigoTrans('');
    setShowCodigoTransForm(false);
    await procesarProductos(currentIndex); // Reanudar el procesamiento desde el último índice
  };

  // Función para procesar productos
  const procesarProductos = async (devolucionId, startIndex) => {
    for (let i = startIndex; i < productos.length; i++) {
      const prod = productos[i];
      await axiosInstance.post('gestion/detalles_devolucion/', {
        devolucion: devolucionId,
        producto_id: prod.producto,
        cantidad: prod.cantidad,
        descripcion: 'Producto devuelto a almacén',
        estado: 1
      });

      const detalleSolicitud = detalleProductos.find((detalle) => detalle.producto.id === Number(prod.producto));
      const cantidadSolicitada = detalleSolicitud ? detalleSolicitud.cantidad : 0;
      const diferenciaActual = cantidadSolicitada - prod.cantidad;

      if (diferenciaActual > 0) {
        setSelectedProduct(prod.producto);
        setDiferencia(diferenciaActual);
        setCurrentIndex(i + 1); // Guardar el índice para continuar después
        setShowCodigoTransForm(true); // Mostrar el formulario
        return; // Pausar el procesamiento de productos
      }

      await registrarMovimiento(prod.producto, diferenciaActual);
    }

    finalizarProceso(); // Llamar a finalizar si todos los productos se procesaron
  };

  const finalizarProceso = () => {
    setRazon('');
    setDescripcion('');
    setProductos([]);
    onDevolucionCreated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Crear Devolución</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Razón de la devolución</label>
            <input 
              type="text" 
              value={razon} 
              onChange={(e) => setRazon(e.target.value)} 
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
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Fecha de Devolución</label>
            <input 
              type="date" 
              value={fechaDevolucion} 
              onChange={(e) => setFechaDevolucion(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <h3 className="text-lg font-medium text-gray-700 mb-4">Productos a Devolver</h3>
          <div className="product-input flex space-x-4 mb-4">
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar Producto</option>
              {detalleProductos.map((detalle) => (
                <option key={detalle.producto.id} value={detalle.producto.id}>
                  {detalle.producto.nombre} - {detalle.producto.codigo} - {detalle.producto.talla} -  Máx: {detalle.cantidad}
                </option>
              ))}
            </select>
            
            <input 
              type="number" 
              placeholder="Cantidad" 
              value={cantidad} 
              onChange={(e) => setCantidad(parseInt(e.target.value))}
              min="1"
              className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            
            <button 
              type="button" 
              onClick={handleAddProduct} 
              className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Agregar Producto
            </button>
          </div>

          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Producto</th>
                <th scope="col" className="px-6 py-3">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{detalleProductos.find((detalle) => detalle.producto.id === Number(prod.producto))?.producto.nombre}</td>
                  
                  <td className="px-6 py-4">{prod.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
            >
              Crear Devolución
            </button>
          </div>
        </form>
      </div>
      {showCodigoTransForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Ingresar Código de Transacción</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await registrarMovimiento(selectedProduct, diferencia);
                }}
              >
                <label className="block text-sm font-medium text-gray-700">Código de Transacción</label>
                <input
                  type="text"
                  value={codigoTrans}
                  onChange={(e) => setCodigoTrans(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    Guardar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </Modal>

  );
};

export default DevolucionModal;
