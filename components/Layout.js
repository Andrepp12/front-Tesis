import { useRouter } from 'next/router';
import Sidebar from './Sidebar'; // Asegúrate de que tienes un componente Sidebar

export default function Layout({ children }) {
  const router = useRouter();

  // Ocultar el sidebar solo en la página de login
  const showSidebar = router.pathname !== '/login';

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />} {/* Sidebar en la izquierda */}
      <main className="flex-1 ">{children}</main> {/* Contenido principal */}
    </div>
  );
}

