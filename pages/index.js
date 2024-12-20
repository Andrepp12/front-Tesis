import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
// import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2'; // Importa Pie en lugar de Line
import { Bar } from 'react-chartjs-2';
import ChatbotForm from './chatbot'; 
import YearMonthComboBox from './comboboxyear'; 
import Select from 'react-select';
import axiosInstance from '../utils/axiosConfig';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Asegúrate de importar esto
  LineElement, // Asegúrate de importar esto
  ArcElement, // Importa ArcElement para gráficos de pie
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement, // Registra ArcElement para gráficos de pie
  BarElement,
  PointElement, // Asegúrate de importar esto
  LineElement, // Asegúrate de importar esto
  Title,
  Tooltip,
  Legend
);

// Importaciones y configuraciones previas...

export default function Index() {
  const [productos2, setProductos2] = useState([]); // el productos '1' es para llenar comboboxyear

  const [selectedProduct2, setSelectedProduct2] = useState(null);
  const [selectedYear2, setSelectedYear2] = useState(null);
  const [selectedMonth2, setSelectedMonth2] = useState(null);

  const [barLabels2, setBarLabels2] = useState([]); // Meses para las etiquetas
  const [barData2, setBarDat2a] = useState([]); // Cantidades para los datos del gráfico


  // Configuración del gráfico de barras
  const barChartData2 = {
    labels: barLabels2, // Utiliza las etiquetas (meses)
    datasets: [
      {
        label: 'Cantidad de devoluciones',
        data: barData2, // Utiliza los datos de devoluciones
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color de fondo
        borderColor: 'rgba(75, 192, 192, 1)', // Color del borde
        borderWidth: 1,
      },
    ],
  };


    // Configuración para que el gráfico sea responsive y estéticamente agradable
    const optionsBar = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgba(255, 255, 255, 1)', // Cambiar a blanco
          },
        },
        title: {
          display: true,
          text: 'Devoluciones por Mes',
          color: 'rgba(255, 255, 255, 1)', // Cambiar a blanco
        },
      },
    };

  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [{
      label: 'Razones de Devolución',
      data: [],
      backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)'],
      borderWidth: 1,
    }]
  });

  
  const router = useRouter();
  const [barLabels, setBarLabels] = useState([]);
  const [barData, setBarData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadedData, setLoadedData] = useState(''); // Estado para los datos que enviarás a ChatbotForm
  const [productInfo, setProductInfo] = useState({}); // Nuevo estado para almacenar información del producto
  const [isInputEnabled, setIsInputEnabled] = useState(false); // Nuevo estado para controlar si el input está habilitado
  const [secondChartData, setSecondChartData] = useState([]); // Estado para el segundo gráfico
  
  const handleResponseReceived = (responseData) => {
    if (responseData === 0) {
      setSecondChartData([]); // Limpia el segundo gráfico si la respuesta es 0
    } else {
      setSecondChartData(responseData.suma);
    }
  };


