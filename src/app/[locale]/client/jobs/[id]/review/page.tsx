'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function ReviewJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    wouldRecommend: true,
  });

  // Fetch job info
  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          // API returns { success: true, data: { job: { ... } } }
          setJobInfo(data.data.job);
        }
      } catch (err) {
        console.error('Failed to fetch job:', err);
      }
    }
    fetchJob();
  }, [jobId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          rating: formData.rating,
          content: formData.content,
          wouldRecommend: formData.wouldRecommend,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to job detail
        router.push(`/client/jobs/${jobId}`);
      } else {
        // Handle structured validation errors
        let errorMessage = data.message || 'Failed to submit review';

        if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
          errorMessage = data.error.details
            .map((d: any) => d.message)
            .join('. ');
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }

        setError(errorMessage);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  }

  const ratingLabels = {
    1: { text: 'Poor', color: 'text-red-600' },
    2: { text: 'Fair', color: 'text-orange-600' },
    3: { text: 'Good', color: 'text-yellow-600' },
    4: { text: 'Very Good', color: 'text-blue-600' },
    5: { text: 'Excellent', color: 'text-green-600' },
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Leave a review"
        title="Rate your experience"
        description={jobInfo ? `Review for: ${jobInfo.request?.title}` : 'Loading...'}
      />

      {/* Professional Info Card */}
      {jobInfo && (
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" padding="lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4FD8] text-white font-bold text-xl shadow-md">
              {jobInfo.professional?.user?.firstName?.[0]}{jobInfo.professional?.user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-base font-bold text-[#333333]">
                {jobInfo.professional?.user?.firstName} {jobInfo.professional?.user?.lastName}
              </p>
              <p className="text-sm text-[#7C7373] mt-1">
                ✅ Job completed - Share your feedback
              </p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card level={1} padding="lg" className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="lg" className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="mb-3 block text-base font-bold text-[#333333] flex items-center gap-2">
              <span>⭐</span> How would you rate this professional?
            </label>
            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-5xl transition-all transform ${star <= formData.rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
                      } hover:text-yellow-400 hover:scale-125`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="ml-4">
                <p className={`text-2xl font-bold ${ratingLabels[formData.rating as keyof typeof ratingLabels].color}`}>
                  {ratingLabels[formData.rating as keyof typeof ratingLabels].text}
                </p>
                <p className="text-xs text-[#7C7373] mt-1">{formData.rating} out of 5 stars</p>
              </div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div>
            <label className="mb-3 block text-base font-bold text-[#333333] flex items-center gap-2">
              <span>👍</span> Would you recommend this professional?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${formData.wouldRecommend ? 'bg-green-50 border-green-500 text-green-700 ring-4 ring-green-500/10' : 'bg-white border-gray-200 text-gray-600 hover:border-green-200'
                  }`}
              >
                <span>👍</span> Yes, I recommend
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${!formData.wouldRecommend ? 'bg-red-50 border-red-500 text-red-700 ring-4 ring-red-500/10' : 'bg-white border-gray-200 text-gray-600 hover:border-red-200'
                  }`}
              >
                <span>👎</span> No, I don't recommend
              </button>
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <label className="mb-3 block text-base font-bold text-[#333333] flex items-center gap-2">
              <span>✍️</span> Share your experience
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-xl border-2 border-[#E5E7EB] px-4 py-3 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
              placeholder="Share your experience working with this professional...&#10;&#10;• What did they do well?&#10;• How was the communication?&#10;• Would you recommend them to others?&#10;• Any specific highlights or areas for improvement?"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <p className="text-[#7C7373] flex items-center gap-1">
                <span>💡</span> Your review helps other clients make informed decisions
              </p>
              <p className="text-[#B0B0B0]">{formData.content.length} characters (min 10)</p>
            </div>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200" padding="lg">
          <h3 className="text-sm font-bold text-[#333333] flex items-center gap-2 mb-3">
            <span>💡</span> Review Guidelines
          </h3>
          <div className="grid gap-2 text-xs text-[#7C7373]">
            <p>• Be honest and constructive in your feedback</p>
            <p>• Focus on the professional's work quality and communication</p>
            <p>• Avoid sharing personal or contact information</p>
            <p>• Reviews help build trust in our community</p>
          </div>
        </Card>

        {/* Submit Section */}
        <Card padding="lg" className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <p className="text-sm text-[#7C7373]">
              Ready to submit your review?
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none border border-[#E5E7EB] hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.content.trim().length < 10}
              className="flex-1 sm:flex-none shadow-md hover:shadow-lg"
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Review'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
