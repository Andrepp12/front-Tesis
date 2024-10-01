export default function Existencias() {

    return (
    <div className="min-h-screen dark:bg-gray-600 p-6">
    <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Lista de Existencias</h1>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-16 py-3">
                        <span class="sr-only">Imagen</span>
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Producto
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Cantidad
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Precio
                    </th>
                    <th scope="col" class="px-6 py-3">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="dark:bg-gray-800 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="p-4">
                        <img src="../images/samba-og-reggae-core-white.jpg" class="w-16 md:w-32 max-w-full max-h-full" alt="Samba OG REGGAE CORE WHITE" />
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        Samba OG REGGAE CORE WHITE
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        5
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        $599
                    </td>
                    <td class="px-6 py-4">
                        <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline p-3" >Editar</a>
                        <a href="#" class="font-medium text-red-600 dark:text-red-500 hover:underline p-3">Eliminar</a>
                    </td>
                </tr>
                <tr class="dark:bg-gray-800 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="p-4">
                        <img src="../images/nikeAirForce.jpg" class="w-16 md:w-32 max-w-full max-h-full" alt="Apple iMac" />
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        Nike Air Force 1 '07
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        7
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        $2499
                    </td>
                    <td class="px-6 py-4">
                        <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline p-3">Editar</a>
                        <a href="#" class="font-medium text-red-600 dark:text-red-500 hover:underline p-3">Eliminar</a>
                    </td>
                </tr>
                <tr class="dark:bg-gray-800 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="p-4">
                        <img src="../images/EnergenTech2.jpg" class="w-16 md:w-32 max-w-full max-h-full" alt="Energen Tech 2" />
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Energen Tech 2 
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        2
                    </td>
                    <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        $999
                    </td>
                    <td class="px-6 py-4"> 
                        <a href="#" class="font-medium text-blue-600 dark:text-blue-500 hover:underline p-3">Editar</a>
                        <a href="#" class="font-medium text-red-600 dark:text-red-500 hover:underline p-3">Eliminar</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    </div>
    );
}