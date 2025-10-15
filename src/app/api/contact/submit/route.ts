import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Validation schema
const contactSubmissionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  company: z.string().min(2),
  role: z.string().min(1),
  reason: z.string().min(1),
  message: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = contactSubmissionSchema.parse(body)

    // Store in database
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('dyn_contact_submissions')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        role: validatedData.role,
        reason: validatedData.reason,
        message: validatedData.message || null,
        submitted_at: new Date().toISOString(),
        status: 'new',
        metadata: {
          user_agent: request.headers.get('user-agent') || 'unknown',
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to store submission: ${dbError.message}`)
    }

    // Send email notification (using a placeholder approach)
    // In production, you'd integrate with SendGrid, Resend, or similar
    try {
      await sendEmailNotification(validatedData)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the request if email fails - submission is already saved
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: submission.id
    })

  } catch (error) {
    console.error('Contact form submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit contact form'
      },
      { status: 500 }
    )
  }
}

// Email notification function
async function sendEmailNotification(data: z.infer<typeof contactSubmissionSchema>) {
  // If Resend is configured, send email
  if (resend && process.env.RESEND_TO_EMAIL) {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.RESEND_TO_EMAIL,
        subject: `New Contact Form Submission from ${data.name} - ${data.company}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #0A1930; color: #FFFFFF; padding: 20px; border-radius: 8px 8px 0 0; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { background-color: #FFFFFF; padding: 30px; border: 1px solid #EBEFF2; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #00C8FF; font-size: 14px; margin-bottom: 5px; }
                .value { color: #333333; font-size: 16px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #EBEFF2; color: #666666; font-size: 12px; }
                .highlight { background-color: #00C8FF; color: #0A1930; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎯 New Contact Form Submission</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">FULL NAME</div>
                    <div class="value">${data.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">EMAIL ADDRESS</div>
                    <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                  </div>
                  <div class="field">
                    <div class="label">PHONE NUMBER</div>
                    <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
                  </div>
                  <div class="field">
                    <div class="label">COMPANY</div>
                    <div class="value">${data.company}</div>
                  </div>
                  <div class="field">
                    <div class="label">ROLE</div>
                    <div class="value"><span class="highlight">${data.role}</span></div>
                  </div>
                  <div class="field">
                    <div class="label">REASON FOR REACHING OUT</div>
                    <div class="value"><span class="highlight">${data.reason}</span></div>
                  </div>
                  ${data.message ? `
                  <div class="field">
                    <div class="label">MESSAGE</div>
                    <div class="value" style="background-color: #EBEFF2; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${data.message}</div>
                  </div>
                  ` : ''}
                  <div class="footer">
                    <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'long'
                    })}</p>
                    <p>View all submissions: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006'}/admin/contact-submissions">Admin Dashboard</a></p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      })

      if (error) {
        console.error('Resend email error:', error)
        throw error
      }

      console.log('✅ Email sent successfully via Resend:', emailData?.id)
      return true
    } catch (error) {
      console.error('Failed to send email via Resend:', error)
      throw error
    }
  } else {
    // Fallback to console logging if Resend is not configured
    console.log('⚠️  Email service not configured. Logging submission:')
    console.log('To: info@consumeriq.ai')
    console.log('Subject: New Contact Form Submission from', data.name)
    console.log('Data:', JSON.stringify(data, null, 2))
    return true
  }
}
