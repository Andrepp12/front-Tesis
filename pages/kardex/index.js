import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [showModal, setShowModal] = useState(false); // Para controlar el modal de agregar
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [fechaMovimiento, setFechaMovimiento] = useState('');
  const [tipoMovId, setTipoMovId] = useState('');
  const [productos, setProductos] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);

  useEffect(() => {
    // Obtener todos los movimientos
    const fetchMovimientos = async () => {
      try {
        const response = await axiosInstance.get('gestion/movimientos/');
        setMovimientos(response.data);
      } catch (error) {
        console.error('Error al obtener los movimientos:', error);
      }
    };

    // Obtener todos los productos y tipos de movimiento para el modal
    const fetchProductos = async () => {
      try {
        const response = await axiosInstance.get('gestion/productos/');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    const fetchTiposMovimiento = async () => {
      try {
        const response = await axiosInstance.get('gestion/tipo_movimiento/');
        setTiposMovimiento(response.data);
      } catch (error) {
        console.error('Error al obtener tipos de movimiento:', error);
      }
    };

    fetchMovimientos();
    fetchProductos();
    fetchTiposMovimiento();
  }, []);

  const handleProductoChange = (e) => {
    const selectedProductoId = e.target.value;
    setProductoId(selectedProductoId);

    // Encontrar el producto seleccionado y actualizar el valor unitario
    const selectedProducto = productos.find((producto) => producto.id === parseInt(selectedProductoId));
    if (selectedProducto) {
      setValorUnitario(selectedProducto.precio); // Asignar el precio al valor unitario
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const movimientoData = {
      producto_id: productoId,
      cantidad,
      valor_unitario: valorUnitario,
      fecha_movimiento: fechaMovimiento,
      tipo_mov_id: tipoMovId,
      monto: cantidad * valorUnitario,
    };

    try {
      const response = await axiosInstance.post('gestion/movimientos/', movimientoData);
      setMovimientos([response.data, ...movimientos]); // Añadir el nuevo movimiento a la lista
      setShowModal(false); // Cerrar el modal
      resetForm();
    } catch (error) {
      console.error('Error al agregar el movimiento:', error);
    }
  };

  const resetForm = () => {
    setProductoId('');
    setCantidad('');
    setValorUnitario('');
    setFechaMovimiento('');
    setTipoMovId('');
  };

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Movimientos</h1>
      
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar Movimiento
      </button>

      {/* Tabla de Movimientos */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Tipo de Movimiento</th>
              <th scope="col" className="px-6 py-3">Código de Operación</th>
              <th scope="col" className="px-6 py-3">Cantidad</th>
              <th scope="col" className="px-6 py-3">Valor Unitario</th>
              <th scope="col" className="px-6 py-3">Monto</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientos
              .sort((a, b) => new Date(a.fecha_movimiento) - new Date(b.fecha_movimiento)) // Ordenar del más antiguo al más reciente
              .map((movimiento) => (
              <tr key={movimiento.id} className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500">
                <td className="px-6 py-4">{movimiento.producto.nombre}</td>
                <td className="px-6 py-4">{movimiento.tipo_mov.nombre}</td>
                <td className="px-6 py-4">{movimiento.codigo_trans ?? '-'}</td>
                <td className="px-6 py-4">{movimiento.cantidad}</td>
                <td className="px-6 py-4">${movimiento.valor_unitario}</td>
                <td className="px-6 py-4">${movimiento.monto}</td>
                <td className="px-6 py-4">{movimiento.fecha_movimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar movimiento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Agregar Movimiento</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <select
                  value={productoId}
                  onChange={handleProductoChange} // Usar handleProductoChange aquí
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Seleccionar Producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Valor Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Fecha de Movimiento</label>
                <input
                  type="date"
                  value={fechaMovimiento}
                  onChange={(e) => setFechaMovimiento(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tipo de Movimiento</label>
                <select
                  value={tipoMovId}
                  onChange={(e) => setTipoMovId(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Tipo de Movimiento</option>
                  {tiposMovimiento.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
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
    </div>
  );
}
