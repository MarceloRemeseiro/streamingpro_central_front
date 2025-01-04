import { NextResponse } from 'next/server';
import { getAuthToken } from '@/services/auth';
import { CreateProcessPayload } from '@/types/createProcessTypes';

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: 'No auth token available' }, { status: 401 });
    }

    const payload = await request.json() as CreateProcessPayload;
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_RESTREAMER_BASE_URL}/api/v3/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Restreamer API error:', text);
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 