const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 1)', // Cambiar a blanco
      },
    },
    title: {
      display: true,
      text: selectedYear ? `Gráfico de Ventas ${selectedYear}` : 'Seleccione un año',
      color: 'rgba(255, 255, 255, 1)', // Cambiar a blanco
    },
  },
};


  useEffect(() => {
    if (selectedProduct2 && selectedYear2) {
      razon_devolucion(selectedProduct2, selectedYear2); // Llama a la API de razones de devolución
      cantidades_devolucion(selectedProduct2, selectedYear2); 
    }


    const obtenerProductos = async () => {
      try {
        const response = await axiosInstance.get('gestion/productos/');
        const data = await response.data;
        
        // Mapea los productos, ahora incluyendo el ID
        setProductos2(
          data.map(producto => ({
            value: producto.id, // Ahora usamos el ID
            label: `${producto.nombre} (Talla: ${producto.talla}, Marca: ${producto.marca.nombre})`
          }))
        );
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      }
    };
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      router.push('/login');
    }
    obtenerProductos();
  }, [router,selectedProduct2, selectedYear2]);

  const handleYearChange = (year) => {
    setSelectedYear(year); // Actualiza el estado del año seleccionado
    if (selectedProduct) {
      loadData(selectedProduct, year); // Llama a loadData con el producto y el año seleccionados
    }
  };
  


  const handleProductChange = (productId, productName, productSize,year) => {
    setSelectedYear(year); // Actualiza el estado del año seleccionado
    if (productId==null) {
      setSecondChartData([]);
      // Si no hay producto seleccionado, deshabilita el input
      setIsInputEnabled(false);
      setSelectedProduct(null);
      setProductInfo({});
      // Limpia los datos del gráfico al cambiar el producto
      setBarLabels([]);  // Limpia las etiquetas del gráfico
      setBarData([]);    // Limpia los datos del gráfico
      return; // Sal de la función si no hay producto
    }

    setSelectedProduct(productId);
    setProductInfo({ id: productId, name: productName, size: productSize });
  
    // Limpia los datos del gráfico al cambiar el producto
    setBarLabels([]);  // Limpia las etiquetas del gráfico
    setBarData([]);    // Limpia los datos del gráfico
  
    // Si hay un año seleccionado, carga los datos
    if (selectedYear) {
      loadData(productId, selectedYear);
    }

    setIsInputEnabled(true);
    loadData2(productId);
  };
  

const loadData = async (productId, year) => {
  console.log('productId:', productId);  // Verificar el contenido de productId
  console.log('year:', year);            // Verificar el contenido de year
  console.log('Cargando datos con: xd', { productId, year }); // Verifica los parámetros
  try {
      const response = await fetch(`http://127.0.0.1:8000/api/gestion/suma-cantidades/?producto_id=${productId}&year=${year}`);
      if (!response.ok) {
          throw new Error(`Error en la respuesta de la API: ${response.status}`);
      }
      const data = await response.json();
      console.log('Datos recibidos:', data); // Agrega este log para depuración

      const quantities = data.suma;

      if (!quantities) {
          throw new Error('No se encontraron cantidades en la respuesta');
      }

      const months = Object.keys(quantities).map(month => {
          const monthNames = [
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ];
          return monthNames[parseInt(month) - 1];
      });

      const amounts = Object.values(quantities);

      setBarLabels(months);
      setBarData(amounts);

  } catch (error) {
      console.error('Error al obtener las cantidades:', error);
  }
};


