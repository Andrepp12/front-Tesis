import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Eliminar los tokens de las cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');

    // Redirigir al usuario a la página de inicio de sesión
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
