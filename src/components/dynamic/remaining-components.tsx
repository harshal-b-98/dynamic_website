/**
 * Remaining Dynamic Components
 *
 * Additional components using shadcn/ui primitives
 */

import { DynamicComponentProps } from '@/lib/component-loader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Feature Highlight
export function FeatureHighlight({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <CardTitle className="text-2xl">{props.title || content?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {props.description || content?.description}
        </p>
      </CardContent>
    </Card>
  )
}

// Case Study Card
export function CaseStudyCard({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit mb-2">CASE STUDY</Badge>
        <CardTitle>{props.title || content?.title}</CardTitle>
        <CardDescription>{props.description || content?.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="link" className="p-0">Read full case study →</Button>
      </CardContent>
    </Card>
  )
}

// Trust Indicators
export function TrustIndicators({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const indicators = props.indicators || content?.indicators || []

  return (
    <div className="flex flex-wrap justify-center items-center gap-12 py-8">
      {indicators.map((indicator: any, i: number) => (
        <div key={i} className="text-center">
          <div className="text-4xl font-bold text-blue-600">{indicator.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{indicator.label}</div>
        </div>
      ))}
    </div>
  )
}

// Logo Cloud
export function LogoCloud({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const logos = props.logos || content?.logos || []

  return (
    <div className="py-8">
      {props.title && (
        <h3 className="text-center text-muted-foreground mb-8">{props.title}</h3>
      )}
      <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale">
        {logos.map((logo: any, i: number) => (
          <img key={i} src={logo.url || logo} alt={logo.alt || ''} className="h-12" />
        ))}
      </div>
    </div>
  )
}

// Interactive Demo
export function InteractiveDemo({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>{props.title || 'Interactive Demo'}</CardTitle>
        <CardDescription>{props.description || 'Explore our platform'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg">Launch Demo</Button>
      </CardContent>
    </Card>
  )
}

// Chart Display (Placeholder)
export function ChartDisplay({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title || 'Chart'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded flex items-center justify-center">
          <span className="text-muted-foreground">Chart visualization</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Tech Spec Table
export function TechSpecTable({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const specs = props.specs || content?.specs || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title || 'Technical Specifications'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {specs.map((spec: any, i: number) => (
            <div key={i} className="grid grid-cols-2 py-3">
              <div className="font-semibold">{spec.name}</div>
              <div className="text-muted-foreground">{spec.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// API Reference
export function ApiReference({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card className="bg-slate-900 text-slate-100 border-0">
      <CardContent className="p-6 font-mono text-sm">
        <div className="text-green-400 mb-2">
          {props.method || 'GET'} {props.endpoint}
        </div>
        <div className="text-slate-400">{props.description}</div>
      </CardContent>
    </Card>
  )
}

// Code Snippet
export function CodeSnippet({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card className="bg-slate-900 border-0">
      <CardContent className="p-6">
        <pre className="text-slate-100 overflow-x-auto">
          <code>{props.code || content?.code || '// Code snippet'}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

// Breadcrumbs
export function Breadcrumbs({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const items = props.items || content?.items || []

  return (
    <nav className="flex gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item: any, i: number) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          <a href={item.href} className="hover:text-foreground transition-colors">
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  )
}

// Related Content
export function RelatedContent({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const items = props.items || content?.items || []

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Related Content</h3>
      <div className="grid gap-4">
        {items.map((item: any, i: number) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Next Steps
export function NextSteps({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const steps = props.steps || content?.steps || []

  return (
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

// Image Gallery
export function ImageGallery({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const images = props.images || content?.images || []

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image: any, i: number) => (
        <img
          key={i}
          src={image.url || image}
          alt={image.alt || ''}
          className="w-full rounded-lg border border-border"
        />
      ))}
    </div>
  )
}

// Video Embed (Placeholder)
export function VideoEmbed({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
      <div className="text-center text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
        <p>{props.title || 'Video'}</p>
      </div>
    </div>
  )
}

// Alert Banner
export function AlertBanner({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const type = props.type || 'info'

  const variants = {
    info: 'default',
    success: 'default',
    warning: 'destructive',
    error: 'destructive'
  }

  return (
    <Alert variant={variants[type as keyof typeof variants] as any}>
      <AlertDescription>
        {props.title && <div className="font-semibold mb-1">{props.title}</div>}
        {props.message || content?.message}
      </AlertDescription>
    </Alert>
  )
}

// Announcement Card
export function AnnouncementCard({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200">
      <CardHeader>
        <Badge className="w-fit mb-2" variant="secondary">ANNOUNCEMENT</Badge>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{props.message}</p>
        {props.link && (
          <Button variant="link" className="p-0">Learn more →</Button>
        )}
      </CardContent>
    </Card>
  )
}

// Pricing Table
export function PricingTable({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const plans = props.plans || content?.plans || []

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan: any, i: number) => (
        <Card key={i} className={plan.highlighted ? 'border-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">{plan.price}</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature: string, j: number) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
              {plan.cta || 'Get Started'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Pros/Cons List
export function ProsConsList({ spec }: DynamicComponentProps) {
  const { props, content } = spec
  const pros = props.pros || content?.pros || []
  const cons = props.cons || content?.cons || []

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Pros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pros.map((pro: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Cons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {cons.map((con: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
