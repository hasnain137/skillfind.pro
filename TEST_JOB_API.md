# 🧪 Job APIs - Testing Guide

## ✅ What Was Built

All Job Lifecycle API endpoints are now complete:

### Job Endpoints (6)
- ✅ `GET /api/jobs` - List jobs (role-based)
- ✅ `GET /api/jobs/[id]` - View job details
- ✅ `POST /api/jobs/[id]/start` - Start job (professional)
- ✅ `POST /api/jobs/[id]/complete` - Mark complete (professional)
- ✅ `POST /api/jobs/[id]/cancel` - Cancel job (either party)
- ✅ `POST /api/jobs/[id]/dispute` - Raise dispute (either party)

**Total: 6 endpoints, ~600 lines of code**

---

## 🔧 Features Implemented

### Job Management
✅ List all jobs (filtered by role)
✅ View full job details
✅ Contact information visible
✅ Start job workflow
✅ Complete job workflow
✅ Cancel with reason
✅ Dispute handling

### Status Management
✅ PENDING → IN_PROGRESS → COMPLETED
✅ PENDING → CANCELLED
✅ Any status → DISPUTED
✅ Timestamps for all transitions
✅ Audit trail

### Dispute System
✅ Either party can raise disputes
✅ Multiple dispute types
✅ Evidence attachment support
✅ Admin moderation queue
✅ Job frozen during dispute

---

## 📋 Job Status Flow

```
PENDING (job created, offer accepted)
   ↓
   ├─→ IN_PROGRESS (professional starts work)
   │      ↓
   │   COMPLETED (professional marks complete)
   │      ↓
   │   [Client can review]
   │
   ├─→ CANCELLED (either party cancels)
   │
   └─→ DISPUTED (either party raises dispute)
          ↓
       [Admin reviews]
```

---

## 🧪 Testing the APIs

### Prerequisites
```bash
# Make sure:
# 1. Job exists (created via offer acceptance)
# 2. Professional and client users exist
# 3. Contact info is exchanged
```

---

## 1️⃣ List Jobs

