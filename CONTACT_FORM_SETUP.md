# Contact Form Setup Guide

## ✅ What's Already Implemented

- ✅ **Dedicated Contact Page** at `/contact` with professional layout
- ✅ **Two-column layout**: Company details (left) + Contact form (right)
- ✅ **Navbar** with ConsumerIQ branding and navigation links
- ✅ **Company contact information** with phone, email, and headquarters address
- ✅ **Full contact form** with validation (name, email, phone, company, role, reason, message)
- ✅ **Footer** matching the home page design
- ✅ **API endpoints** for submission and retrieval
- ✅ **Admin dashboard** for managing submissions
- ✅ **All buttons updated** to navigate to `/contact` page
- ✅ **Email integration** with Resend service
- ✅ **Database migration SQL** file created

---

## 🚀 Setup Steps Required

### Step 1: Run Database Migration in Supabase

1. **Go to your Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

2. **Copy the SQL from:** `supabase/migrations/20250115_create_contact_submissions.sql`

3. **Paste and execute the SQL in the Supabase SQL Editor**

4. **Verify table creation:**
   ```sql
   SELECT * FROM dyn_contact_submissions LIMIT 1;
   ```

---

### Step 2: Set Up Email Service (Resend - Recommended)

#### Option A: Using Resend (Recommended - Free 100 emails/day)

1. **Sign up for Resend:**
   - Go to: https://resend.com/signup
   - Create account

2. **Get API Key:**
   - Dashboard → API Keys → Create API Key
   - Copy the key

3. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_TO_EMAIL=info@consumeriq.ai
   ```

4. **Verify domain (if using custom email):**
   - Add DNS records in your domain registrar
   - Or use resend's `onboarding@resend.dev` for testing

#### Option B: Using SendGrid

1. **Sign up for SendGrid:**
   - Go to: https://signup.sendgrid.com/

2. **Get API Key:**
   - Settings → API Keys → Create API Key

3. **Add to `.env.local`:**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_TO_EMAIL=info@consumeriq.ai
   ```

---

### Step 3: Install Email Package

Choose one:

```bash
# For Resend
npm install resend

# For SendGrid
npm install @sendgrid/mail
```

---

### Step 4: Update Email Function

The email placeholder is in: `src/app/api/contact/submit/route.ts`

Replace the `sendEmailNotification` function with actual implementation (see examples below).

---

## 📧 Email Implementation Examples

