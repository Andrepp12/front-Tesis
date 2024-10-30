import React, { useState,useEffect  } from 'react'; 

const ChatbotForm = ({ textData, productId, productName, productSize, enableInput, onResponseReceived  }) => {
    const [inputValue, setInputValue] = useState('');
    const [response, setResponse] = useState(''); // Cambiado a cadena vacía
    const [error, setError] = useState(null);
    const [response2, setResponse2] = useState(''); // Cambiado a cadena vacía

    
    // Efecto para limpiar el input cuando enableInput es false
    useEffect(() => {
        if (!enableInput) {
            setInputValue(''); // Limpia el input si está deshabilitado
            setResponse('');
        }
    }, [enableInput]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Verifica que el campo no esté vacío
        if (!inputValue.trim()) {
            setError('El contenido no puede estar vacío.');
            return;
        }

        setError(null); // Restablece el error si es válido
        try {
            const formattedText = `
                ID del Producto: ${productId || 'No disponible'}
                Nombre del Producto: ${productName || 'No disponible'}
                Talla del Producto: ${productSize || 'No disponible'}
                Cantidad de demanda del producto: ${textData || 'No disponibles'}
            `;


            const res = await fetch('http://127.0.0.1:8000/api/chat/message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: 'Estoas son cantidades de unidades demandas de un producto de calzado por los stands en distinas fechas: ' + formattedText + '. Cuando respondas la pregunta no te olvides de mencionar el nombre del producto y su talla en la respuesta. Si la pregunta te pida hacer una predicción, describe el resumen y explicación de tendencias y al final escribe una sección con el título ***PREDICIÓN*** y debes señalar los meses con sus respectivas cantidades pronosticadas. En caso la pregunta no te pida hace una prediccón entonces no escribas nada de la sección ***PREDICIÓN***, ni siquiera pongas el título ***PREDICIÓN***. A continuación, te envío la pregunta que debes analizar: ' + inputValue}), // Asegúrate de que coincida con lo que espera tu vista
            });

            if (!res.ok) {
                throw new Error('Error al enviar el mensaje');
            }

            const data = await res.json();
            console.log(data); // Añadir esta línea para depuración
            setResponse(data.data.text || ''); // Actualiza la respuesta del chatbot
            setInputValue(''); // Limpia el campo de entrada


            const res2 = await fetch('http://127.0.0.1:8000/api/chat/message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content:  'Si en el texto que te enviaré para que analices hay una sección explícitamene llamada  ***PREDICIÓN*** entonces te pido que transformes sus datos y me devuelvas con este formato Json de ejemplo: {"suma": {"1": 15,"2": 5, .... }}, en este ejemplo la cantidad demandada es 15 y 5 y los meses (Enero y Febrero) están como números, en el texto que te dare trata de ajustar a este formtao de ejemplo en base a los datos que se proporcionaran. En caso no haya una sección llamada explícitamene llamada "***PREDICIÓN***", responde con un 0. Aquí el texto que debes analizar:' + data.data.text }),
            });

            if (!res2.ok) {
                throw new Error('Error al enviar el mensaje');
            }

            const data2 = await res2.json();
            setResponse2(data2.data.text || ''); 
            // Verificar si data2.data.text es un objeto o cadena, y convertirlo a JSON solo si es una cadena
            const parsedResponse = JSON.parse(data2.data.text || '0'); // Intentamos convertir a JSON
            
            if (onResponseReceived) {
                onResponseReceived(parsedResponse);
            }

        } catch (error) {
            setError('Error al enviar el mensaje: ' + error.message);
        }
    };

    // const formattedText2 = `
    //             ID del Producto: ${productId || 'No disponible'}
    //             Nombre del Producto: ${productName || 'No disponible'}
    //             Talla del Producto: ${productSize || 'No disponible'}
    //             Cantidad de demanda del producto: ${textData || 'No disponibles'}
    //         `;

    return (
      <div >

        <div style={{ }}>
          <div style={{ backgroundColor: '#1F2937', padding: '20px', textAlign: 'center', maxWidth: '421px',border: '2px solid black' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Pregúntale al Bot</h1>
          </div>
            {/* Área de texto para mostrar la respuesta del chatbot */}
            <textarea style={{ border: '2px solid black'}}
                readOnly
                rows={18} // Número de filas del área de texto
                cols={50} // Ancho del área de texto
                value={response} // Asegúrate de que sea una cadena vacía si la respuesta es null
                placeholder={enableInput ? "La respuesta aparecerá aquí..." : "Selecciona un producto del combo box para cargar sus registros"}
            />
            <style jsx>{`
                textarea::placeholder {
                    color: ${enableInput ? 'gray' : 'red'}; /* Cambia el color del placeholder basado en enableInput */
                }
            `}</style>
            <form style={{ backgroundColor: '#1F2937', padding: '20px' ,  maxWidth: '421px', border: '2px solid black'}} onSubmit={handleSubmit}>
                <input className="px-6 py-3" style={{ marginRight:'15px' }}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={!enableInput} // Campo deshabilitado inicialmente
                    required // Esto asegura que el campo no esté vacío
                />
                <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Enviar</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}


{/* 
            <textarea 
                style={{ border: '2px solid black' }}
                readOnly
                rows={18}
                cols={50}
                value={formattedText2 || ''} // Mostrar los datos recibidos
                placeholder="Datos cargados aparecerán aquí..."
            /> */}

            {/* <textarea 
                style={{ border: '2px solid black' }}
                readOnly
                rows={18}
                cols={50}
                value={response2 || ''} // Mostrar los datos recibidos
                placeholder="Nuevo text area"
            /> */}

        </div>
      </div>

    );
};

export default ChatbotForm;
