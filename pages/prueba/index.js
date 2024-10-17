import Image from 'next/image'

export default function ListaProductos({ productos }) {
    return (
        <div>
            <h1>Lista de Productos</h1>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Imagen</th>
                        <th>Precio</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(producto => (
                        <tr key={producto.id}>
                            <td>{producto.id}</td>
                            <td>{producto.nombre}</td>
                            <td>
                                <Image
                                    src={`http://localhost:8000${producto.imagen}`} // Asegúrate de usar la URL correcta de la imagen
                                    alt={producto.nombre}
                                    width={100}
                                    height={100}
                                />
                            </td>
                            <td>{producto.precio}</td>
                            <td>{producto.stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// getServerSideProps para fetchear los productos desde Django
export async function getServerSideProps() {
    const res = await fetch('http://localhost:8000/api/productos/') // Cambia esta URL por tu endpoint de Django
    const productos = await res.json()

    return {
        props: {
            productos,
        },
    }
}