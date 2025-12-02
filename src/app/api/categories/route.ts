import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories
// Fetches all categories with their subcategories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            description: true,
          },
          orderBy: {
            nameEn: 'asc',
          },
        },
      },
      orderBy: {
        nameEn: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST /api/categories
// Creates a new category (admin only - future feature)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameEn, nameFr, description, icon, slug } = body;

    // Validation
    if (!nameEn || typeof nameEn !== 'string' || nameEn.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: 'Category name (English) is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // Generate slug from nameEn if not provided
    const categorySlug = slug?.trim() || nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if category already exists by slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          {
            slug: {
              equals: categorySlug,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              equals: nameEn.trim(),
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category already exists',
          message: existingCategory.slug === categorySlug 
            ? `A category with the slug "${categorySlug}" already exists`
            : `A category with the name "${nameEn}" already exists`,
        },
        { status: 409 }
      );
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        slug: categorySlug,
        nameEn: nameEn.trim(),
        nameFr: nameFr?.trim() || null,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create category',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}