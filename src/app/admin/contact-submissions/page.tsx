'use client'

import { useState, useEffect } from 'react'
import FeatherIcon from '@/components/atoms/FeatherIcon'

interface Submission {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  reason: string
  message?: string
  submitted_at: string
  status: 'new' | 'in_progress' | 'contacted' | 'closed'
  metadata: Record<string, any>
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchSubmissions()
  }, [statusFilter])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/contact/submissions?status=${statusFilter}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setSubmissions(data.submissions)
        setTotalCount(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/contact/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (response.ok) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#00C8FF'
      case 'in_progress': return '#AA6C39'
      case 'contacted': return '#00A878'
      case 'closed': return '#666666'
      default: return '#333333'
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EBEFF2' }}>
      {/* Header */}
      <div className="py-8" style={{ backgroundColor: '#0A1930' }}>
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-mont font-bold" style={{ color: '#FFFFFF' }}>
            Contact Form Submissions
          </h1>
          <p className="mt-2 font-inter" style={{ color: '#EBEFF2' }}>
            Manage and track all contact form submissions
          </p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setStatusFilter('all')}
            className="px-6 py-3 rounded-lg font-mont font-semibold transition-all"
            style={{
              backgroundColor: statusFilter === 'all' ? '#00C8FF' : '#FFFFFF',
              color: statusFilter === 'all' ? '#0A1930' : '#333333'
            }}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('new')}
            className="px-6 py-3 rounded-lg font-mont font-semibold transition-all"
            style={{
              backgroundColor: statusFilter === 'new' ? '#00C8FF' : '#FFFFFF',
              color: statusFilter === 'new' ? '#0A1930' : '#333333'
            }}
          >
            New
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className="px-6 py-3 rounded-lg font-mont font-semibold transition-all"
            style={{
              backgroundColor: statusFilter === 'in_progress' ? '#00C8FF' : '#FFFFFF',
              color: statusFilter === 'in_progress' ? '#0A1930' : '#333333'
            }}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('contacted')}
            className="px-6 py-3 rounded-lg font-mont font-semibold transition-all"
            style={{
              backgroundColor: statusFilter === 'contacted' ? '#00C8FF' : '#FFFFFF',
              color: statusFilter === 'contacted' ? '#0A1930' : '#333333'
            }}
          >
            Contacted
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className="px-6 py-3 rounded-lg font-mont font-semibold transition-all"
            style={{
              backgroundColor: statusFilter === 'closed' ? '#00C8FF' : '#FFFFFF',
              color: statusFilter === 'closed' ? '#0A1930' : '#333333'
            }}
          >
            Closed
          </button>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl font-inter" style={{ color: '#333333' }}>Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-inter" style={{ color: '#333333' }}>No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl p-6 shadow-sm border-2"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-mont font-bold mb-2" style={{ color: '#0A1930' }}>
                          {submission.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm font-inter" style={{ color: '#666666' }}>
                          <span className="flex items-center gap-2">
                            <FeatherIcon name="mail" size={16} color="#00C8FF" />
                            {submission.email}
                          </span>
                          <span className="flex items-center gap-2">
                            <FeatherIcon name="phone" size={16} color="#00C8FF" />
                            {submission.phone}
                          </span>
                          <span className="flex items-center gap-2">
                            <FeatherIcon name="briefcase" size={16} color="#00C8FF" />
                            {submission.company}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                          Role:
                        </p>
                        <p className="font-inter" style={{ color: '#333333' }}>{submission.role}</p>
                      </div>
                      <div>
                        <p className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                          Reason:
                        </p>
                        <p className="font-inter" style={{ color: '#333333' }}>{submission.reason}</p>
                      </div>
                    </div>

                    {submission.message && (
                      <div className="mb-4">
                        <p className="text-sm font-mont font-semibold mb-1" style={{ color: '#00C8FF' }}>
                          Message:
                        </p>
                        <p className="font-inter" style={{ color: '#333333' }}>{submission.message}</p>
                      </div>
                    )}

                    <div className="text-sm font-inter" style={{ color: '#666666' }}>
                      Submitted: {formatDate(submission.submitted_at)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <div
                      className="px-4 py-2 rounded-lg text-center font-mont font-semibold"
                      style={{
                        backgroundColor: `${getStatusColor(submission.status)}20`,
                        color: getStatusColor(submission.status)
                      }}
                    >
                      {submission.status.replace('_', ' ').toUpperCase()}
                    </div>

                    <select
                      value={submission.status}
                      onChange={(e) => updateStatus(submission.id, e.target.value)}
                      className="px-4 py-2 rounded-lg border-2 font-inter transition-all"
                      style={{
                        borderColor: '#D1D5DB',
                        color: '#333333'
                      }}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
