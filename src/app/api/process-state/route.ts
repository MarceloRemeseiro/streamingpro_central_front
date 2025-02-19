import { NextRequest, NextResponse } from 'next/server';
import { ProcessStateService } from '@/services/processStateService';
import { withAuth } from '@/utils/authUtils';

export async function GET(request: NextRequest) {
  return withAuth(async () => {
    const processId = request.nextUrl.searchParams.get('processId');
    
    if (!processId) {
      return NextResponse.json(
        { error: 'Process ID is required' },
        { status: 400 }
      );
    }

    try {
      const processStateService = ProcessStateService.getInstance();
      const state = await processStateService.getProcessState(processId);
      return NextResponse.json({ isEnabled: state });
    } catch (error) {
      console.error('Error getting process state:', error);
      return NextResponse.json(
        { error: 'Error getting process state' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async () => {
    const { processId, isEnabled } = await request.json();

    if (!processId) {
      return NextResponse.json(
        { error: 'Process ID is required' },
        { status: 400 }
      );
    }

    try {
      const processStateService = ProcessStateService.getInstance();
      await processStateService.setProcessState(processId, isEnabled);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error setting process state:', error);
      return NextResponse.json(
        { error: 'Error setting process state' },
        { status: 500 }
      );
    }
  });
} 