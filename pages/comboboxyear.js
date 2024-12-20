import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axiosInstance from '../utils/axiosConfig';

const YearMonthComboBox = ({ onProductChange , onYearChange }) => {
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [años, setAños] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await axiosInstance.get('gestion/productos/');
        const data = await response.data;
        
        // Mapea los productos, ahora incluyendo el ID
        setProductos(
          data.map(producto => ({
            value: producto.id, // Ahora usamos el ID
            label: `${producto.nombre} (Talla: ${producto.talla}, Marca: ${producto.marca.nombre})`
          }))
        );
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  const handleProductChange = async (selectedOption) => {
    if (!selectedOption) {
      setSelectedProduct(null);
      setAños([]);
      setSelectedYear(null);
      onProductChange(null, null, null); // Notifica que no hay producto seleccionado
      return;
    }
    setSelectedProduct(selectedOption);
    const productName = selectedOption.label.split(' (')[0];
    const productId = selectedOption.value;
    const sizeMatch = selectedOption.label.match(/Talla: (\d+)/);
    const productSize = sizeMatch ? sizeMatch[1] : null;
  
    // Notifica el cambio de producto y establece el gráfico vacío
    onProductChange(productId, productName, productSize); // Notifica al componente padre el nuevo producto
  
    // Obtiene los años para el producto seleccionado
    await obtenerAnosPorProducto(productId);
    // Limpia los años seleccionados
    setSelectedYear(null);
  };
  

  const obtenerAnosPorProducto = async (productoId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/gestion/anios/producto/${productoId}/`);
      const data = await response.json();
      // Establece los años en el estado
      setAños(data.años.map(año => ({ value: año, label: año })));
    } catch (error) {
      console.error('Error al obtener los años:', error);
    }
  };
  

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption);
    
    if (selectedOption) {
      onYearChange(selectedOption.value); // Llama a onYearChange con el año seleccionado
    } else {
      onYearChange(null); // Llama a onYearChange con null si no hay opción seleccionada
    }
  };
  

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {/* Select con estilos en línea para Productos */}
      <Select
        styles={{
          control: (base) => ({
            ...base,
            width: '380px', // Cambiado a 420px
            backgroundColor: '#f7f7f7',
            borderRadius: '8px',
            borderColor: '#ccc',
            '&:hover': { borderColor: '#888' },
          }),
          menu: (base) => ({
            ...base,
            maxWidth: '420px', // Cambiado a 420px
          }),
        }}
        placeholder="Producto"
        options={productos}
        onChange={handleProductChange}
        value={selectedProduct}
        isClearable
      />

      {/* Select con estilos en línea para Años */}
      {selectedProduct && (
        <Select
          styles={{
            control: (base) => ({
              ...base,
              width: '380px', // Cambiado a 420px
              backgroundColor: '#f7f7f7',
              borderRadius: '8px',
              borderColor: '#ccc',
              '&:hover': { borderColor: '#888' },
            }),
            menu: (base) => ({
              ...base,
              maxWidth: '420px', // Cambiado a 420px
            }),
          }}
          placeholder="Año"
          options={años}
          onChange={handleYearChange}
          value={selectedYear}
          isClearable
        />
      )}
    </div>
  );
};
export default YearMonthComboBox;
