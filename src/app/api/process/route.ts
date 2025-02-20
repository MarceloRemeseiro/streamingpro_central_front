import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';
import { CreateProcessPayload } from '@/types/createProcessTypes';

export async function POST(request: Request) {
    try {
        const baseUrl = process.env.RESTREAMER_INTERNAL_API_URL;
        const input: CreateProcessPayload = await request.json();

        return await withAuth(async (token) => {
            // Crear el proceso
            const processResponse = await fetch(`${baseUrl}/api/v3/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(input.config)
            });

            if (!processResponse.ok) {
                const errorData = await processResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error creating process');
            }

            // Crear los metadatos
            const metadataResponse = await fetch(`${baseUrl}/api/v3/process/${input.config.id}/metadata/restreamer-ui`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(input.metadata)
            });

            if (!metadataResponse.ok) {
                const errorData = await metadataResponse.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error creating metadata');
            }

            return NextResponse.json({ id: input.config.id });
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error interno del servidor' },
            { status: 500 }
        );
    }
} 