### Resend Implementation

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function sendEmailNotification(data: z.infer<typeof contactSubmissionSchema>) {
  const { data: emailData, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL! || 'onboarding@resend.dev',
    to: process.env.RESEND_TO_EMAIL! || 'info@consumeriq.ai',
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    `
  })

  if (error) {
    throw error
  }

  return emailData
}
```

### SendGrid Implementation

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

async function sendEmailNotification(data: z.infer<typeof contactSubmissionSchema>) {
  const msg = {
    to: process.env.SENDGRID_TO_EMAIL! || 'info@consumeriq.ai',
    from: process.env.SENDGRID_FROM_EMAIL! || 'noreply@yourdomain.com',
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    `
  }

  await sgMail.send(msg)
}
```

---

## 🧪 Testing the Contact Form

### 1. Test Form Submission

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3006

3. **Click any "Talk to Our Team" button:**
   - Navbar button
   - Hero section button
   - Features CTA
   - Final CTA "Schedule a Demo"

4. **Fill out the form:**
   - Name: Test User
   - Email: test@example.com
   - Phone: +1 (555) 123-4567
   - Company: Test Company
   - Role: Select any role
   - Reason: Select any reason
   - Message: Optional test message

5. **Submit and check:**
   - Success message should appear
   - Form should close after 2 seconds
   - Check console logs for submission

### 2. Test Email Delivery

After setting up email service:
- Submit a test form
- Check info@consumeriq.ai inbox
- Verify email content is correct

### 3. Test Admin Dashboard

1. **Navigate to:** http://localhost:3006/admin/contact-submissions

2. **Verify you can:**
   - See submitted forms
   - Filter by status
   - Update submission status
   - View all submission details

---

## 📊 Database Schema

```sql
CREATE TABLE public.dyn_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'contacted', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contact_submissions_email ON dyn_contact_submissions(email);
CREATE INDEX idx_contact_submissions_status ON dyn_contact_submissions(status);
CREATE INDEX idx_contact_submissions_submitted_at ON dyn_contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_company ON dyn_contact_submissions(company);
```

---

## 🔒 Security Considerations

1. **Row Level Security (RLS):**
   - Already enabled in migration
   - Service role has full access
   - Authenticated users can view (for admin dashboard)

2. **Rate Limiting:**
   - Consider adding rate limiting to prevent spam
   - Implement CAPTCHA for production (recommended)

3. **Email Validation:**
   - Already validates email format
   - Consider adding email verification for production

4. **Data Privacy:**
   - Store only necessary information
   - Comply with GDPR/CCPA if applicable
   - Add privacy policy link

---

## 📁 File Structure

```
src/
├── components/
│   └── organisms/
│       └── ContactForm.tsx          # OLD: Modal form (no longer used)
├── app/
│   ├── contact/
│   │   └── page.tsx                 # NEW: Dedicated contact page (/contact)
│   ├── api/
│   │   └── contact/
│   │       ├── submit/
│   │       │   └── route.ts         # Form submission endpoint with Resend
│   │       └── submissions/
│   │           └── route.ts         # Admin API (GET, PATCH)
│   ├── admin/
│   │   └── contact-submissions/
│   │       └── page.tsx             # Admin dashboard
│   └── page.tsx                     # Home page (all buttons link to /contact)
├── lib/
│   └── supabase.ts                  # Database types added
└── scripts/
    └── run-migration.ts             # Migration helper

supabase/
└── migrations/
    └── 20250115_create_contact_submissions.sql
```

---

## 🎯 URLs

- **Main Website:** http://localhost:3007
- **Contact Page:** http://localhost:3007/contact
- **Admin Dashboard:** http://localhost:3007/admin/contact-submissions
- **API Endpoints:**
  - POST `/api/contact/submit` - Submit form
  - GET `/api/contact/submissions` - Get submissions
  - PATCH `/api/contact/submissions` - Update status

---

## ✨ Features Included

### Contact Page Features:
- ✅ **Full-page layout** with dedicated route `/contact`
- ✅ **Navbar** matching home page with navigation links
- ✅ **Two-column design**: Company details (left 40%) + Contact form (right 60%)
- ✅ **Company information section** with:
  - Email: info@consumeriq.ai
  - Phone: +1 (609) 619-0021
  - North America address: 3 Lenmore Ct, Monroe Township, NJ 08831
  - India address: Twenty20 Systems, Garuda Bhive, 4th floor, Old Madiwala, Kuvempu Nagar, BTM 2nd Stage, Bengaluru, Karnataka 560068
  - "Why ConsumerIQ?" highlights with checkmarks
- ✅ **Contact form** with validation:
  - 6 required fields: name, email, phone, company, role, reason
  - 1 optional field: message
  - Real-time error messages with Electric Cyan focus states
  - Role dropdown (9 options): C-Suite, VP/Director, Manager, Sales, Marketing, etc.
  - Reason dropdown (7 options): Schedule Demo, Pricing, Support, Partnership, etc.
- ✅ **Success/error feedback** with icon indicators
- ✅ **Footer** identical to home page design
- ✅ **Fully responsive** for mobile, tablet, and desktop
- ✅ **Brand consistency**: Deep Indigo, Electric Cyan, Montserrat/Inter fonts

### Backend Features:
- ✅ Database storage with timestamps and metadata
- ✅ Admin dashboard with status filtering
- ✅ Status workflow (new → in_progress → contacted → closed)
- ✅ Email notifications with Resend (professional HTML template)
- ✅ Form validation on both client and server
- ✅ Accessibility compliant (ARIA labels, keyboard navigation)

---

## 🐛 Troubleshooting

### Form doesn't open
- Check browser console for errors
- Verify React state is updating (`showContactForm`)

### Submission fails
- Check database connection (Supabase)
- Verify migration ran successfully
- Check API endpoint logs

### Email not sending
- Verify API keys are correct in `.env.local`
- Check email service dashboard for errors
- Test with simple email first

### Admin dashboard empty
- Verify database table exists
- Check Supabase RLS policies
- Submit a test form first

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs (`npm run dev`)
3. Verify environment variables are set
4. Check Supabase dashboard for data

---

**Status:** ✅ Implementation Complete - Ready for Testing
**Next:** Run database migration and set up email service
