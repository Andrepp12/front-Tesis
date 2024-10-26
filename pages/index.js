import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Bar } from 'react-chartjs-2';
import ChatbotForm from './chatbot'; 
import YearMonthComboBox from './comboboxyear'; 
import axiosInstance from '../utils/axiosConfig';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedYear ? `Gráfico de Solicitudes ${selectedYear}` : 'Seleccione un año',
      },
    },
  };

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      router.push('/login');
    }
  }, [router]);

  const handleMonthsChange = (months, year) => {
    setSelectedYear(year);
    setBarLabels(months); 
  };

  const handleProductChange = (productId, productName, productSize) => {
    setSelectedProduct(productId);
    setProductInfo({ id: productId, name: productName, size: productSize }); // Almacena la info del producto
    if (selectedYear) {
        loadData(productId, selectedYear);
        loadData2(productId);
    }
};

const loadData = async (productId, year) => {
  console.log('Cargando datos con:', { productId, year }); // Verifica los parámetros
  try {
      const response = await axiosInstance.get('/gestion/suma-cantidades/', {
        params: {
          producto_id: productId,
          year: year,
        },
      });
      // const response = await fetch(`http://127.0.0.1:8000/api/gestion/suma-cantidades/?producto_id=${productId}&year=${year}`);
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
      console.log('Meses y cantidades:', months, amounts); // Agrega este log para depuración

      setBarLabels(months);
      setBarData(amounts);

      // const formattedData = months.map((month, index) => `${month}: ${amounts[index]}`).join('\n');
      // setLoadedData(formattedData);
      

  } catch (error) {
      console.error('Error al obtener las cantidades:', error);
  }
};


const loadData2 = async (productId) => {
  console.log('Cargando datos con producto_id:', productId);
  try {
      const response = await axiosInstance.get('gestion/suma-cantidades-all/', {
        params: {
          producto_id: productId
        },
      });
      // const response = await fetch(`http://127.0.0.1:8000/api/gestion/suma-cantidades-all/?producto_id=${productId}`);
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

  return (
    <div className="min-h-screen dark:bg-gray-500 p-6 flex">
      <div style={{ width:'800px' }}>
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">Dashboard</h1>
          <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Solicitudes de Stands</h2>
            <Bar 
              data={{
                labels: barLabels,
                datasets: [{
                  label: selectedYear ? `Cantidad de solicitudes ${selectedYear}` : '',
                  data: barData,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                }],
              }} 
              options={options}
            />
          </div>

          <div>
            <YearMonthComboBox onMonthsChange={handleMonthsChange} onProductChange={handleProductChange} />
          </div>
      </div>
      
      <div className="mt-8 ml-8" style={{ width: '421px' }}>
      <ChatbotForm 
          textData={loadedData} 
          productId={productInfo.id}
          productName={productInfo.name}
          productSize={productInfo.size}
        /> 

      </div>
    </div>
  );
}
