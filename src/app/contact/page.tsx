'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FeatherIcon from '@/components/atoms/FeatherIcon'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Form validation schema
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

export default function ContactPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        reset()
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit form. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-white">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: '#0A1930', borderBottom: '1px solid rgba(0, 200, 255, 0.1)' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: '#00C8FF' }}>
                <span className="font-mont font-bold text-xl" style={{ color: '#0A1930' }}>C</span>
              </div>
              <span className="text-2xl font-mont font-bold" style={{ color: '#FFFFFF' }}>ConsumerIQ</span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              <a href="/#features" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Features</a>
              <a href="/#solution" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Solution</a>
              <a href="/#functions" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Functions</a>
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-2.5 rounded-lg font-mont font-semibold transition-all shadow-md"
                style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#0A1930'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; }}>
                Talk to Our Team
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-mont font-bold mb-6" style={{ color: '#0A1930' }}>
            Get in Touch
          </h1>
          <p className="text-xl font-inter max-w-3xl mx-auto" style={{ color: '#333333' }}>
            Ready to transform your data strategy? Our team is here to help you unlock the power of unified market intelligence.
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="max-w-5xl mx-auto mb-8 p-6 rounded-lg border-2" style={{ backgroundColor: 'rgba(0, 168, 120, 0.1)', borderColor: '#00A878' }}>
            <div className="flex items-start gap-4">
              <FeatherIcon name="check-circle" size={24} color="#00A878" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-mont font-bold mb-2" style={{ color: '#00A878' }}>
                  Thank you for reaching out!
                </h3>
                <p className="font-inter" style={{ color: '#333333' }}>
                  We've received your message and will get back to you within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="max-w-5xl mx-auto mb-8 p-6 rounded-lg border-2" style={{ backgroundColor: 'rgba(218, 30, 40, 0.1)', borderColor: '#DA1E28' }}>
            <div className="flex items-start gap-4">
              <FeatherIcon name="alert-circle" size={24} color="#DA1E28" strokeWidth={2} />
              <div>
                <h3 className="text-xl font-mont font-bold mb-2" style={{ color: '#DA1E28' }}>
                  Submission Failed
                </h3>
                <p className="font-inter" style={{ color: '#333333' }}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Left Section - Company Details (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information Card */}
            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '2px solid rgba(0, 200, 255, 0.2)' }}>
              <h2 className="text-2xl font-mont font-bold mb-6" style={{ color: '#0A1930' }}>
                Contact Information
              </h2>

              {/* Email */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                    <FeatherIcon name="mail" size={24} color="#00C8FF" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                      EMAIL
                    </h3>
                    <a href="mailto:info@consumeriq.ai" className="text-lg font-inter transition-colors" style={{ color: '#333333' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#333333'}>
                      info@consumeriq.ai
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                    <FeatherIcon name="phone" size={24} color="#00C8FF" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                      PHONE
                    </h3>
                    <a href="tel:+16096190021" className="text-lg font-inter transition-colors" style={{ color: '#333333' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#333333'}>
                      +1 (609) 619-0021
                    </a>
                  </div>
                </div>
              </div>

              {/* North America Address */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                    <FeatherIcon name="map-pin" size={24} color="#00C8FF" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                      NORTH AMERICA
                    </h3>
                    <p className="text-lg font-inter leading-relaxed" style={{ color: '#333333' }}>
                      3 Lenmore Ct<br />
                      Monroe Township, NJ 08831<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              {/* India Address */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                    <FeatherIcon name="map-pin" size={24} color="#00C8FF" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                      INDIA
                    </h3>
                    <p className="text-lg font-inter leading-relaxed" style={{ color: '#333333' }}>
                      Twenty20 Systems<br />
                      Garuda Bhive, 4th floor<br />
                      Old Madiwala, Kuvempu Nagar<br />
                      BTM 2nd Stage<br />
                      Bengaluru, Karnataka 560068
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#0A1930' }}>
              <h3 className="text-xl font-mont font-bold mb-4" style={{ color: '#00C8FF' }}>
                Why ConsumerIQ?
              </h3>
              <ul className="space-y-3 font-inter" style={{ color: '#FFFFFF' }}>
                <li className="flex items-start gap-3">
                  <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                  <span>Real-time market intelligence for U.S. beverage alcohol</span>
                </li>
                <li className="flex items-start gap-3">
                  <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                  <span>Unified data from distributors, retail, and regulatory sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                  <span>AI-powered analytics and predictive insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                  <span>Purpose-built for suppliers, by industry experts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section - Contact Form (3 columns) */}
          <div className="lg:col-span-3">
            <div className="rounded-xl p-8 shadow-sm h-full flex flex-col" style={{ backgroundColor: '#FFFFFF', border: '2px solid rgba(0, 200, 255, 0.2)' }}>
              <h2 className="text-2xl font-mont font-bold mb-1" style={{ color: '#0A1930' }}>
                Send Us a Message
              </h2>
              <p className="text-base font-inter mb-6" style={{ color: '#666666' }}>
                Fill out the form below and we'll get back to you shortly.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                    Full Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                    style={{
                      borderColor: errors.name ? '#DA1E28' : '#D1D5DB',
                      color: '#333333'
                    }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = '#00C8FF' }}
                    onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = '#D1D5DB' }}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email & Phone Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                      Email Address *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                      style={{
                        borderColor: errors.email ? '#DA1E28' : '#D1D5DB',
                        color: '#333333'
                      }}
                      onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = '#00C8FF' }}
                      onBlur={(e) => { if (!errors.email) e.currentTarget.style.borderColor = '#D1D5DB' }}
                      placeholder="john@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                      Phone Number *
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                      style={{
                        borderColor: errors.phone ? '#DA1E28' : '#D1D5DB',
                        color: '#333333'
                      }}
                      onFocus={(e) => { if (!errors.phone) e.currentTarget.style.borderColor = '#00C8FF' }}
                      onBlur={(e) => { if (!errors.phone) e.currentTarget.style.borderColor = '#D1D5DB' }}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company & Role Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                      Company Name *
                    </label>
                    <input
                      {...register('company')}
                      type="text"
                      id="company"
                      className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                      style={{
                        borderColor: errors.company ? '#DA1E28' : '#D1D5DB',
                        color: '#333333'
                      }}
                      onFocus={(e) => { if (!errors.company) e.currentTarget.style.borderColor = '#00C8FF' }}
                      onBlur={(e) => { if (!errors.company) e.currentTarget.style.borderColor = '#D1D5DB' }}
                      placeholder="Your Company"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                      Your Role *
                    </label>
                    <select
                      {...register('role')}
                      id="role"
                      className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                      style={{
                        borderColor: errors.role ? '#DA1E28' : '#D1D5DB',
                        color: '#333333'
                      }}
                      onFocus={(e) => { if (!errors.role) e.currentTarget.style.borderColor = '#00C8FF' }}
                      onBlur={(e) => { if (!errors.role) e.currentTarget.style.borderColor = '#D1D5DB' }}
                    >
                      <option value="">Select your role</option>
                      <option value="C-Suite / Executive">C-Suite / Executive</option>
                      <option value="VP / Director">VP / Director</option>
                      <option value="Manager">Manager</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Analytics / IT">Analytics / IT</option>
                      <option value="Product / Innovation">Product / Innovation</option>
                      <option value="Operations">Operations</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                    Reason for Reaching Out *
                  </label>
                  <select
                    {...register('reason')}
                    id="reason"
                    className="w-full px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none"
                    style={{
                      borderColor: errors.reason ? '#DA1E28' : '#D1D5DB',
                      color: '#333333'
                    }}
                    onFocus={(e) => { if (!errors.reason) e.currentTarget.style.borderColor = '#00C8FF' }}
                    onBlur={(e) => { if (!errors.reason) e.currentTarget.style.borderColor = '#D1D5DB' }}
                  >
                    <option value="">Select a reason</option>
                    <option value="Schedule a Demo">Schedule a Demo</option>
                    <option value="Request Pricing">Request Pricing</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Partnership Inquiry">Partnership Inquiry</option>
                    <option value="Data Integration">Data Integration</option>
                    <option value="General Question">General Question</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.reason && (
                    <p className="mt-1 text-sm font-inter" style={{ color: '#DA1E28' }}>
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="flex-1 flex flex-col">
                  <label htmlFor="message" className="block text-sm font-mont font-semibold mb-1" style={{ color: '#0A1930' }}>
                    Message (Optional)
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    className="w-full flex-1 px-4 py-2.5 rounded-lg border-2 font-inter transition-colors focus:outline-none resize-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: '#333333'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    placeholder="Tell us more about what you're looking for..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-3 rounded-lg font-mont font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                  style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                  onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.backgroundColor = '#0A1930'; e.currentTarget.style.color = '#00C8FF'; e.currentTarget.style.outline = '2px solid #00C8FF'; } }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; e.currentTarget.style.outline = 'none'; }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0A1930' }} className="pt-16 pb-8 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-electric-cyan rounded flex items-center justify-center">
                  <span className="text-deep-indigo font-mont font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-mont font-bold" style={{ color: '#FFFFFF' }}>ConsumerIQ</span>
              </div>
              <p className="font-inter mb-6" style={{ color: '#EBEFF2' }}>
                Real-time market intelligence for U.S. beverage alcohol suppliers. Transform data chaos into commercial advantage.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                   style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00C8FF'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 200, 255, 0.1)'}>
                  <FeatherIcon name="linkedin" size={20} color="#FFFFFF" strokeWidth={2} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                   style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00C8FF'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 200, 255, 0.1)'}>
                  <FeatherIcon name="twitter" size={20} color="#FFFFFF" strokeWidth={2} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                   style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}
                   onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#00C8FF'}
                   onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 200, 255, 0.1)'}>
                  <FeatherIcon name="facebook" size={20} color="#FFFFFF" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-lg font-mont font-bold mb-6" style={{ color: '#00C8FF' }}>Products</h4>
              <ul className="space-y-3 font-inter">
                <li><a href="/#features" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Features</a></li>
                <li><a href="/#solution" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Platform</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Integrations</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Pricing</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>API Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-mont font-bold mb-6" style={{ color: '#00C8FF' }}>Company</h4>
              <ul className="space-y-3 font-inter">
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>About Us</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Press</a></li>
                <li><a href="/contact" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Contact</a></li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg font-mont font-bold mb-6" style={{ color: '#00C8FF' }}>Stay Updated</h4>
              <p className="font-inter mb-4" style={{ color: '#EBEFF2' }}>Get the latest insights and product updates delivered to your inbox.</p>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 rounded-lg font-inter text-white bg-transparent border-2 focus:outline-none focus:border-electric-cyan transition-colors"
                    style={{ borderColor: 'rgba(0, 200, 255, 0.3)' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg font-mont font-semibold transition-all duration-300"
                  style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; }}>
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t pt-8" style={{ borderColor: 'rgba(0, 200, 255, 0.2)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-inter text-sm" style={{ color: '#EBEFF2' }}>
                &copy; 2025 ConsumerIQ. All rights reserved.
              </p>
              <div className="flex gap-6 font-inter text-sm">
                <a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Privacy Policy</a>
                <a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Terms of Service</a>
                <a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
