/**
 * Component Registry API
 *
 * GET /api/components/registry - Query component registry
 * Supports filtering, searching, and pagination
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  queryComponents,
  getComponentById,
  getComponentsByCategory,
  getAllCategories,
  getAllTags,
  getComponentCount,
  getComponentCountsByCategory
} from '@/lib/component-registry/query'
import { buildComponentContext, buildComponentDetailContext } from '@/lib/component-registry/llm-context'
import { validateComponentQuery } from '@/lib/component-registry/schema'

/**
 * GET /api/components/registry
 *
 * Query components with filters
 *
 * Query Parameters:
 * - id: Get specific component by ID
 * - category: Filter by category
 * - tags: Comma-separated tags to filter by
 * - keywords: Comma-separated keywords to search
 * - intent: User intent for filtering
 * - search: Full-text search term
 * - limit: Max results (default: 25, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sortBy: Sort field (priority, name, category, id)
 * - sortOrder: Sort order (asc, desc)
 * - format: Response format (json, llm-context)
 * - stats: Return statistics only (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Handle statistics request
    if (searchParams.get('stats') === 'true') {
      return NextResponse.json({
        total: getComponentCount(),
        byCategory: getComponentCountsByCategory(),
        categories: getAllCategories(),
        tags: getAllTags()
      })
    }

    // Handle single component request
    const id = searchParams.get('id')
    if (id) {
      const component = getComponentById(id)

      if (!component) {
        return NextResponse.json(
          { error: `Component not found: ${id}` },
          { status: 404 }
        )
      }

      // Check if LLM context format requested
      const format = searchParams.get('format')
      if (format === 'llm-context') {
        return NextResponse.json({
          component,
          context: buildComponentDetailContext(id)
        })
      }

      return NextResponse.json({ component })
    }

    // Handle category list request
    if (searchParams.get('categories') === 'true') {
      const categories = getAllCategories()
      return NextResponse.json({
        categories,
        count: categories.length
      })
    }

    // Handle tags list request
    if (searchParams.get('tags-list') === 'true') {
      const tags = getAllTags()
      return NextResponse.json({
        tags,
        count: tags.length
      })
    }

    // Handle category-specific request
    const category = searchParams.get('category')
    if (category && !searchParams.get('search') && !searchParams.get('intent')) {
      const components = getComponentsByCategory(category)
      return NextResponse.json({
        category,
        components,
        count: components.length
      })
    }

    // Build query object
    const queryObj: any = {}

    if (searchParams.get('intent')) {
      queryObj.intent = searchParams.get('intent')
    }

    if (searchParams.get('keywords')) {
      queryObj.keywords = searchParams.get('keywords')!.split(',').map(k => k.trim())
    }

    if (category) {
      queryObj.category = category
    }

    if (searchParams.get('tags')) {
      queryObj.tags = searchParams.get('tags')!.split(',').map(t => t.trim())
    }

    if (searchParams.get('search')) {
      queryObj.search = searchParams.get('search')
    }

    if (searchParams.get('limit')) {
      queryObj.limit = Math.min(parseInt(searchParams.get('limit')!), 100)
    }

    if (searchParams.get('offset')) {
      queryObj.offset = parseInt(searchParams.get('offset')!)
    }

    if (searchParams.get('sortBy')) {
      queryObj.sortBy = searchParams.get('sortBy')
    }

    if (searchParams.get('sortOrder')) {
      queryObj.sortOrder = searchParams.get('sortOrder')
    }

    // Validate query
    const validatedQuery = validateComponentQuery(queryObj)

    // Execute query
    const result = queryComponents(validatedQuery)

    // Check if LLM context format requested
    const format = searchParams.get('format')
    if (format === 'llm-context') {
      const contextOptions = {
        intent: validatedQuery.intent,
        maxComponents: validatedQuery.limit,
        includeExamples: searchParams.get('includeExamples') !== 'false',
        includeProps: searchParams.get('includeProps') !== 'false',
        format: 'markdown' as const
      }

      return NextResponse.json({
        ...result,
        context: buildComponentContext(contextOptions)
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Component registry API error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/components/registry
 *
 * Query components with complex filters (body-based)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate query
    const validatedQuery = validateComponentQuery(body)

    // Execute query
    const result = queryComponents(validatedQuery)

    // Check if LLM context format requested
    if (body.format === 'llm-context') {
      const contextOptions = {
        intent: validatedQuery.intent,
        maxComponents: validatedQuery.limit,
        includeExamples: body.includeExamples !== false,
        includeProps: body.includeProps !== false,
        format: body.outputFormat || 'markdown'
      }

      return NextResponse.json({
        ...result,
        context: buildComponentContext(contextOptions)
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Component registry API error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
