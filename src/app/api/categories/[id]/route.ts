import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/categories/[id]
// Fetches a single category with its subcategories
export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          message: 'Category ID must be provided',
        },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
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
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: `No category found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]
// Updates a category (admin only - future feature)
export async function PUT(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nameEn, nameFr, description, icon, slug } = body;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          message: 'Category ID must be provided',
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: `No category found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (nameEn !== undefined) {
      if (typeof nameEn !== 'string' || nameEn.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input',
            message: 'Category name must be a non-empty string',
          },
          { status: 400 }
        );
      }

      // Check if another category has the same name
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          nameEn: {
            equals: nameEn.trim(),
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category name already exists',
            message: `Another category with the name "${nameEn}" already exists`,
          },
          { status: 409 }
        );
      }

      updateData.nameEn = nameEn.trim();
    }

    if (nameFr !== undefined) {
      updateData.nameFr = nameFr?.trim() || null;
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input',
            message: 'Category slug must be a non-empty string',
          },
          { status: 400 }
        );
      }

      // Check if another category has the same slug
      const duplicateSlug = await prisma.category.findFirst({
        where: {
          slug: {
            equals: slug.trim(),
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category slug already exists',
            message: `Another category with the slug "${slug}" already exists`,
          },
          { status: 409 }
        );
      }

      updateData.slug = slug.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (icon !== undefined) {
      updateData.icon = icon?.trim() || null;
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        subcategories: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update category',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
// Deletes a category (admin only - future feature)
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          message: 'Category ID must be provided',
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subcategories: true,
            requests: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
          message: `No category found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Check if category has dependencies
    if (existingCategory._count.subcategories > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category',
          message: `Category has ${existingCategory._count.subcategories} subcategories. Delete subcategories first.`,
        },
        { status: 409 }
      );
    }

    if (existingCategory._count.requests > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category',
          message: `Category has ${existingCategory._count.requests} requests. Cannot delete.`,
        },
        { status: 409 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete category',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Internal server error',
      },
      { status: 500 }
    );
  }
}