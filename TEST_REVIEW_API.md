# 🧪 Review APIs - Testing Guide

## ✅ What Was Built

All Review API endpoints are now complete:

### Review Endpoints (5)
- ✅ `POST /api/reviews` - Submit review (client only, after completion)
- ✅ `GET /api/reviews` - List reviews (public)
- ✅ `GET /api/reviews/[id]` - View single review
- ✅ `POST /api/reviews/[id]/respond` - Professional response
- ✅ `GET /api/professionals/[id]/reviews` - Professional's all reviews
- ✅ `GET /api/professionals/[id]/rating` - Rating summary

**Total: 6 endpoints, ~650 lines of code**

---

## 🔧 Features Implemented

### Review System
✅ Submit reviews after job completion
✅ 5-star rating system
✅ Optional title and tags
✅ Would recommend flag
✅ Content moderation (pending/approved)
✅ One review per job

### Professional Response
✅ Respond to reviews
✅ One response per review
✅ Only to approved reviews
✅ Client notified

### Rating System
✅ Average rating calculation
✅ Rating distribution (1-5 stars)
✅ Total review count
✅ Recommendation percentage
✅ Common tags analysis

### Privacy & Moderation
✅ Client name partially hidden (last initial only)
✅ Reviews pending moderation
✅ Only approved reviews shown publicly
✅ Auto-update professional rating

---

## 📋 Review Flow

```
1. JOB COMPLETED
   ↓
2. CLIENT SUBMITS REVIEW
   POST /api/reviews
   → Status: PENDING moderation
   ↓
3. ADMIN APPROVES
   (Admin panel - to be built)
   → Status: APPROVED
   ↓
4. REVIEW VISIBLE PUBLICLY
   Professional notified
   ↓
5. PROFESSIONAL RESPONDS (optional)
   POST /api/reviews/[id]/respond
   → Response visible to all
```

---

## 🧪 Testing the APIs

### Prerequisites
```bash
# Make sure:
# 1. Job completed (status: COMPLETED)
# 2. Client and professional users exist
# 3. Job belongs to client
```

---

## 1️⃣ Submit Review (Client Only)

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "jobId": "job_xxxxx",
    "rating": 5,
    "title": "Excellent tutor!",
    "content": "Alex was an amazing math tutor. My daughter improved significantly in just 6 weeks. He was always on time, well-prepared, and explained concepts clearly. Highly recommend!",
    "tags": ["Professional", "Patient", "Knowledgeable", "Punctual"],
    "wouldRecommend": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "review_xxxxx",
      "rating": 5,
      "title": "Excellent tutor!",
      "content": "Alex was an amazing math tutor...",
      "tags": ["Professional", "Patient", "Knowledgeable", "Punctual"],
      "wouldRecommend": true,
      "moderationStatus": "PENDING",
      "createdAt": "2024-01-20T10:00:00Z"
    },
    "message": "Review submitted successfully. It will be published after moderation."
  },
  "message": "Review created successfully"
}
```

**What happens:**
1. ✅ Review created with PENDING status
2. ✅ Professional notified (TODO: email)
3. ✅ Queued for admin moderation
4. ✅ Average rating updated after approval

---

## 2️⃣ List Reviews (Public)

```bash
# All approved reviews
curl http://localhost:3000/api/reviews

# Reviews for specific professional
curl "http://localhost:3000/api/reviews?professionalId=pro_xxxxx"

# Filter by rating
curl "http://localhost:3000/api/reviews?rating=5"

# Filter by recommendation
curl "http://localhost:3000/api/reviews?wouldRecommend=true"

# With pagination
curl "http://localhost:3000/api/reviews?page=1&limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_xxxxx",
        "rating": 5,
        "title": "Excellent tutor!",
        "content": "Alex was an amazing math tutor...",
        "tags": ["Professional", "Patient"],
        "wouldRecommend": true,
        "createdAt": "2024-01-20T10:00:00Z",
        "professional": {
          "id": "pro_xxxxx",
          "title": "Math & Physics Tutor",
          "user": {
            "firstName": "Alex",
            "lastName": "Mayer",
            "city": "Vienna"
          }
        },
        "client": {
          "firstName": "Sofia",
          "lastNameInitial": "S.",
          "city": "Vienna"
        },
        "service": {
          "category": "Education & Tutoring",
          "subcategory": "Math Tutoring"
        },
        "professionalResponse": null
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## 3️⃣ View Single Review

