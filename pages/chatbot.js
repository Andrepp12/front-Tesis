import React, { useState } from 'react'; 

const ChatbotForm = () => {
    const [inputValue, setInputValue] = useState('');
    const [response, setResponse] = useState(''); // Cambiado a cadena vacía
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Verifica que el campo no esté vacío
        if (!inputValue.trim()) {
            setError('El contenido no puede estar vacío.');
            return;
        }

        setError(null); // Restablece el error si es válido
        try {
            const res = await fetch('http://127.0.0.1:8000/api/chat/message/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: inputValue }), // Asegúrate de que coincida con lo que espera tu vista
            });

            if (!res.ok) {
                throw new Error('Error al enviar el mensaje');
            }

            const data = await res.json();
            console.log(data); // Añadir esta línea para depuración
            setResponse(data.data.text || ''); // Actualiza la respuesta del chatbot
            setInputValue(''); // Limpia el campo de entrada
        } catch (error) {
            setError('Error al enviar el mensaje: ' + error.message);
        }
    };

    return (
      <div >

        <div style={{ }}>
          <div style={{ backgroundColor: '#1F2937', padding: '20px', textAlign: 'center', maxWidth: '421px',border: '2px solid black' }}>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#FFFFFF' }}>Pregúntale al Bot</h1>
          </div>
            {/* Área de texto para mostrar la respuesta del chatbot */}
            <textarea style={{ border: '2px solid black' }}
                readOnly
                rows={18} // Número de filas del área de texto
                cols={50} // Ancho del área de texto
                value={response || ''} // Asegúrate de que sea una cadena vacía si la respuesta es null
                placeholder="La respuesta aparecerá aquí..."
            />
            <form style={{ backgroundColor: '#1F2937', padding: '20px' ,  maxWidth: '421px', border: '2px solid black'}} onSubmit={handleSubmit}>
                <input className="px-6 py-3" style={{ marginRight:'15px' }}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    required // Esto asegura que el campo no esté vacío
                />
                <button type="submit" className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Enviar</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
      </div>

    );
};

export default ChatbotForm;
