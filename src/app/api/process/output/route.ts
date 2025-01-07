import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function POST(request: Request) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
        const payload = await request.json();

        return await withAuth(async (token) => {
            try {
                // Crear el proceso de output
                const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload.config)
                });

                const processResponseText = await processResponse.text();

                if (!processResponse.ok) {
                    let errorMessage = 'Error creating output process';
                    try {
                        const errorData = JSON.parse(processResponseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = processResponseText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                // Crear los metadatos
                const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${payload.config.id}/metadata/restreamer-ui`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload.metadata)
                });

                const metadataResponseText = await metadataResponse.text();

                if (!metadataResponse.ok) {
                    let errorMessage = 'Error creating output metadata';
                    try {
                        const errorData = JSON.parse(metadataResponseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = metadataResponseText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                return NextResponse.json({ id: payload.config.id });
            } catch (error) {
                console.error('API Error:', error);
                return NextResponse.json(
                    { error: error instanceof Error ? error.message : 'Error interno del servidor' },
                    { status: 500 }
                );
            }
        });
    } catch (error) {
        console.error('Request Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 