```bash
curl http://localhost:3000/api/reviews/review_xxxxx
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "review_xxxxx",
      "rating": 5,
      "title": "Excellent tutor!",
      "content": "Alex was an amazing math tutor...",
      "tags": ["Professional", "Patient", "Knowledgeable"],
      "wouldRecommend": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "professional": {
        "id": "pro_xxxxx",
        "title": "Math & Physics Tutor",
        "user": {
          "firstName": "Alex",
          "lastName": "Mayer",
          "city": "Vienna"
        }
      },
      "client": {
        "firstName": "Sofia",
        "lastNameInitial": "S.",
        "city": "Vienna"
      },
      "service": {
        "category": "Education & Tutoring",
        "subcategory": "Math Tutoring"
      },
      "professionalResponse": {
        "response": "Thank you Sofia! It was a pleasure working with your daughter...",
        "createdAt": "2024-01-21T14:00:00Z"
      }
    }
  }
}
```

---

## 4️⃣ Professional Response

```bash
curl -X POST http://localhost:3000/api/reviews/review_xxxxx/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PRO_TOKEN" \
  -d '{
    "response": "Thank you Sofia! It was a pleasure working with your daughter. I am glad to hear about her improvement. Wishing her continued success in her studies!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": "response_xxxxx",
      "response": "Thank you Sofia! It was a pleasure...",
      "createdAt": "2024-01-21T14:00:00Z"
    },
    "message": "Response submitted successfully. Client will be notified."
  },
  "message": "Response created successfully"
}
```

**What happens:**
1. ✅ Response created and linked to review
2. ✅ Client notified (TODO: email)
3. ✅ Response visible publicly
4. ✅ One response per review (cannot respond twice)

---

## 5️⃣ Get Professional's Reviews

```bash
curl http://localhost:3000/api/professionals/pro_xxxxx/reviews

# With pagination
curl "http://localhost:3000/api/professionals/pro_xxxxx/reviews?page=1&limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "professional": {
      "id": "pro_xxxxx",
      "title": "Math & Physics Tutor",
      "averageRating": 4.8,
      "totalReviews": 15,
      "user": {
        "firstName": "Alex",
        "lastName": "Mayer",
        "city": "Vienna"
      }
    },
    "reviews": [
      {
        "id": "review_1",
        "rating": 5,
        "title": "Excellent tutor!",
        "content": "...",
        "tags": ["Professional", "Patient"],
        "wouldRecommend": true,
        "createdAt": "2024-01-20T10:00:00Z",
        "client": {
          "firstName": "Sofia",
          "lastNameInitial": "S.",
          "city": "Vienna"
        },
        "service": {
          "category": "Education & Tutoring",
          "subcategory": "Math Tutoring"
        },
        "professionalResponse": {
          "response": "Thank you...",
          "createdAt": "2024-01-21T14:00:00Z"
        }
      }
    ],
    "statistics": {
      "total": 15,
      "averageRating": 4.8,
      "ratingDistribution": {
        "5": 12,
        "4": 2,
        "3": 1,
        "2": 0,
        "1": 0
      },
      "recommendationPercentage": 93
    }
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## 6️⃣ Get Rating Summary

```bash
curl http://localhost:3000/api/professionals/pro_xxxxx/rating
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "professionalId": "pro_xxxxx",
    "averageRating": 4.8,
    "totalReviews": 15,
    "ratingDistribution": {
      "5": 12,
      "4": 2,
      "3": 1,
      "2": 0,
      "1": 0
    },
    "recommendationPercentage": 93,
    "commonTags": [
      { "tag": "Professional", "count": 12 },
      { "tag": "Patient", "count": 10 },
      { "tag": "Knowledgeable", "count": 9 },
      { "tag": "Punctual", "count": 8 },
      { "tag": "Clear explanations", "count": 7 }
    ]
  }
}
```

---

## 📊 Rating Calculation

### Average Rating
```typescript
totalRating = sum of all ratings
averageRating = totalRating / totalReviews
// Rounded to 1 decimal: 4.8
```

### Rating Distribution
```typescript
{
  "5": 12,  // 12 five-star reviews
  "4": 2,   // 2 four-star reviews
  "3": 1,   // 1 three-star review
  "2": 0,   // 0 two-star reviews
  "1": 0    // 0 one-star reviews
}
```

### Recommendation Percentage
```typescript
recommendCount = reviews where wouldRecommend = true
recommendationPercentage = (recommendCount / totalReviews) * 100
// Example: (14 / 15) * 100 = 93%
```

### Common Tags
```typescript
// Top 5 most used tags across all reviews
[
  { "tag": "Professional", "count": 12 },
  { "tag": "Patient", "count": 10 },
  // ...
]
```

---

## 🎯 Business Rules

### Submitting Reviews
✅ Client only
✅ Job must be COMPLETED
✅ One review per job
✅ Rating: 1-5 stars (required)
✅ Content: 20-1000 characters
✅ Title: optional, 5-100 characters
✅ Tags: optional, max 5
✅ Moderation: PENDING by default

### Professional Response
✅ Professional only
✅ Review must be APPROVED
✅ Review must be for their job
✅ One response per review
✅ Response: 20-500 characters

### Moderation
✅ Reviews start as PENDING
✅ Admin approves/rejects (to be built)
✅ Only APPROVED reviews shown publicly
✅ Rating updated after approval

### Privacy
✅ Client last name hidden (initial only)
✅ Service category/subcategory shown
✅ Review linked to completed job

---

## 🔄 Integration with Frontend

### Display Reviews on Profile
```typescript
const response = await fetch(`/api/professionals/${proId}/reviews`);
const { data } = await response.json();