```bash
# Client: View own jobs
curl http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"

# Professional: View own jobs
curl http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"

# Filter by status
curl "http://localhost:3000/api/jobs?status=IN_PROGRESS" \
  -H "Authorization: Bearer YOUR_TOKEN"

# With pagination
curl "http://localhost:3000/api/jobs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_xxxxx",
        "status": "PENDING",
        "agreedPrice": {
          "cents": 4000,
          "euros": 40.00
        },
        "request": {
          "id": "req_123",
          "title": "Math tutor needed",
          "category": "Education & Tutoring",
          "subcategory": "Math Tutoring"
        },
        "client": {
          "firstName": "Sofia",
          "lastName": "Schmidt",
          "email": "sofia@example.com",
          "phoneNumber": "+43987654321",
          "city": "Vienna"
        },
        "professional": {
          "firstName": "Alex",
          "lastName": "Mayer",
          "email": "alex@example.com",
          "phoneNumber": "+43123456789",
          "city": "Vienna"
        },
        "hasReview": false,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## 2️⃣ View Job Details

```bash
curl http://localhost:3000/api/jobs/job_xxxxx \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_xxxxx",
      "status": "PENDING",
      "agreedPrice": {
        "cents": 4000,
        "euros": 40.00
      },
      "startedAt": null,
      "completedAt": null,
      "request": {
        "id": "req_123",
        "title": "Math tutor needed",
        "description": "Looking for tutor...",
        "budget": 4500,
        "location": "Vienna",
        "remoteOk": true,
        "category": {
          "id": "cat_edu",
          "name": "Education & Tutoring"
        },
        "subcategory": {
          "id": "sub_math",
          "name": "Math Tutoring"
        }
      },
      "offer": {
        "id": "offer_456",
        "message": "I'd love to help...",
        "proposedPrice": 4000,
        "estimatedDuration": "6 weeks",
        "availableSlots": "Tuesday 6-8 PM"
      },
      "client": {
        "firstName": "Sofia",
        "lastName": "Schmidt",
        "email": "sofia@example.com",
        "phoneNumber": "+43987654321",
        "city": "Vienna"
      },
      "professional": {
        "id": "pro_789",
        "title": "Math & Physics Tutor",
        "bio": "5 years experience...",
        "yearsOfExperience": 5,
        "user": {
          "firstName": "Alex",
          "lastName": "Mayer",
          "email": "alex@example.com",
          "phoneNumber": "+43123456789",
          "city": "Vienna"
        }
      },
      "review": null,
      "disputes": []
    }
  }
}
```

---

## 3️⃣ Start Job (Professional Only)

```bash
curl -X POST http://localhost:3000/api/jobs/job_xxxxx/start \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_xxxxx",
      "status": "IN_PROGRESS",
      "startedAt": "2024-01-15T14:00:00Z"
    },
    "message": "Job started successfully. Client has been notified."
  },
  "message": "Job started successfully"
}
```

**What happens:**
1. ✅ Job status → IN_PROGRESS
2. ✅ startedAt timestamp set
3. ✅ Client notified (TODO: email)

---

## 4️⃣ Complete Job (Professional Only)

```bash
curl -X POST http://localhost:3000/api/jobs/job_xxxxx/complete \
  -H "Authorization: Bearer YOUR_PRO_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_xxxxx",
      "status": "COMPLETED",
      "completedAt": "2024-01-20T18:00:00Z"
    },
    "message": "Job marked as complete. Client will be asked to leave a review."
  },
  "message": "Job completed successfully"
}
```

**What happens:**
1. ✅ Job status → COMPLETED
2. ✅ completedAt timestamp set
3. ✅ Client notified to leave review (TODO: email)
4. ✅ Client can now submit review

---

## 5️⃣ Cancel Job (Either Party)

```bash
curl -X POST http://localhost:3000/api/jobs/job_xxxxx/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reason": "Client decided to go with another tutor. No longer need this service.",
    "refundRequested": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_xxxxx",
      "status": "CANCELLED",
      "cancelledAt": "2024-01-16T12:00:00Z"
    },
    "cancellation": {
      "cancelledBy": "CLIENT",
      "reason": "Client decided to go with another tutor...",
      "refundRequested": true
    },
    "message": "Job cancelled. Refund request will be reviewed by admin."
  },
  "message": "Job cancelled successfully"
}
```

**What happens:**
1. ✅ Job status → CANCELLED
2. ✅ cancelledAt timestamp set
3. ✅ Cancellation record created
4. ✅ Refund flagged for admin review (if requested)
5. ✅ Both parties notified (TODO: email)

---

## 6️⃣ Raise Dispute (Either Party)

```bash
curl -X POST http://localhost:3000/api/jobs/job_xxxxx/dispute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reason": "WORK_NOT_SATISFACTORY",
    "description": "The tutoring sessions were not at the level expected. My daughter did not improve in her understanding of algebra despite 4 sessions. The tutor was often late and did not prepare materials as promised.",
    "evidenceUrls": [
      "https://example.com/evidence1.jpg",
      "https://example.com/evidence2.pdf"
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "dispute": {
      "id": "dispute_xxxxx",
      "reason": "WORK_NOT_SATISFACTORY",
      "description": "The tutoring sessions were not...",
      "status": "OPEN",
      "raisedBy": "CLIENT",
      "createdAt": "2024-01-16T15:00:00Z"
    },
    "job": {
      "id": "job_xxxxx",
      "status": "DISPUTED"
    },
    "message": "Dispute raised successfully. Our admin team will review it within 24-48 hours."
  },
  "message": "Dispute created successfully"
}
```

**What happens:**
1. ✅ Dispute record created
2. ✅ Job status → DISPUTED
3. ✅ Job frozen (no further actions)
4. ✅ Admin notified (TODO: email)
5. ✅ Other party notified (TODO: email)
6. ✅ Evidence attached

---

## 📊 Complete Job Lifecycle

```
1. OFFER ACCEPTED
   → Job created with status PENDING
   → Phones revealed
   
2. PROFESSIONAL STARTS JOB
   POST /api/jobs/[id]/start
   → Status: IN_PROGRESS
   → Client notified
   
3. WORK IS DONE
   POST /api/jobs/[id]/complete
   → Status: COMPLETED
   → Client asked for review
   
4. CLIENT SUBMITS REVIEW
   POST /api/reviews
   → Review linked to job
   → Professional notified
   
5. PROFESSIONAL RESPONDS (optional)
   POST /api/reviews/[id]/respond
   → Response added to review
```

---

## 🎯 Dispute Reasons

| Reason | Description |
|--------|-------------|
| `WORK_NOT_COMPLETED` | Service not fully delivered |
| `WORK_NOT_SATISFACTORY` | Quality below expectations |
| `PAYMENT_ISSUE` | Payment not received/processed |
| `COMMUNICATION_BREAKDOWN` | Can't reach other party |
| `OTHER` | Other issues |

---

## 🔐 Access Control

### Who Can Do What

| Action | Client | Professional | Admin |
|--------|--------|--------------|-------|
| List jobs | Own jobs | Own jobs | All jobs |
| View job | Own jobs | Own jobs | All jobs |
| Start job | ❌ | ✅ | ❌ |
| Complete job | ❌ | ✅ | ❌ |
| Cancel job | ✅ | ✅ | ✅ |
| Dispute job | ✅ | ✅ | ❌ |

---

## ⚠️ Error Cases

### Cannot Start Already Started Job
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot start job with status IN_PROGRESS. Only PENDING jobs can be started."
  }
}
```

