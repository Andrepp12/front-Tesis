import React, { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../utils/axiosConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";


export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtroProducto, setFiltroProducto] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar movimientos y productos
        const [movResponse, prodResponse] = await Promise.all([
          axiosInstance.get("gestion/movimientos/"),
          axiosInstance.get("gestion/productos/"),
        ]);

        setMovimientos(movResponse.data);
        setProductos(prodResponse.data);
      } catch (error) {
        setError("Error al cargar los datos. Intenta nuevamente.");
      }
    };

    fetchData();
  }, []);

  // Crear opciones únicas de productos agrupados por código y nombre
  const opcionesProductos = [
    ...new Map(
      productos.map((producto) => [
        `${producto.codigo}-${producto.nombre}`,
        {
          value: producto.codigo,
          label: `${producto.codigo} - ${producto.nombre}`,
          nombre: producto.nombre,
        },
      ])
    ).values(),
  ];

  // Filtrar movimientos según el producto seleccionado
  const movimientosFiltrados = filtroProducto
    ? movimientos.filter(
        (mov) =>
          mov.producto.codigo === filtroProducto.value &&
          mov.producto.nombre === filtroProducto.nombre
      )
    : movimientos;

  // Agrupar movimientos por producto ID y ordenar por fecha
  const movimientosAgrupados = movimientosFiltrados.reduce((acc, mov) => {
    if (!acc[mov.producto.id]) {
      acc[mov.producto.id] = [];
    }
    acc[mov.producto.id].push(mov);
    return acc;
  }, {});

  // Tipos de movimiento que restan
  const tiposRestan = [1, 4, 6, 8, 9, 11];

  // Ordenar cada subgrupo por fecha y calcular frecuencia acumulada
  const subgruposConFrecuencia = Object.values(movimientosAgrupados).map(
    (subgrupo) => {
      let frecuenciaAcumulada = 0;
      return subgrupo
        .sort((a, b) => new Date(a.fecha_movimiento) - new Date(b.fecha_movimiento))
        .map((mov) => {
          if (tiposRestan.includes(mov.tipo_mov.id)) {
            frecuenciaAcumulada -= mov.cantidad;
          } else {
            frecuenciaAcumulada += mov.cantidad;
          }
          return { ...mov, frecuenciaAcumulada };
        });
    }
  );

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = subgruposConFrecuencia.flat().slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(subgruposConFrecuencia.flat().length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generar PDF
const generarPDF = () => {
  const doc = new jsPDF("landscape");
  doc.setFontSize(14);

  // Título dinámico basado en el filtro de producto
  const titulo = filtroProducto
    ? `Kardex del Producto: ${filtroProducto.value}`
    : "Movimientos de Ventas y Devoluciones";

  doc.text(titulo, 10, 10); // Agregar el título al PDF

  const headers = [
    "Producto",
    "Código",
    "Cantidad",
    "Tipo de movimiento",
    "Transacción",
    "Fecha",
    "Stand",
    "Frecuencia Acumulada",
  ];

  // Filtrar las filas con cantidad > 0 antes de mapear
  const data = subgruposConFrecuencia
    .flat()
    .filter((mov) => mov.cantidad > 0) // Filtrar movimientos con cantidad mayor a 0
    .map((mov) => [
      `${mov.producto.codigo} / ${mov.producto.nombre} / ${mov.producto.talla}`,
      mov.producto.codigo,
      mov.cantidad,
      mov.tipo_mov.nombre,
      mov.codigo_trans,
      mov.fecha_movimiento,
      mov.stand?.nombre || "-",
      mov.frecuenciaAcumulada,
    ]);

  // Generar tabla con autoTable
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 20, // Margen superior para evitar el título
    styles: { fontSize: 8 }, // Tamaño de fuente para datos
    headStyles: { fillColor: [41, 128, 185] }, // Color del encabezado
  });

  doc.save("movimientos.pdf");
};

  
  

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
        Kardex
      </h1>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Filtro de productos */}
      <div className="mb-4 flex justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filtrar por Producto
          </label>
          <Select
            value={filtroProducto}
            onChange={setFiltroProducto}
            options={opcionesProductos}
            isClearable
            placeholder="Selecciona un producto"
          />
        </div>
        <button
          onClick={generarPDF}
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Generar PDF
        </button>
      </div>

      {/* Tabla de movimientos */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
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
                {filtroProducto && (
                <th scope="col" className="px-6 py-3">Stock</th>
                )}
            </tr>
            </thead>
            <tbody>
              {currentItems
                .filter((mov) => mov.cantidad > 0)  // Filtrar filas con cantidad > 0
                .map((mov) => (
                  <tr
                    key={mov.id}
                    className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
                  >
                    <td className="px-6 py-4">
                      {mov.producto.codigo} / {mov.producto.nombre} / {mov.producto.talla}
                    </td>
                    <td className="px-6 py-4">{mov.producto.codigo}</td>
                    <td className="px-6 py-4">{mov.cantidad}</td>
                    <td className="px-6 py-4">{mov.tipo_mov.nombre}</td>
                    <td className="px-6 py-4">{mov.codigo_trans}</td>
                    <td className="px-6 py-4">{mov.fecha_movimiento}</td>
                    {filtroProducto && (
                      <td className="px-6 py-4">{mov.frecuenciaAcumulada}</td>
                    )}
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
    </div>
  );
}