<ProfileReviews>
  <RatingSummary>
    <Stars rating={data.professional.averageRating} />
    <p>{data.professional.totalReviews} reviews</p>
    <p>{data.statistics.recommendationPercentage}% recommend</p>
  </RatingSummary>

  <RatingDistribution>
    {Object.entries(data.statistics.ratingDistribution).map(([stars, count]) => (
      <Bar key={stars} stars={stars} count={count} />
    ))}
  </RatingDistribution>

  <ReviewList>
    {data.reviews.map(review => (
      <ReviewCard key={review.id} review={review} />
    ))}
  </ReviewList>
</ProfileReviews>
```

### Submit Review Form
```typescript
const handleSubmitReview = async (jobId, formData) => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      jobId,
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
      tags: formData.selectedTags,
      wouldRecommend: formData.wouldRecommend
    })
  });

  if (response.ok) {
    toast.success('Review submitted! It will be published after moderation.');
    router.push('/client/jobs');
  }
};
```

### Professional Response Form
```typescript
const handleRespond = async (reviewId, response) => {
  const result = await fetch(`/api/reviews/${reviewId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ response })
  });

  if (result.ok) {
    toast.success('Response submitted! Client will be notified.');
    refreshReviews();
  }
};
```

### Display Rating Widget
```typescript
const response = await fetch(`/api/professionals/${proId}/rating`);
const { data } = await response.json();

<RatingWidget>
  <Stars value={data.averageRating} />
  <span>{data.averageRating} / 5.0</span>
  <span>({data.totalReviews} reviews)</span>
  <span>{data.recommendationPercentage}% recommend</span>
</RatingWidget>
```

---

## ⚠️ Error Cases

### Cannot Review Non-Completed Job
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You can only review completed jobs"
  }
}
```

### Already Reviewed
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You have already reviewed this job"
  }
}
```

### Cannot Respond to Pending Review
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You can only respond to approved reviews"
  }
}
```

### Already Responded
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "You have already responded to this review"
  }
}
```

---

## ✅ Testing Checklist

**Submit Review:**
- [ ] Client can submit review after job completion
- [ ] Cannot submit if job not completed
- [ ] Cannot submit duplicate review
- [ ] Rating 1-5 required
- [ ] Content min 20 chars
- [ ] Tags optional (max 5)
- [ ] Review starts as PENDING

**List Reviews:**
- [ ] Can list all approved reviews
- [ ] Filter by professional works
- [ ] Filter by rating works
- [ ] Filter by recommendation works
- [ ] Pagination works
- [ ] Client name partially hidden

**Professional Response:**
- [ ] Professional can respond to approved reviews
- [ ] Cannot respond to pending reviews
- [ ] Cannot respond twice
- [ ] Response min 20 chars
- [ ] Response visible publicly

**Rating System:**
- [ ] Average rating calculated correctly
- [ ] Rating distribution accurate
- [ ] Recommendation percentage correct
- [ ] Common tags extracted
- [ ] Rating updates after new review

---

**Review APIs Complete! ⭐ Trust & reputation system is now functional!**

**Next: Admin APIs for platform management or test everything?**
