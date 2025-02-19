import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/utils/authUtils';

const prisma = new PrismaClient();

export async function GET() {
  return withAuth(async () => {
    try {
      console.log('Attempting to fetch theme from database...');
      const theme = await prisma.userPreferences.findFirst();
      console.log('Theme from database:', theme);
      return NextResponse.json({ theme: theme?.theme || 'light' });
    } catch (error) {
      console.error('Error getting theme:', error);
      return NextResponse.json({ theme: 'light' }, { status: 500 });
    }
  });
}

export async function PUT(request: Request) {
  return withAuth(async () => {
    try {
      const { theme } = await request.json();
      
      const updatedTheme = await prisma.userPreferences.upsert({
        where: { id: 1 },
        update: { theme },
        create: {
          id: 1,
          theme
        }
      });

      return NextResponse.json(updatedTheme);
    } catch (error) {
      console.error('Error updating theme:', error);
      return NextResponse.json({ error: 'Error updating theme' }, { status: 500 });
    }
  });
} 