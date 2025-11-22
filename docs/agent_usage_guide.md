# Simple Agent Usage Guide - Don't Get Overwhelmed

## The Truth About "Agents" in Cursor

**You don't create separate agents.** Cursor uses ONE AI that you give different roles via prompts.

Think of it like this:
- **One AI** (Cursor's assistant)
- **Different roles** (given via prompts)
- **Different tasks** (but work on them one at a time)

---

## How Many to Use?

### ✅ Recommended: **1 Agent** (90% of the time)

**Use this approach for most work:**
1. Pick one task
2. Write a prompt with a role: "You are the Backend Engineer..."
3. Complete the task
4. Test it
5. Move to next task

**Example:**
```
Task: Build login API endpoint
Prompt: 
@docs/architecture.md @src/server/api/auth
You are the Backend Engineer. Implement the login API endpoint following the architecture.
```

Wait for it to finish → Test → Next task.

---

### ⚠️ Optional: **2 Agents** (10% of the time)

**Only use 2 when tasks are completely independent:**

**When to use:**
- Setting up two different integrations (Stripe + PayPal)
- Backend API + Frontend UI (if API is already stable)
- Two unrelated features

**How to do it:**
1. Open **one Cursor chat** for Task 1
2. Open **another Cursor chat** (new chat) for Task 2
3. Work on both in parallel

**Example:**
```
Chat 1:
@docs/architecture.md @src/lib/integrations/stripe
You are the Integration Specialist. Set up Stripe integration.

Chat 2:
@docs/architecture.md @src/lib/integrations/paypal  
You are the Integration Specialist. Set up PayPal integration.
```

**⚠️ Warning signs to stop parallel work:**
- You feel overwhelmed
- Tasks interfere with each other
- You're not making progress
- If this happens → Finish one task, then do the other sequentially

---

### ❌ Never: **3+ Agents**

**Too overwhelming. Don't do it.**

If you need multiple things done, do them sequentially (one after another).

---

## Simple Daily Pattern

### Most Effective Approach

**Morning Session (2-3 hours):**
```
1. Pick ONE task from your phase plan
2. Give AI the role: "You are the [Backend/Frontend/etc.] Engineer..."
3. Complete task end-to-end
4. Test it
5. Done with that task
```

**Afternoon Session (2-3 hours):**
```
1. Pick next task
2. Give AI the role
3. Complete it
4. Test it
5. Done
```

**End of Day:**
- Quick review
- Commit code
- Done

---

## The Agent Roles (Just Prompt Templates)

You don't "create" these. You just use these prompts:

### 1. Backend Engineer
```
@docs/architecture.md @src/server/api
You are the Backend Engineer. Implement [feature] API endpoint following the architecture.
```

### 2. Frontend Engineer
```
@docs/architecture.md @src/app
You are the Frontend Engineer. Build [feature] UI following the architecture. Use shadcn/ui.
```

### 3. Integration Specialist
```
@docs/architecture.md @src/lib/integrations
You are the Integration Specialist. Set up [Service Name] integration following the architecture.
```

### 4. Database Engineer
```
@docs/architecture.md @prisma/schema.prisma
You are the Database Engineer. Update Prisma schema for [feature] following the architecture.
```

### 5. Full-Stack Engineer
```
@docs/architecture.md @src
You are the Full-Stack Engineer. Implement complete [feature] from frontend to backend following the architecture.
```

---

## Real Example: Building Authentication

### ❌ Overwhelming Way (Don't do this)
- Chat 1: Backend API
- Chat 2: Frontend UI
- Chat 3: Database schema
- Chat 4: Firebase integration

**Result:** Overwhelming, confusing, messy

### ✅ Simple Way (Do this)
**Task 1:** Database schema
```
@docs/architecture.md @prisma/schema.prisma
You are the Database Engineer. Create User and Professional models for authentication following the architecture.
```
Wait → Test → Done

**Task 2:** Firebase setup
```
@docs/architecture.md @src/lib/integrations/firebase
You are the Integration Specialist. Set up Firebase Auth for email and phone verification.
```
Wait → Test → Done

**Task 3:** Backend API
```
@docs/architecture.md @src/server/api/auth
You are the Backend Engineer. Implement register and login API endpoints using Firebase Auth.
```
Wait → Test → Done

**Task 4:** Frontend UI
```
@docs/architecture.md @src/app/(auth)/login
You are the Frontend Engineer. Build login page that calls the auth API.
```
Wait → Test → Done

**Result:** Clear, organized, manageable

---

## Key Principles

1. **One task at a time** - Finish before moving on
2. **Test as you go** - Don't accumulate untested code
3. **Keep it simple** - If it feels overwhelming, simplify
4. **Sequential > Parallel** - Usually faster overall
5. **Role via prompt** - "You are the..." gives the AI a role

---

## When in Doubt

**Always choose the simpler approach:**
- ✅ One task → One agent → Finish → Next
- ❌ Multiple tasks → Multiple agents → Confusion

**Remember:** The goal is to build the product, not to use all agents simultaneously.

---

## Summary

- **Use 1 agent** (one prompt at a time) for 90% of work
- **Use 2 agents** (two chats) only for truly independent tasks
- **Never use 3+ agents** at once
- **Finish one task** before starting the next
- **Keep it simple** - complexity leads to overwhelm

**That's it. You've got this.** 🚀










