import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function POST(request: Request) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
        const payload = await request.json();

        return await withAuth(async (token) => {
            // Crear el proceso de output
            const processResponse = await fetch(`http://${baseUrl}:8080/api/v3/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: payload.config.id,
                    type: payload.config.type,
                    reference: payload.config.reference,
                    ...payload.config.config
                })
            });

            if (!processResponse.ok) {
                const errorData = await processResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error creating output process');
            }

            // Crear los metadatos
            const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${payload.config.id}/metadata/restreamer-ui`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: payload.metadata["restreamer-ui"].name,
                    control: payload.metadata["restreamer-ui"].control
                })
            });

            if (!metadataResponse.ok) {
                const errorData = await metadataResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error creating output metadata');
            }

            return NextResponse.json({ id: payload.config.id });
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 