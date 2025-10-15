-- Create contact submissions table
CREATE TABLE IF NOT EXISTS public.dyn_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.dyn_contact_submissions(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.dyn_contact_submissions(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.dyn_contact_submissions(submitted_at DESC);

-- Create index on company for grouping
CREATE INDEX IF NOT EXISTS idx_contact_submissions_company ON public.dyn_contact_submissions(company);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.dyn_contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.dyn_contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access to contact submissions"
  ON public.dyn_contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to view submissions (for admin dashboard)
CREATE POLICY "Authenticated users can view contact submissions"
  ON public.dyn_contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.dyn_contact_submissions IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN public.dyn_contact_submissions.id IS 'Unique identifier for the submission';
COMMENT ON COLUMN public.dyn_contact_submissions.name IS 'Full name of the person submitting';
COMMENT ON COLUMN public.dyn_contact_submissions.email IS 'Email address of the submitter';
COMMENT ON COLUMN public.dyn_contact_submissions.phone IS 'Phone number of the submitter';
COMMENT ON COLUMN public.dyn_contact_submissions.company IS 'Company name of the submitter';
COMMENT ON COLUMN public.dyn_contact_submissions.role IS 'Job role of the submitter';
COMMENT ON COLUMN public.dyn_contact_submissions.reason IS 'Reason for reaching out';
COMMENT ON COLUMN public.dyn_contact_submissions.message IS 'Optional message from the submitter';
COMMENT ON COLUMN public.dyn_contact_submissions.submitted_at IS 'Timestamp when the form was submitted';
COMMENT ON COLUMN public.dyn_contact_submissions.status IS 'Current status of the submission (new, in_progress, contacted, closed)';
COMMENT ON COLUMN public.dyn_contact_submissions.metadata IS 'Additional metadata like user agent, IP address, etc.';
