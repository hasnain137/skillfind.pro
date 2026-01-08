import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/test
// Test endpoint to verify database connection and API functionality
export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Count records in each table
    const [
      categoryCount,
      subcategoryCount,
      userCount,
      professionalCount,
      platformSettings,
    ] = await Promise.all([
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.user.count(),
      prisma.professional.count(),
      prisma.platformSettings.findFirst(),
    ]);

    // Get sample categories
    const sampleCategories = await prisma.category.findMany({
      take: 3,
      include: {
        subcategories: {
          take: 2,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        connection: 'healthy',
        test_query: dbTest,
      },
      statistics: {
        categories: categoryCount,
        subcategories: subcategoryCount,
        users: userCount,
        professionals: professionalCount,
      },
      platform_settings: platformSettings,
      sample_data: {
        categories: sampleCategories,
      },
      endpoints: {
        categories: {
          get_all: '/api/categories',
          get_by_id: '/api/categories/[id]',
          create: 'POST /api/categories',
          update: 'PUT /api/categories/[id]',
          delete: 'DELETE /api/categories/[id]',
        },
      },
    });

  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}