### Cannot Complete Cancelled Job
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot complete a cancelled job"
  }
}
```

### Cannot Dispute Cancelled Job
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot dispute a cancelled job"
  }
}
```

### Already Has Open Dispute
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "There is already an open dispute for this job"
  }
}
```

---

## 🎯 Business Rules

### Starting Jobs
✅ Only professional can start
✅ Must be in PENDING status
✅ Sets startedAt timestamp
✅ Client notified

### Completing Jobs
✅ Only professional can complete
✅ Cannot complete if CANCELLED or DISPUTED
✅ Sets completedAt timestamp
✅ Enables review submission

### Cancelling Jobs
✅ Either party can cancel
✅ Cannot cancel if COMPLETED
✅ Creates cancellation record
✅ Refund can be requested
✅ Admin reviews refund requests

### Disputing Jobs
✅ Either party can dispute
✅ Cannot dispute if CANCELLED
✅ Only one open dispute at a time
✅ Job frozen during dispute
✅ Admin mediates

---

## 🔄 Integration with Frontend

### Display Job List
```typescript
const response = await fetch('/api/jobs?status=IN_PROGRESS');
const { data } = await response.json();

<JobList>
  {data.jobs.map(job => (
    <JobCard key={job.id}>
      <h3>{job.request.title}</h3>
      <p>Status: {job.status}</p>
      <p>Price: {job.agreedPrice.formatted}</p>
      <ContactInfo>
        {job.professional.firstName} - {job.professional.phoneNumber}
      </ContactInfo>
    </JobCard>
  ))}
</JobList>
```

### Start Job Button
```typescript
const handleStartJob = async (jobId) => {
  const response = await fetch(`/api/jobs/${jobId}/start`, {
    method: 'POST'
  });
  
  if (response.ok) {
    toast.success('Job started! Client has been notified.');
    refreshJobs();
  }
};
```

### Complete Job Button
```typescript
const handleCompleteJob = async (jobId) => {
  const confirmed = confirm('Mark this job as complete?');
  if (!confirmed) return;
  
  const response = await fetch(`/api/jobs/${jobId}/complete`, {
    method: 'POST'
  });
  
  if (response.ok) {
    toast.success('Job completed! Waiting for client review.');
    router.push('/pro/jobs');
  }
};
```

### Cancel Job Form
```typescript
const handleCancelJob = async (jobId, formData) => {
  const response = await fetch(`/api/jobs/${jobId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      reason: formData.reason,
      refundRequested: formData.refundRequested
    })
  });
  
  if (response.ok) {
    toast.success('Job cancelled.');
    router.push('/jobs');
  }
};
```

### Raise Dispute Form
```typescript
const handleRaiseDispute = async (jobId, formData) => {
  const response = await fetch(`/api/jobs/${jobId}/dispute`, {
    method: 'POST',
    body: JSON.stringify({
      reason: formData.reason,
      description: formData.description,
      evidenceUrls: formData.evidenceUrls
    })
  });
  
  if (response.ok) {
    const { data } = await response.json();
    toast.success('Dispute raised. Admin will review within 24-48 hours.');
    router.push(`/jobs/${jobId}`);
  }
};
```

---

## ✅ Testing Checklist

**Job Listing:**
- [ ] Client can list own jobs
- [ ] Professional can list own jobs
- [ ] Filter by status works
- [ ] Pagination works

**Job Details:**
- [ ] View full job details
- [ ] Contact info visible
- [ ] Offer details visible
- [ ] Dispute list visible

**Job Actions:**
- [ ] Professional can start PENDING job
- [ ] Cannot start non-PENDING job
- [ ] Professional can complete IN_PROGRESS job
- [ ] Cannot complete CANCELLED job

**Cancellation:**
- [ ] Client can cancel job
- [ ] Professional can cancel job
- [ ] Reason is required (min 10 chars)
- [ ] Refund request flag works

**Disputes:**
- [ ] Client can raise dispute
- [ ] Professional can raise dispute
- [ ] Description required (min 50 chars)
- [ ] Evidence URLs optional
- [ ] Job status changes to DISPUTED
- [ ] Cannot raise duplicate disputes

---

**Job Lifecycle APIs Complete! 🎉**

**Next: Build Review APIs to complete the feedback loop!**
