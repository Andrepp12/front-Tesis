import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Bar } from 'react-chartjs-2';
import ChatbotForm from './chatbot'; 
import YearMonthComboBox from './comboboxyear'; 

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

  const handleProductChange = (selectedProductId) => {
    setSelectedProduct(selectedProductId);
    // Asegúrate de que year ya está establecido antes de llamar a loadData
    if (selectedYear) {
        loadData(selectedProductId, selectedYear);
    }
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
      console.log('Meses y cantidades:', months, amounts); // Agrega este log para depuración

      setBarLabels(months);
      setBarData(amounts);
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
        <ChatbotForm />
      </div>
    </div>
  );
}
