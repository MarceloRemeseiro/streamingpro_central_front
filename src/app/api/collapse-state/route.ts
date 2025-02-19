import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/utils/authUtils';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  return withAuth(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const processId = searchParams.get('processId');
      const type = searchParams.get('type');

      if (!processId || !type) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const state = await prisma.collapseState.findUnique({
        where: {
          processId_type: {
            processId,
            type
          }
        }
      });

      return NextResponse.json({ isCollapsed: state?.isCollapsed ?? false });
    } catch (error) {
      console.error('Error getting collapse state:', error);
      return NextResponse.json({ error: 'Error getting collapse state' }, { status: 500 });
    }
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    try {
      const { processId, type, isCollapsed } = await request.json();

      if (!processId || !type || typeof isCollapsed !== 'boolean') {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const state = await prisma.collapseState.upsert({
        where: {
          processId_type: {
            processId,
            type
          }
        },
        update: {
          isCollapsed
        },
        create: {
          id: `${processId}-${type}`,
          processId,
          type,
          isCollapsed
        }
      });

      return NextResponse.json(state);
    } catch (error) {
      console.error('Error updating collapse state:', error);
      return NextResponse.json({ error: 'Error updating collapse state' }, { status: 500 });
    }
  });
} 