'use client';

import { useState } from 'react';

interface FileSystem {
  name: string;
  type: string;
  mount: string;
}

export default function FSTestPage() {
  const [message, setMessage] = useState('');
  const [fsList, setFsList] = useState<FileSystem[]>([]);

  const listFS = async () => {
    try {
      const response = await fetch('/api/fs/list');
      if (!response.ok) {
        throw new Error('Error al obtener la lista de sistemas de archivos');
      }
      const data = await response.json();
      setFsList(data);
      setMessage('Lista de sistemas de archivos obtenida');
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const createFile = async () => {
    try {
      const response = await fetch('/api/fs/test.txt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Este es un archivo de prueba ' + new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el archivo');
      }

      setMessage('Archivo creado correctamente');
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const deleteFile = async () => {
    try {
      const response = await fetch('/api/fs/test.txt', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el archivo');
      }

      setMessage('Archivo eliminado correctamente');
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba del Sistema de Archivos</h1>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={listFS}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Listar Sistemas de Archivos
          </button>

          {fsList.length > 0 && (
            <div className="mt-2 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Sistemas de archivos disponibles:</h3>
              <ul className="list-disc list-inside">
                {fsList.map((fs, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-medium">{fs.name}</span>
                    <span className="text-gray-600"> ({fs.type})</span>
                    <br />
                    <span className="text-sm text-gray-500">Montado en: {fs.mount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={createFile}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Crear Archivo
          </button>
          
          <button
            onClick={deleteFile}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Eliminar Archivo
          </button>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
} 