import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
// import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import ChatbotForm from './chatbot'; 
import YearMonthComboBox from './comboboxyear'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Asegúrate de importar esto
  LineElement, // Asegúrate de importar esto
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement, // Asegúrate de importar esto
  LineElement, // Asegúrate de importar esto
  Title,
  Tooltip,
  Legend
);

// Importaciones y configuraciones previas...

export default function Index() {
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
      text: selectedYear ? `Gráfico de Solicitudes ${selectedYear}` : 'Seleccione un año',
      color: 'rgba(255, 255, 255, 1)', // Cambiar a blanco
    },
  },
};


  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      router.push('/login');
    }
  }, [router]);

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
  console.log('Cargando datos con:', { productId, year }); // Verifica los parámetros
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
        label: selectedYear ? `Cantidad de solicitudes ${selectedYear}` : '',
        data: adjustedBarData, // Usar datos ajustados del primer gráfico
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: adjustedBarData.map(value => (value === 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)')), // Borde negro si el valor es cero
        borderWidth: 2,
        tension: 0,
      },
      ...(Object.keys(secondChartData).length > 0
        ? [{
            label: 'Predicción de solicitudes',
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

return (
  <div className="min-h-screen dark:bg-gray-500 p-6 flex">
    <div style={{ width:'800px' }}>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Solicitudes de Stands</h2>
        
        <Line 
            data={combinedData} // Usar datos combinados
            options={options}
          />
      </div>


      <YearMonthComboBox 
        onProductChange={handleProductChange} 
        onYearChange={handleYearChange}
      />


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
