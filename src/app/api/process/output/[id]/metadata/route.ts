import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/authUtils';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL;
        const payload = await request.json();

        return await withAuth(async (token) => {
            try {
                const metadataResponse = await fetch(`http://${baseUrl}:8080/api/v3/process/${params.id}/metadata/restreamer-ui`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload["restreamer-ui"])
                });

                const metadataResponseText = await metadataResponse.text();
                console.log('Metadata Response:', metadataResponseText);

                if (!metadataResponse.ok) {
                    let errorMessage = 'Error creating output metadata';
                    try {
                        const errorData = JSON.parse(metadataResponseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = metadataResponseText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                return NextResponse.json({ success: true });
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