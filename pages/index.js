import React, { useState } from "react";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Bar, Line, Pie, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

// Registrar los elementos necesarios para los gráficos
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

export default function Index() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Datos de prueba para el gráfico
  // Datos de ejemplo para los gráficos
  const barData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Ventas 2024',
        data: [50, 100, 75, 125, 150],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        label: 'Usuarios Activos',
        data: [30, 50, 80, 40, 70],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const pieData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'Distribución',
        data: [300, 50, 100],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const polarData = {
    labels: ['Rojo', 'Azul', 'Amarillo', 'Verde'],
    datasets: [
      {
        label: 'Puntuación',
        data: [11, 16, 7, 14],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gráfico de Datos',
      },
    },
  };
  useEffect(() => {
    // Verificar si el token de acceso existe
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      // Si no hay token, redirigir al login
      router.push('/login');
    }
  }, [router]);
  return (
    
        <><div className="min-h-screen dark:bg-gray-600 p-6">
      <div className="min-h-screen dark:bg-gray-600 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white" >Gráficos de Prueba</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Ventas (Barras)</h2>
          <Bar data={barData} options={options} />
        </div>

        <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Usuarios Activos (Líneas)</h2>
          <Line data={lineData} options={options} />
        </div>

        <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Distribución (Pastel)</h2>
          <Pie data={pieData} options={options} />
        </div>

        <div className="dark:bg-gray-800 p-4 shadow-lg rounded-lg ">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">Puntuación (Área Polar)</h2>
          <PolarArea data={polarData} options={options} />
        </div>
      </div>
    </div>
      </div></>

  );
}