import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const ITEMS_PER_PAGE = 10;

export default function Existencias() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [talla, setTalla] = useState('');
  const [precio, setPrecio] = useState('');
  const [stockAlmacen, setStockAlmacen] = useState('0');
  const [genero, setGenero] = useState('');
  const [color, setColor] = useState('');
  // const [stockTotal, setStockTotal] = useState(0); // Define stockTotal
  const [ubicacion, setUbicacion] = useState('almacén');
  const [marca, setMarca] = useState('');
  const [imagen, setImagen] = useState(null); // Estado para la imagen
  const [success, setSuccess] = useState('');
  const [marcas, setMarcas] = useState([]);
  // const [estado, setEstado] = useState(1); // Define estado aquí
  const [productoId, setProductoId] = useState(null); // Nuevo estado para identificar si es modo edición
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCodigo, setSearchCodigo] = useState('');
  const [filterTalla, setFilterTalla] = useState('');
  const [sortField, setSortField] = useState(''); // 'precio' o 'stock'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' o 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [sizesList, setSizesList] = useState([]);

  // Function to add a size to the list
  const addSize = () => {
    if (talla && !sizesList.includes(talla)) {
      setSizesList([...sizesList, 1]);
      setTalla(''); // Clear the size input field
    } else {
      setError('Talla ya existe en el listado o está vacío.');
    }
  };

  // Function to remove a size from the list
  const removeSize = (size) => {
    setSizesList(sizesList.filter((item) => item !== size));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let response;
  
      if (productoId) {
        // Modo de edición: actualizar el producto con una sola talla
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('codigo', codigo);
        formData.append('descripcion', descripcion);
        formData.append('talla', talla); // Solo una talla en modo edición
        formData.append('precio', precio);
        formData.append('genero', genero);
        formData.append('color', color);
        formData.append('stock_almacen', stockAlmacen);
        formData.append('stock_total', stockAlmacen);
        formData.append('ubicacion', ubicacion);
        formData.append('marca_id', marca);
        if (imagen) {
          formData.append('imagen', imagen);
        }
        formData.append('estado', 1);
  
        response = await axiosInstance.patch(`gestion/productos/${productoId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProductos(productos.map((producto) => (producto.id === productoId ? response.data : producto)));
      } else {
        // Modo de creación: crear un producto para cada talla en `sizesList`
        for (const size of sizesList) {
          const formData = new FormData();
          formData.append('nombre', nombre);
          formData.append('codigo', codigo);
          formData.append('descripcion', descripcion);
          formData.append('talla', size); // Usar cada talla de la lista
          formData.append('precio', precio);
          formData.append('genero', genero);
          formData.append('color', color);
          formData.append('stock_almacen', stockAlmacen);
          formData.append('stock_total', stockAlmacen);
          formData.append('ubicacion', ubicacion);
          formData.append('marca_id', marca);
          if (imagen) {
            formData.append('imagen', imagen);
          }
          formData.append('estado', 1);
  
          response = await axiosInstance.post('gestion/productos/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setProductos((prevProductos) => [...prevProductos, response.data]);
        }
      }
  
      setSuccess(productoId ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente para cada talla');
      setError('');
    } catch (error) {
      setError('Error al procesar el producto. Intenta de nuevo.');
      setSuccess('');
    }
  
    // Resetear formulario y cerrar modal
    setShowModal(false);
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setPrecio('');
    setGenero('');
    setColor('');
    setUbicacion('almacén');
    setMarca('');
    setImagen(null);
    setSizesList([]); // Limpiar la lista de tallas después del envío
  };


  // Función para abrir modal en modo edición
  const openEditModal = (producto) => {
    setProductoId(producto.id); // Establecer el ID del producto para editar
    setNombre(producto.nombre);
    setCodigo(producto.codigo);
    setDescripcion(producto.descripcion);
    setTalla(producto.talla);
    setPrecio(producto.precio);
    setGenero(producto.genero);
    setColor(producto.color);
    // setStockAlmacen(producto.stock_almacen);
    // setUbicacion(producto.ubicacion);
    setMarca(producto.marca.id); // Asegúrate de pasar el ID de la marca
    setShowModal(true); // Mostrar el modal
  };

  // Abrir modal para agregar nuevo producto
  const openCreateModal = () => {
    setProductoId(null); // Cambiar a modo creación (nuevo producto)
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setTalla('');
    setPrecio('');
    setGenero('');
    setColor('');
    setUbicacion('almacén');
    setMarca('');
    setImagen(null);
    setShowModal(true); // Mostrar el modal
  };

  // Manejar el envío del formulario (creación o edición)


  // Manejar la eliminación del producto
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
        setFilteredProductos(response.data);
      } catch (error) {
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

  const handleFilter = () => {
    let productosFiltrados = productos;

    if (searchNombre) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        producto.nombre.toLowerCase().includes(searchNombre.toLowerCase())
      );
    }

    if (searchCodigo) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        producto.codigo.toLowerCase().includes(searchCodigo.toLowerCase())
      );
    }

    if (filterTalla) {
      productosFiltrados = productosFiltrados.filter((producto) =>
        producto.talla === parseInt(filterTalla)
      );
    }

    if (sortField) {
      productosFiltrados = productosFiltrados.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];
        if (sortOrder === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }

    setFilteredProductos(productosFiltrados);
    setCurrentPage(1); // Resetea a la primera página tras filtrar
  };

  // Cada vez que cambien los filtros o el orden, se actualiza la tabla
  useEffect(() => {
    handleFilter();
  }, [searchNombre, searchCodigo, filterTalla, sortField, sortOrder]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductos.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Existencias</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        type="button"
        onClick={openCreateModal} // Mostrar el modal al hacer clic
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        + Agregar
      </button>

      {/* Modal para agregar productos */}
      {showModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">{productoId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
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
                <div className="flex space-x-4">
                <label className="block text-sm font-medium text-gray-700 py-3">Precio</label>
                
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  className="block w-1/2 mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              
                <label className="block text-sm font-medium text-gray-700 py-3">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  className="mt-1 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                </div>
              </div>
              <div className="mb-4">
              <div className="flex space-x-4">
                <label className="block text-sm font-medium text-gray-700 py-3">Género</label>
                <select value={genero} onChange={(e) => setGenero(e.target.value)} 
                className="mt-1 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="unisex">Unisex</option>
                    <option value="niño">Niño</option>
                    <option value="niña">Niña</option>
                </select>
              
                <label className="block text-sm font-medium text-gray-700 py-3">Marca</label>
                <select
                  value={marca} // Aquí se asegura que se seleccione el valor de marca actual
                  onChange={(e) => setMarca(e.target.value)} // Actualiza el valor de marca seleccionado
                  required
                  className="mt-1 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar Marca</option>
                  {marcas.map((marcaItem) => (
                    <option key={marcaItem.id} value={marcaItem.id}>
                      {marcaItem.nombre}
                    </option>
                  ))}
                </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
                <input
                  type="file"
                  onChange={(e) => setImagen(e.target.files[0])}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mb-4">
              <div className="flex space-x-4">
                <label className="block text-sm font-medium text-gray-700 py-3">Talla</label>
                <input
                  type="number"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                  className="mt-1 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button type="button" onClick={addSize} className="mt-2 block w-1/2 px-4 py-2 bg-blue-500 text-white rounded">Agregar Talla</button>
                </div>
              </div>

              {/* Display Sizes List */}
              {sizesList.length > 0 && (
                <table className="w-full mt-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Talla</th>
                      <th className="px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizesList.map((size, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{size}</td>
                        <td className="border px-4 py-2">
                          <button onClick={() => removeSize(size)} className="text-red-500">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Submit and Cancel buttons */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                >
                  {productoId ? 'Guardar Cambios' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      

      {/* Tabla de productos */}
      <div className="min-h-screen dark:bg-gray-500 p-6">
      {/* <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Productos</h1> */}

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por Nombre"
          value={searchNombre}
          onChange={(e) => setSearchNombre(e.target.value)}
          className="block w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <input
          type="text"
          placeholder="Buscar por Código"
          value={searchCodigo}
          onChange={(e) => setSearchCodigo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <select
          value={filterTalla}
          onChange={(e) => setFilterTalla(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Filtrar por Talla</option>
          {[...Array(21)].map((_, index) => {
            const talla = (35 + index * 0.5).toFixed(1);
            return (
              <option key={talla} value={talla}>
                {talla}
              </option>
            );
          })}
        </select>


        <select
          onChange={(e) => setSortField(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Ordenar Por</option>
          <option value="precio">Precio</option>
          <option value="stock_almacen">Stock</option>
        </select>

        <select
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>

      {/* Tabla de productos */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-16 py-3">Imagen</th>
              <th scope="col" className="px-6 py-3">Código</th>
              <th scope="col" className="px-6 py-3">Producto</th>
              <th scope="col" className="px-6 py-3">Marca</th>
              <th scope="col" className="px-6 py-3">Talla</th>
              <th scope="col" className="px-6 py-3">Color</th>
              {/* <th scope="col" className="px-6 py-3">Stock Almacén</th> */}
              <th scope="col" className="px-6 py-3">Stock Total</th>
              <th scope="col" className="px-6 py-3">Precio</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((producto) => (
              <tr
                key={producto.id}
                className="dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-500"
              >
                <td className="p-4">
                  <img
                    src={producto.imagen} 
                    className="w-16 md:w-32 max-w-full max-h-full"
                    alt={producto.imagen}
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.codigo}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.nombre}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.marca?.nombre || 'Sin marca'}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.talla}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.color}</td>
                {/* <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.stock_almacen}</td> */}
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{producto.stock_total}</td>
                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${producto.precio}</td>
                <td className="px-6 py-4">
                  <button onClick={() => openEditModal(producto)} className="text-blue-500 hover:underline">Editar</button>
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
        {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          Anterior
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-2 mx-1 ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          Siguiente
        </button>
      </div>
      </div>
    </div>
    </div>
  );
}
