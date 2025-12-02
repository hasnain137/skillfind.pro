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
    comment: '',
  });

  // Fetch job info
  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJobInfo(data.data);
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
          comment: formData.comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to job detail
        router.push(`/client/jobs/${jobId}`);
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Leave a review"
        title="Rate your experience"
        description={jobInfo ? `Review for: ${jobInfo.request?.title}` : 'Loading...'}
      />

      {error && (
        <Card variant="muted" padding="lg" className="bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card padding="lg" className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#333333]">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-3xl transition-colors ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-[#7C7373] mt-1">
              {formData.rating === 1 && 'Poor'}
              {formData.rating === 2 && 'Fair'}
              {formData.rating === 3 && 'Good'}
              {formData.rating === 4 && 'Very Good'}
              {formData.rating === 5 && 'Excellent'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#333333]">
              Your review *
            </label>
            <textarea
              required
              rows={6}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#333333] placeholder:text-[#B0B0B0] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
              placeholder="Share your experience working with this professional. What did they do well? How was the communication? Would you recommend them?"
            />
            <p className="text-xs text-[#7C7373] mt-1">
              Your review helps other clients make informed decisions
            </p>
          </div>
        </Card>

        <Card variant="dashed" padding="lg" className="flex items-center justify-between">
          <p className="text-sm text-[#7C7373]">
            By submitting, you agree to our review guidelines
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="border border-[#E5E7EB]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
