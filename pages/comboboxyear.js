import React, { useEffect, useState } from 'react';

const YearMonthComboBox = ({ onMonthsChange, onProductChange }) => { // Asegúrate de recibir la función como prop
  const [años, setAños] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    const obtenerAños = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/gestion/anos/');
        const data = await response.json();
        setAños(data);
      } catch (error) {
        console.error('Error al obtener los años:', error);
      }
    };

    obtenerAños();
  }, []);

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    setProductos([]);
    setSelectedProduct('');
    obtenerProductosPorAño(year);
    onMonthsChange([], year); // Reiniciar meses al cambiar el año
  };

  const obtenerProductosPorAño = async (year) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/gestion/productos/ano/${year}/`);
      const data = await response.json();
      setProductos(data.productos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const selected = productos.find(product => product['producto__id'] === Number(productId));
    setSelectedProduct(productId);
    
    // Verificar si se encontró el producto
    if (selected) {
        onProductChange(productId, selected['producto__nombre'], selected['producto__talla']); // Llama a la función
    } else {
        console.error('Producto no encontrado:', productId);
        onProductChange(productId, null, null); // O manejar el caso en que no se encuentra el producto
    }
};

  return (
    <div>
      <select  className="text-black bg-white-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" onChange={handleYearChange} value={selectedYear}>
        <option value="">Selecciona un año</option>
        {años.length > 0 ? (
          años.map((año, index) => (
            <option key={index} value={año}>
              {año}
            </option>
          ))
        ) : (
          <option disabled>Cargando años...</option>
        )}
      </select>

      {selectedYear && (
        <select  className="text-black bg-white-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" onChange={handleProductChange} value={selectedProduct}>
          <option value="">Selecciona un producto</option>
          {productos.length > 0 ? (
            productos.map((producto, index) => (
              <option key={index} value={producto['producto__id']}>
                {producto['producto__nombre']} (ID: {producto['producto__id']}, Talla: {producto['producto__talla']})
              </option>
            ))
          ) : (
            <option disabled>Cargando productos...</option>
          )}
        </select>
      )}
    </div>
  );
};

export default YearMonthComboBox;
