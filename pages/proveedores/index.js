export default function Proveedores() {
    // Lista de proveedores (puedes obtener esto de una API o base de datos)
    const proveedores = [
      {
        id: 1,
        nombre: 'Proveedor A',
        descripcion: 'Proveedor especializado en la marca Nike.',
        contacto: 'contacto@proveedora.com',
        imagen: 'https://via.placeholder.com/150', // Imagen de prueba
      },
      {
        id: 2,
        nombre: 'Proveedor B',
        descripcion: 'Proveedor de en la marca Adidas.',
        contacto: 'contacto@proveedorb.com',
        imagen: 'https://via.placeholder.com/150',
      },
      {
        id: 3,
        nombre: 'Proveedor C',
        descripcion: 'Proveedor especializado en la marca Reebook.',
        contacto: 'contacto@proveedorc.com',
        imagen: 'https://via.placeholder.com/150',
      },
      // Puedes agregar más proveedores aquí
    ];
  
    return (
      <div className="min-h-screen dark:bg-gray-600 p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Proveedores</h1>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            

<div class="max-w-l bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <img class="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
    </a>
    <div class="p-5">
        <a href="#">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Proveedor A</h5>
        </a>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Proveedor especializado en la marca Nike</p>
        <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Read more
             <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
        </a>
    </div>
</div>


<div class="max-w-l bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <img class="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
    </a>
    <div class="p-5">
        <a href="#">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Proveedor B</h5>
        </a>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Proveedor de en la marca Adidas.</p>
        <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Read more
             <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
        </a>
    </div>
</div>


<div class="max-w-l bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
    <a href="#">
        <img class="rounded-t-lg" src="/docs/images/blog/image-1.jpg" alt="" />
    </a>
    <div class="p-5">
        <a href="#">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Proveedor C</h5>
        </a>
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Proveedor especializado en la marca Reebook.</p>
        <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Read more
             <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
        </a>
    </div>
</div>
        </div>
      </div>
    );
  }
  