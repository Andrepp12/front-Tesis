import '../src/app/globals.css';
import Layout from '../components/Layout'; // Importa el componente Layout
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';


function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const accessToken = Cookies.get('access_token');

    // Redirigir al login si no hay token y la ruta no es login
    if (!accessToken && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router]);

  // // Eliminar token al cerrar la página
  // // Eliminar token solo cuando se cierra la pestaña
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     // Verificar si la pestaña se está cerrando
  //     if (document.visibilityState === 'hidden') {
  //       // Eliminar tokens de las cookies
  //       Cookies.remove('access_token');
  //       Cookies.remove('refresh_token');
  //     }
  //   };

  //   // Registrar el evento visibilitychange
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   // Limpiar el evento al desmontar el componente
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);

  return (
    <div className="flex min-h-screen">


      {/* Main content */}
      <main className="flex-1">
      <Layout>
      <Component {...pageProps} />
      </Layout>
      </main>
    </div>
  );
}

export default MyApp;


