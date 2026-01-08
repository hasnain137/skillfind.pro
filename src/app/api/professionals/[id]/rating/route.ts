// GET /api/professionals/[id]/rating - Get professional's rating summary
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: professionalId } = await params;

    // Verify professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      throw new NotFoundError('Professional profile');
    }

    // Get approved reviews
    const reviews = await prisma.review.findMany({
      where: {
        job: {
          professionalId,
        },
        moderationStatus: 'APPROVED',
      },
      select: {
        rating: true,
        wouldRecommend: true,
        tags: true,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return successResponse({
        professionalId,
        averageRating: null,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationPercentage: 0,
        commonTags: [],
      });
    }

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    let recommendCount = 0;
    const tagCounts: Record<string, number> = {};

    reviews.forEach((review) => {
      totalRating += review.rating;
      distribution[review.rating as keyof typeof distribution]++;
      
      if (review.wouldRecommend) {
        recommendCount++;
      }

      // Count tags
      review.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
    const recommendationPercentage = Math.round((recommendCount / totalReviews) * 100);

    // Get top 5 common tags
    const commonTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return successResponse({
      professionalId,
      averageRating,
      totalReviews,
      ratingDistribution: distribution,
      recommendationPercentage,
      commonTags,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
