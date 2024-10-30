import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Select from 'react-select';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [filtroProducto, setFiltroProducto] = useState(null); // Estado para el filtro de producto
  const contentRef = useRef();

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'pt',
      format: 'a4'
    });

    // Título y fecha en el encabezado
    const title = filtroProducto?.value 
    ? `Kardex del producto ${filtroProducto.value}` 
    : `Reporte de Movimientos`;

console.log(title);

    
    const date = new Date().toLocaleDateString();

    doc.setFontSize(16);
    doc.text(title, 20, 40); // Posición del título
    doc.setFontSize(12);
    doc.text(`Fecha: ${date}`, 20, 60); // Posición de la fecha

    // Agregar el contenido de la página al PDF
    doc.html(contentRef.current, {
      callback: (pdf) => {
        pdf.save('download.pdf');
      },
      x: 10,
      y: 80, // Ajuste para no superponer el título y la fecha
      html2canvas: {
        scale: 0.48,
      },
      margin: [20, 20, 20, 20]
    });
  };

 
  // Obtener una lista única de nombres de productos para el filtro
  const productosUnicos = [...new Set(movimientos.map((movimiento) => movimiento.producto.nombre))];

  // Crear opciones para react-select
  const opcionesProducto = [
    { value: '', label: 'Todos los Productos' },
    ...productosUnicos.map((producto) => ({ value: producto, label: producto }))
  ];

  // Filtrar movimientos según el producto seleccionado
  const movimientosFiltrados = filtroProducto && filtroProducto.value
    ? movimientos.filter((movimiento) => movimiento.producto.nombre === filtroProducto.value)
    : movimientos;

  // Calcular el stock acumulado para cada movimiento
  const movimientosConStock = movimientosFiltrados.reduce((acc, movimiento, index) => {
    const tipoMovResta = [1, 4, 6, 8, 9, 11];
    const cantidad = movimiento.cantidad;
    const stock = (index === 0 ? 0 : acc[index - 1].stock) + (tipoMovResta.includes(movimiento.tipo_mov.id) ? -cantidad : cantidad);
    acc.push({ ...movimiento, stock });
    return acc;
  }, []);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await axiosInstance.get('gestion/movimientos/');
        setMovimientos(response.data);
      } catch (error) {
        console.error('Error al obtener los movimientos:', error);
      }
    };

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
    const selectedProducto = productos.find((producto) => producto.id === parseInt(selectedProductoId));
    if (selectedProducto) {
      setValorUnitario(selectedProducto.precio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const movimientoData = {
      producto_id: productoId,
      cantidad,
      fecha_movimiento: fechaMovimiento,
      tipo_mov_id: tipoMovId,
    };
  
    try {
      // Crear el movimiento
      const response = await axiosInstance.post('gestion/movimientos/', movimientoData);
      setMovimientos([response.data, ...movimientos]); // Añadir el nuevo movimiento a la lista
  
      // Obtener el stock actual del producto
      const productoResponse = await axiosInstance.get(`gestion/productos/${productoId}/`);
      const stockActual = productoResponse.data.stock_total;
  
      // Definir tipos de movimientos que restan stock
      const tiposRestanStock = [1, 4, 6, 8, 9, 11];
  
      // Calcular el nuevo stock
      const nuevoStock = tiposRestanStock.includes(tipoMovId)
        ? stockActual - cantidad // Restar si el tipo de movimiento está en la lista
        : stockActual + cantidad; // Sumar si no está en la lista
  
      // Actualizar el stock total del producto en la base de datos
      await axiosInstance.patch(`gestion/productos/${productoId}/`, {
        stock_total: nuevoStock,
      });
  
      // Cerrar el modal y reiniciar el formulario
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error al agregar el movimiento o actualizar el stock:', error);
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
      <button
        type="button"
        onClick={handleDownloadPdf}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        Descargar PDF
      </button>


      {/* Tabla de Movimientos */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Filtrar por Producto:</label>
          <Select
            value={filtroProducto}
            onChange={setFiltroProducto}
            options={opcionesProducto}
            className="mt-1"
            isClearable
            placeholder="Selecciona un producto"
          />
        </div>
        <div ref={contentRef} style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        {/* Tabla de movimientos con stock acumulado */}
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Tipo de Movimiento</th>
              <th scope="col" className="px-6 py-3">Código de Operación</th>
              <th scope="col" className="px-6 py-3">Cantidad</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              {filtroProducto && filtroProducto.value && (
                <th scope="col" className="px-6 py-3">Stock</th>
              )}
            </tr>
          </thead>
          <tbody>
            {movimientosConStock
              .sort((a, b) => new Date(a.fecha_movimiento) - new Date(b.fecha_movimiento))
              .map((movimiento) => (
                <tr
                  key={movimiento.id}
                  className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  <td className="px-6 py-4">{movimiento.producto.nombre}</td>
                  <td className="px-6 py-4">{movimiento.tipo_mov.nombre}</td>
                  <td className="px-6 py-4">{movimiento.codigo_trans ?? '-'}</td>
                  <td className="px-6 py-4">{movimiento.cantidad}</td>
                  <td className="px-6 py-4">{movimiento.fecha_movimiento}</td>
                  {filtroProducto && filtroProducto.value && (
                    <td className="px-6 py-4">{movimiento.stock}</td>
                  )}
                </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal para agregar movimiento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Agregar Movimiento</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                
                <Select
                  value={productoId}
                  onChange={handleProductoChange}
                  options={opcionesProducto}
                  className="mt-1"
                  isClearable
                  required
                  placeholder="Selecciona un producto"
                />
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
