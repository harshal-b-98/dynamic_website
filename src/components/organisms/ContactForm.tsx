'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import FeatherIcon from '@/components/atoms/FeatherIcon'

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(1, 'Please select your role'),
  reason: z.string().min(1, 'Please select a reason'),
  message: z.string().optional()
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface ContactFormProps {
  onClose: () => void
}

export default function ContactForm({ onClose }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitStatus('success')
      reset()

      // Close form after 2 seconds on success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg transition-all hover:bg-gray-100"
          style={{ color: '#0A1930' }}
          aria-label="Close contact form"
        >
          <FeatherIcon name="x" size={24} />
        </button>

        {/* Header */}
        <div
          className="px-8 py-8 rounded-t-2xl"
          style={{ backgroundColor: '#0A1930' }}
        >
          <h2 className="text-3xl font-mont font-bold mb-3" style={{ color: '#FFFFFF' }}>
            Get Started with Real-Time Beverage Analytics
          </h2>
          <p className="text-lg font-inter" style={{ color: '#EBEFF2' }}>
            Ready to see how ConsumerIQ transforms your supplier analytics? Connect with our team today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Full Name <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.name ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.name ? '#DA1E28' : '#EBEFF2'}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Email Address <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.email ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#DA1E28' : '#EBEFF2'}
                placeholder="john.doe@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Phone Number <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.phone ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.phone ? '#DA1E28' : '#EBEFF2'}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Company Field */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Company Name <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <input
                id="company"
                type="text"
                {...register('company')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.company ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.company ? '#DA1E28' : '#EBEFF2'}
                placeholder="Acme Corporation"
              />
              {errors.company && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.company.message}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Your Role <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <select
                id="role"
                {...register('role')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.role ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.role ? '#DA1E28' : '#EBEFF2'}
              >
                <option value="">Select your role</option>
                <option value="C-Level Executive">C-Level Executive</option>
                <option value="VP/Director">VP/Director</option>
                <option value="Manager">Manager</option>
                <option value="Analyst">Analyst</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Other">Other</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Reason Field */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Reason for Reaching Out <span style={{ color: '#DA1E28' }}>*</span>
              </label>
              <select
                id="reason"
                {...register('reason')}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none"
                style={{
                  borderColor: errors.reason ? '#DA1E28' : '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = errors.reason ? '#DA1E28' : '#EBEFF2'}
              >
                <option value="">Select a reason</option>
                <option value="Request Demo">Request a Demo</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="Pricing Information">Pricing Information</option>
                <option value="Partnership Opportunity">Partnership Opportunity</option>
                <option value="Technical Support">Technical Support</option>
                <option value="General Question">General Question</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && (
                <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                  {errors.reason.message}
                </p>
              )}
            </div>

            {/* Message Field (Optional) */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-inter font-semibold mb-2"
                style={{ color: '#333333' }}
              >
                Additional Message <span className="text-sm font-normal" style={{ color: '#666666' }}>(Optional)</span>
              </label>
              <textarea
                id="message"
                {...register('message')}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 font-inter transition-all focus:outline-none resize-none"
                style={{
                  borderColor: '#EBEFF2',
                  color: '#333333'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#EBEFF2'}
                placeholder="Tell us more about your needs..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 rounded-lg font-mont font-semibold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isSubmitting ? '#666666' : '#00C8FF',
                color: '#0A1930'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#0A1930'
                  e.currentTarget.style.color = '#00C8FF'
                  e.currentTarget.style.outline = '2px solid #00C8FF'
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#00C8FF'
                  e.currentTarget.style.color = '#0A1930'
                  e.currentTarget.style.outline = 'none'
                }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'rgba(0, 168, 120, 0.1)', borderLeft: '4px solid #00A878' }}
              >
                <FeatherIcon name="check-circle" size={24} color="#00A878" />
                <p className="font-inter" style={{ color: '#00A878' }}>
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ backgroundColor: 'rgba(218, 30, 40, 0.1)', borderLeft: '4px solid #DA1E28' }}
              >
                <FeatherIcon name="alert-circle" size={24} color="#DA1E28" />
                <p className="font-inter" style={{ color: '#DA1E28' }}>
                  Sorry, something went wrong. Please try again or email us at info@consumeriq.ai
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Footer Contact Info */}
        <div
          className="px-8 py-6 rounded-b-2xl border-t-2"
          style={{ backgroundColor: '#EBEFF2', borderColor: '#D1D5DB' }}
        >
          <div className="flex flex-wrap gap-6 text-sm font-inter" style={{ color: '#333333' }}>
            <div className="flex items-center gap-2">
              <FeatherIcon name="mail" size={16} color="#00C8FF" />
              <span>info@consumeriq.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <FeatherIcon name="phone" size={16} color="#00C8FF" />
              <span>+1 609-619-0021</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
