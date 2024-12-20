import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Select from 'react-select';
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
  const [filtroStand, setFiltroStand] = useState(null);
  const [stands, setStands] = useState([]); // Opciones de stands
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Movimientos por página
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroDia, setFiltroDia] = useState("");

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

 
  // Generar dinámicamente opciones para los filtros
  const anios = [...new Set(movimientos.map((mov) => new Date(mov.fecha_movimiento).getFullYear()))];
  const meses = [...new Set(movimientos.map((mov) => new Date(mov.fecha_movimiento).getMonth() + 1))];
  const dias = [...new Set(movimientos.map((mov) => new Date(mov.fecha_movimiento).getDate()))];

  const opcionesStand = [
    { value: "", label: "Todos los Stands" },
    ...stands.map((stand) => ({ value: stand.id, label: stand.nombre })),
  ];

  // Filtrar movimientos según stand, año, mes y día
  const movimientosFiltrados = movimientos.filter((mov) => {
    const fecha = new Date(mov.fecha_movimiento);
    return (
      (!filtroStand || mov.stand === parseInt(filtroStand)) &&
      (!filtroAnio || fecha.getFullYear() === parseInt(filtroAnio)) &&
      (!filtroMes || fecha.getMonth() + 1 === parseInt(filtroMes)) &&
      (!filtroDia || fecha.getDate() === parseInt(filtroDia))
    );
  });
  

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
        console.log(response.data)
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
    const fetchStands = async () => {
      try {
        const response = await axiosInstance.get('gestion/stands/'); // Ajusta el endpoint según tu API
        setStands(response.data);
      } catch (error) {
        console.error('Error al obtener los stands:', error);
      }
    };

    const fetchData = async () => {
      try {
        const [movResponse, standsResponse] = await Promise.all([
          axiosInstance.get("gestion/movimientos/"),
          axiosInstance.get("gestion/stands/"),
        ]);

        setMovimientos(movResponse.data);
        setStands(standsResponse.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  
    fetchStands();
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovimientos = movimientosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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


      {/* Filtros */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Filtro Stand */}
        <div>
          <label className="block text-sm font-medium mb-2">Stand</label>
          <select
            value={filtroStand}
            onChange={(e) => setFiltroStand(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md"
          >
            {opcionesStand.map((stand) => (
              <option key={stand.value} value={stand.value}>
                {stand.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Año */}
        <div>
          <label className="block text-sm font-medium mb-2">Año</label>
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md"
          >
            <option value="">Todos los Años</option>
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Mes */}
        <div>
          <label className="block text-sm font-medium mb-2">Mes</label>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md"
          >
            <option value="">Todos los Meses</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {mes.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Día */}
        <div>
          <label className="block text-sm font-medium mb-2">Día</label>
          <select
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md"
          >
            <option value="">Todos los Días</option>
            {dias.map((dia) => (
              <option key={dia} value={dia}>
                {dia.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="overflow-x-auto shadow-md">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">Producto</th>
                <th scope="col" className="px-6 py-3">Código</th>
                <th scope="col" className="px-6 py-3">Cantidad</th>
                <th scope="col" className="px-6 py-3">Tipo de movimiento</th>
                <th scope="col" className="px-6 py-3">Transacción</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
              {/* <th scope="col" className="px-6 py-3">Stand</th> */}
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov) => (
              <tr key={mov.id} className="bg-white border-b">
                <td className="px-6 py-4">{mov.producto.codigo} / {mov.producto.nombre} / {mov.producto.talla}</td>
                <td className="px-6 py-4">{mov.producto.codigo}</td>
                <td className="px-6 py-4">{mov.cantidad}</td>
                <td className="px-6 py-4">{mov.tipo_mov.nombre}</td>
                <td className="px-6 py-4">{mov.codigo_trans}</td>
                <td className="px-6 py-4">{mov.fecha_movimiento}</td>
                {/* <td className="px-6 py-4">{mov.stand}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
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