const loadData2 = async (productId) => {
  console.log('Cargando datos con producto_id:', productId);
  try {
      const response = await fetch(`http://127.0.0.1:8000/api/gestion/suma-cantidades-all/?producto_id=${productId}`);
      if (!response.ok) {
          throw new Error(`Error en la respuesta de la API: ${response.status}`);
      }
      const data = await response.json();
      console.log('Datos recibidos:', data);

      const quantities = data.suma;

      if (!quantities) {
          throw new Error('No se encontraron cantidades en la respuesta');
      }

      // Formatear la respuesta para enviar al ChatbotForm
      const formattedData = Object.entries(quantities).map(([year, months]) => {
        const monthEntries = Object.entries(months).map(([month, amount]) => {
            const monthNames = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            return `${monthNames[parseInt(month) - 1]}: ${amount}`;
        }).join(', '); // Unir meses con comas

        return `Año ${year} = (${monthEntries})`; // Formato requerido
      }).join('. '); // Unir años con punto y espacio

      console.log('Datos formateados para ChatbotForm:', formattedData); // Para depuración
      setLoadedData(formattedData); // Establece los datos formateados

      
  } catch (error) {
      console.error('Error al obtener las cantidades:', error);
  }
};



  // Crear un arreglo de todos los meses
  const allMonths = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Ajustar datos para el primer gráfico
  const adjustedBarData = allMonths.map((month, index) => {
    const monthIndex = index + 1; // Meses son 1-indexed
    const amount = barData[barLabels.indexOf(month)] || 0; // Usar 0 si no hay datos
    return amount;
  });

  // Ajustar datos para el segundo gráfico
  const adjustedSecondChartData = allMonths.map((month, index) => {
    const monthIndex = index + 1; // Meses son 1-indexed
    const amount = secondChartData[monthIndex] || 0; // Usar 0 si no hay datos
    return amount;
  });

  // Preparar datos para el gráfico superpuesto
  const combinedData = {
    labels: allMonths, // Usar todos los meses como etiquetas
    datasets: [
      {
        label: selectedYear ? `Cantidad de ventas ${selectedYear}` : '',
        data: adjustedBarData, // Usar datos ajustados del primer gráfico
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: adjustedBarData.map(value => (value === 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)')), // Borde negro si el valor es cero
        borderWidth: 2,
        tension: 0,
      },
      ...(Object.keys(secondChartData).length > 0
        ? [{
            label: 'Predicción de ventas',
            data: adjustedSecondChartData, // Usar datos ajustados del segundo gráfico
            fill: false,
            backgroundColor: 'rgba(192, 75, 192, 0.3)',
            borderColor: adjustedSecondChartData.map(value => (value === 0 ? 'black' : 'rgba(192, 75, 192, 1)')), // Borde negro si el valor es cero
            borderWidth: 4,
            tension: 0,
          }]
        : [])
    ]
  };





  const cantidades_devolucion = async (productId, year) => {
    console.log('productId:', productId);
    console.log('year:', year);

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/api/gestion/cantidad-devolucion/?producto_id=${productId}&year=${year}`
        );

        if (!response.ok) {
            throw new Error(`Error al obtener las devoluciones: ${response.status}`);
        }

        const data = await response.json();
        const quantities = data.total_devoluciones_por_mes; // Datos de devoluciones por mes

        // Extrae las claves (meses) y los valores (cantidades)
        const months = Object.keys(quantities);
        const amounts = Object.values(quantities);

        // Actualiza el estado con las etiquetas y datos para el gráfico de barras
        setBarLabels2(months);  // Actualiza las etiquetas con los meses
        setBarDat2a(amounts);   // Actualiza los datos con las cantidades
    } catch (error) {
        console.error('Error al obtener las devoluciones:', error);
    }
};


  const razon_devolucion = async (productId, year) => {
    console.log('productId:', productId);  // Verificar el contenido de productId
    console.log('year:', year);            // Verificar el contenido de year
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/gestion/suma-razon-devolucion/?producto_id=${productId}&year=${year}`
      );
  
      if (!response.ok) {
        throw new Error(`Error al obtener las razones de devolución: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Razones de devolución:', data);
  
      // Obtener las razones y cantidades para actualizar el gráfico
      const reasons = Object.keys(data.suma);  // ["xd", "OTRA"]
      const amounts = Object.values(data.suma);  // [2, 1]
  
      // Actualizar el estado para el gráfico de pie
      setPieData({
        labels: reasons,  // Razones de devolución como etiquetas
        datasets: [
          {
            label: 'Razones de Devolución',
            data: amounts,  // Cantidades de devoluciones como datos
            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error al obtener razones de devolución:', error);
    }
  };
  
    
    const handleYearChange2 = async (newSelection) => {
      if(newSelection != null){
        setSelectedYear2(newSelection.value); 
      }
    };
    const handleProductChange2 = async (newSelection) => {
      if(newSelection != null){
        setSelectedProduct2(newSelection.value);
      }
    };
    const handleMonthChange2 = async (newSelection) => {
      if(newSelection != null){
        setSelectedMonth2(newSelection);
      }
    };
    
        
    const optionsPie = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgba(255, 255, 255, 1)', // Cambiar el color de la leyenda a blanco
          },
        },
        title: {
          display: true,
          text: 'Razones de Devolución',  // Título del gráfico
          color: 'rgba(255, 255, 255, 1)',  // Cambiar el color del título a blanco
        },
      },
    };
    

return (
  <div className="min-h-screen dark:bg-gray-500 p-6 flex">
    <div style={{ width:'800px' }}>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Dashboard Predicción</h1>
      
      <YearMonthComboBox 
        onProductChange={handleProductChange} 
        onYearChange={handleYearChange}
      />



      <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg" style={{ marginTop:'10px' }}>
        <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Ventas de Stands</h2>
        <Line 
            data={combinedData} // Usar datos combinados
            options={options}
          />
      </div>

      {/* Línea divisoria */}
      <hr className="my-6 border-t-2 border-gray-300 dark:border-gray-600" />
      
      <div className="mt-4 flex gap-4">

          {/* Select de año */}
          <div>
            <label htmlFor="yearSelect" className="text-lg text-gray-900 dark:text-white block mb-2">Selecciona un año</label>
            <Select
              id="yearSelect"
              styles={{
                control: (base) => ({
                  ...base,
                  width: '190px', // Ancho del select
                  backgroundColor: '#e0f7fa', // Fondo azul claro
                  borderRadius: '8px',
                  borderColor: '#80deea', // Borde azul
                  '&:hover': { borderColor: '#4fc3f7' }, // Borde azul más oscuro al hacer hover
                  boxShadow: 'none', // Elimina sombra predeterminada
                }),
                menu: (base) => ({
                  ...base,
                  maxWidth: '420px', // Ancho del menú
                  backgroundColor: '#ffffff', // Fondo blanco para las opciones
                }),
                option: (base) => ({
                  ...base,
                  color: '#00796b', // Color de texto de las opciones
                  '&:hover': {
                    backgroundColor: '#b2ebf2', // Fondo azul claro en hover
                    color: '#004d40', // Color oscuro en hover
                  },
                }),
              }}
              placeholder="Selecciona un año"
              options={[
                { value: 2022, label: '2022' },
                { value: 2023, label: '2023' },
                { value: 2024, label: '2024' },
              ]}
              isClearable
              onChange={handleYearChange2}
            />
          </div>
          
          {/* Select de productos */}
          <div>
            <label htmlFor="productSelect" className="text-lg text-gray-900 dark:text-white block mb-2">Selecciona un producto</label>
            <Select
              id="productSelect"
              styles={{
                control: (base) => ({
                  ...base,
                  width: '350px', // Ancho del select
                  backgroundColor: '#e3f2fd', // Fondo azul claro
                  borderRadius: '8px',
                  borderColor: '#81d4fa', // Borde azul
                  '&:hover': { borderColor: '#4fc3f7' }, // Borde azul más oscuro al hacer hover
                  boxShadow: 'none', // Elimina sombra predeterminada
                }),
                menu: (base) => ({
                  ...base,
                  maxWidth: '420px', // Ancho del menú
                  backgroundColor: '#ffffff', // Fondo blanco para las opciones
                }),
                option: (base) => ({
                  ...base,
                  color: '#00796b', // Color de texto de las opciones
                  '&:hover': {
                    backgroundColor: '#b2ebf2', // Fondo azul claro en hover
                    color: '#004d40', // Color oscuro en hover
                  },
                }),
              }}
              placeholder="Selecciona un producto"
              options={productos2} // Llenamos con los productos obtenidos de la API
              isClearable
              value={selectedProduct2 ? { value: selectedProduct2, label: productos2.find(product => product.value === selectedProduct2)?.label } : null} // Asegúrate de que `selectedProduct2` esté correctamente mapeado
              onChange={handleProductChange2}
            />
          </div>

</div>

    <div className="min-h-screen dark:bg-gray-500 p-6 flex justify-center gap-8">
    {/* Contenedor para el primer gráfico */}
        <div className="w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg"  style={{ height:'500px' }}>
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Razones de Devoluciones</h2>
          <div className="flex justify-center">
            <Pie data={pieData} options={optionsPie} height={300} width={300} />
          </div>
        </div>


        <div className="w-1/2 bg-gray-800 p-4 rounded-lg shadow-lg"  style={{ height:'500px' }}>
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Devoluciones por Mes</h2>
          <div className="flex justify-center">
            <Bar data={barChartData2} options={optionsBar} height={300} width={300} />
          </div>
        </div>

  </div>
    </div>
      <div className="mt-8 ml-8" style={{ width: '421px' }}>
        <ChatbotForm 
          textData={loadedData} 
          productId={productInfo.id}
          productName={productInfo.name}
          productSize={productInfo.size}
          enableInput={isInputEnabled}
          onResponseReceived={handleResponseReceived}
        />
      </div>
  </div>
  
);

}
