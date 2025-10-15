import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabaseAdmin
      .from('dyn_contact_submissions')
      .select('*', { count: 'exact' })

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Add pagination and ordering
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: submissions, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch submissions: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      submissions,
      total: count,
      limit,
      offset
    })

  } catch (error) {
    console.error('Fetch submissions error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contact submissions'
      },
      { status: 500 }
    )
  }
}

// Update submission status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing id or status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('dyn_contact_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      throw new Error(`Failed to update submission: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      submission: data
    })

  } catch (error) {
    console.error('Update submission error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update submission status'
      },
      { status: 500 }
    )
  }
}
