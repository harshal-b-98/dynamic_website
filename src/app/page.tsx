'use client'

import { useState, useRef } from 'react'
import ImprovedChatWidget from '@/components/organisms/ImprovedChatWidget'
import { DynamicPageRenderer } from '@/components/organisms/DynamicPageRenderer'
import ThinkingOverlay from '@/components/organisms/ThinkingOverlay'
import FeatherIcon from '@/components/atoms/FeatherIcon'
import { PageSpecification } from '@/lib/page-generation'
import { ThinkingStage, DEFAULT_THINKING_STAGES } from '@/lib/thinking-process'
import { NavigationStack, createNavigationStack, pushPage, goBack, canGoBack, getCurrentPage } from '@/lib/navigation-stack'
import { InteractionHandlerProps, createInteractionContext } from '@/lib/interaction-types'
import { generatePageFromInteraction } from '@/lib/interaction-service'

export default function Home() {
  const [currentPageSpec, setCurrentPageSpec] = useState<PageSpecification | null>(null)
  const [navigationStack, setNavigationStack] = useState<NavigationStack>(createNavigationStack(5))
  const [isThinking, setIsThinking] = useState(false)
  const [stages, setStages] = useState<ThinkingStage[]>(
    DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const }))
  )
  const [conversationId] = useState<string>(() => `conv-${Date.now()}`)
  const [sessionId] = useState<string>(() => `session-${Date.now()}`)
  const chatWidgetRef = useRef<{ minimizeToBar: () => void }>(null)

  // Handler for when thinking starts
  const handleThinkingStart = () => {
    // Reset stages to pending
    setStages(DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const })))
    setIsThinking(true)
  }

  // Handler for stage updates from the chat stream
  const handleStageUpdate = (updatedStages: ThinkingStage[]) => {
    setStages(updatedStages)
  }

  // Handler for when a page is generated from chat
  const handlePageGenerated = (pageSpec: PageSpecification) => {
    // Add to navigation stack
    setNavigationStack(prev => pushPage(prev, pageSpec))
    setCurrentPageSpec(pageSpec)
    setIsThinking(false)
    // Minimize chat back to bar mode after page is generated
    chatWidgetRef.current?.minimizeToBar()
  }

  // Handler for interactions on generated pages
  const handleInteraction = async (interactionProps: InteractionHandlerProps) => {
    if (!currentPageSpec) return

    // Create interaction context with full page context
    const componentSpec = {
      id: 'unknown',
      componentType: 'unknown',
      order: 0,
      props: {},
      content: {}
    }

    const interaction = createInteractionContext(
      interactionProps,
      componentSpec,
      currentPageSpec,
      sessionId,
      conversationId
    )

    // Generate new page from interaction
    handleThinkingStart()

    const result = await generatePageFromInteraction({
      interaction,
      navigationStack,
      conversationId,
      sessionId,
      onThinkingStart: handleThinkingStart,
      onStageUpdate: handleStageUpdate,
    })

    setIsThinking(false)

    if (result.success && result.pageSpec) {
      // Add to navigation stack
      setNavigationStack(prev => pushPage(prev, result.pageSpec!, interaction))
      setCurrentPageSpec(result.pageSpec)
      // Minimize chat
      chatWidgetRef.current?.minimizeToBar()
    } else {
      console.error('Failed to generate page from interaction:', result.error)
      // TODO: Show error toast
    }
  }

  // Handler to navigate back
  const handleBack = () => {
    if (canGoBack(navigationStack)) {
      const newStack = goBack(navigationStack)
      if (newStack) {
        setNavigationStack(newStack)
        const prevPage = getCurrentPage(newStack)
        setCurrentPageSpec(prevPage)
      }
    } else {
      // No more history, go back to landing
      setCurrentPageSpec(null)
    }
  }

  // Handler to return to landing page
  const handleBackToLanding = () => {
    setCurrentPageSpec(null)
    // Optionally clear navigation stack
    setNavigationStack(createNavigationStack(5))
  }

  // Handler to cancel thinking
  const handleCancelThinking = () => {
    setIsThinking(false)
  }

  return (
    <div className="min-h-screen bg-surface-white">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: '#0A1930', borderBottom: '1px solid rgba(0, 200, 255, 0.1)' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: '#00C8FF' }}>
                <span className="font-mont font-bold text-xl" style={{ color: '#0A1930' }}>C</span>
              </div>
              <span className="text-2xl font-mont font-bold" style={{ color: '#FFFFFF' }}>ConsumerIQ</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Features</a>
              <a href="#solution" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Solution</a>
              <a href="#functions" className="font-inter transition-colors" style={{ color: '#FFFFFF' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#00C8FF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>Functions</a>
              <a href="#contact">
                <button className="px-6 py-2.5 rounded-lg font-mont font-semibold transition-all shadow-md"
                  style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#0A1930'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; }}>
                  Talk to Our Team
                </button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Dynamic Page Content OR Landing Page */}
      {currentPageSpec ? (
        /* AI-Generated Dynamic Page */
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Back Navigation */}
              <div className="mb-8 flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-[var(--charcoal-gray)] hover:text-[var(--electric-cyan)] transition-all duration-300 font-inter font-medium group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>{canGoBack(navigationStack) ? 'Back' : 'Back to Home'}</span>
                </button>

                {canGoBack(navigationStack) && (
                  <button
                    onClick={handleBackToLanding}
                    className="text-sm text-[var(--charcoal-gray)] hover:text-[var(--electric-cyan)] transition-colors font-inter"
                  >
                    Return to Home
                  </button>
                )}
              </div>

              {/* Render Dynamic Page */}
              <div className="dynamic-page-content">
                <DynamicPageRenderer
                  pageSpec={currentPageSpec}
                  onInteraction={handleInteraction}
                  onComponentError={(componentType, error) => {
                    console.error(`Component error: ${componentType}`, error)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Landing Page Content */
        <>
          {/* Hero Section - Brand Guidelines: Deep Indigo → Black gradient */}
          <section style={{ background: 'linear-gradient(to bottom, #0A1930, #000000)' }} className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-mont font-extrabold mb-6 leading-tight" style={{ color: '#FFFFFF' }}>
              Stop Guessing. Start Winning.
            </h1>
            <p className="text-xl md:text-2xl mb-10 leading-relaxed font-inter max-w-4xl mx-auto" style={{ color: '#EBEFF2' }}>
              Spot opportunities early. Prove promotional impact. Outmaneuver competitors. ConsumerIQ gives U.S. beverage alcohol suppliers real-time market intelligence—without the data chaos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#solution">
                <button className="px-8 py-4 rounded-lg font-mont font-semibold text-lg transition-all shadow-lg"
                  style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0A1930'; e.currentTarget.style.color = '#00C8FF'; e.currentTarget.style.outline = '2px solid #00C8FF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; e.currentTarget.style.outline = 'none'; }}>
                  Explore Solutions
                </button>
              </a>
              <a href="#features">
                <button className="px-8 py-4 bg-transparent rounded-lg border-2 font-mont font-semibold text-lg transition-all"
                  style={{ color: '#FFFFFF', borderColor: '#00C8FF' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}>
                  See How It Works
                </button>
              </a>
              <a href="#contact">
                <button className="px-8 py-4 rounded-lg border-2 font-mont font-semibold text-lg transition-all"
                  style={{ backgroundColor: '#0A1930', color: '#00C8FF', borderColor: '#00C8FF' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#00C8FF'; e.currentTarget.style.color = '#0A1930'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0A1930'; e.currentTarget.style.color = '#00C8FF'; }}>
                  Talk to Our Team
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Brand Guidelines: Light Data Gray background */}
      <section className="py-20" style={{ backgroundColor: '#EBEFF2' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold mb-4" style={{ color: '#0A1930' }}>
              The Real Cost of Fragmented Data
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(170, 108, 57, 0.1)' }}>
                <FeatherIcon name="clock" size={32} color="#AA6C39" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-mont font-bold mb-4" style={{ color: '#0A1930' }}>Delayed, Conflicting Reports</h3>
              <p className="font-inter leading-relaxed" style={{ color: '#333333' }}>
                Distributor data arrives on the 15th. Retail scans on the 20th. By the time you reconcile them, the market has moved and opportunities are gone.
              </p>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(218, 30, 40, 0.1)' }}>
                <FeatherIcon name="zap-off" size={32} color="#DA1E28" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-mont font-bold mb-4" style={{ color: '#0A1930' }}>Reactive Innovation</h3>
              <p className="font-inter leading-relaxed" style={{ color: '#333333' }}>
                Traditional research takes months. Your COLA approval process feels like a black box. Every delay costs a seasonal window while <span className="font-semibold" style={{ color: '#DA1E28' }}>competitors capture whitespace first</span>.
              </p>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(170, 108, 57, 0.1)' }}>
                <FeatherIcon name="alert-triangle" size={32} color="#AA6C39" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-mont font-bold mb-4" style={{ color: '#0A1930' }}>The IT Bottleneck</h3>
              <p className="font-inter leading-relaxed" style={{ color: '#333333' }}>
                Analytics teams spend 70% of their time cleaning data instead of generating insights. Sales and marketing make gut-feel decisions because they can't trust the numbers—or wait weeks for answers.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center max-w-4xl mx-auto">
            <p className="text-lg font-inter" style={{ color: '#333333' }}>
              Industry research shows <span className="font-bold text-xl" style={{ color: '#AA6C39' }}>bad data costs beverage suppliers 15-25% in lost revenue annually</span>. That's missed market share, wasted trade spend, and strategic opportunities handed to faster-moving competitors.
            </p>
          </div>
        </div>
      </section>

      {/* Product Features Section - Brand Guidelines: Deep Indigo background, Electric Cyan accents */}
      <section id="features" className="py-20" style={{ backgroundColor: '#0A1930' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold mb-4" style={{ color: '#FFFFFF' }}>
              Intelligence Built for How Your Team Actually Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Natural Language Analytics */}
            <div className="rounded-xl p-8 border-2 transition-all" style={{ backgroundColor: '#0A1930', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                <FeatherIcon name="message-circle" size={32} color="#00C8FF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#00C8FF' }}>Natural Language Analytics</h3>
              <p className="font-inter mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Ask questions in plain English. Get instant answers. "Which distributors are underperforming in the Southeast?" "Show me RTD launches in the last 60 days." No SQL. No waiting for IT. No conflicting spreadsheets.
              </p>
              <p className="font-inter font-semibold" style={{ color: '#00C8FF' }}>
                Value: Transform weeks of data wrangling into seconds of insight generation.
              </p>
            </div>

            {/* Predictive Intelligence */}
            <div className="rounded-xl p-8 border-2 transition-all" style={{ backgroundColor: '#0A1930', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                <FeatherIcon name="trending-up" size={32} color="#00C8FF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#00C8FF' }}>Predictive Intelligence</h3>
              <p className="font-inter mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Our AI doesn't just report what happened—it forecasts what's coming. Predict COLA approval timelines before submission. Identify emerging category opportunities before competitors move. Flag distributor performance risks before they impact your numbers.
              </p>
              <p className="font-inter font-semibold" style={{ color: '#00C8FF' }}>
                Value: Make proactive decisions with confidence, not reactive pivots in crisis mode.
              </p>
            </div>

            {/* Unified Performance Dashboards */}
            <div className="rounded-xl p-8 border-2 transition-all" style={{ backgroundColor: '#0A1930', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                <FeatherIcon name="bar-chart-2" size={32} color="#00C8FF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#00C8FF' }}>Unified Performance Dashboards</h3>
              <p className="font-inter mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Sales tracks distributor health and territory performance. Marketing measures campaign lift and promo ROI. IT monitors data quality and feed latency. Everyone sees the same numbers, updated in near real-time.
              </p>
              <p className="font-inter font-semibold" style={{ color: '#00C8FF' }}>
                Value: Eliminate the "which report is right?" debates and accelerate decision velocity.
              </p>
            </div>

            {/* Competitive Launch Tracking */}
            <div className="rounded-xl p-8 border-2 transition-all" style={{ backgroundColor: '#0A1930', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                <FeatherIcon name="target" size={32} color="#00C8FF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#00C8FF' }}>Competitive Launch Tracking</h3>
              <p className="font-inter mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Monitor TTB filings, social signals, and menu additions to detect competitor innovations early. Analyze category trends and identify whitespace opportunities while they're still open.
              </p>
              <p className="font-inter font-semibold" style={{ color: '#00C8FF' }}>
                Value: Launch smarter, faster, and into less crowded spaces.
              </p>
            </div>

            {/* Automated Compliance Monitoring */}
            <div className="rounded-xl p-8 border-2 transition-all" style={{ backgroundColor: '#0A1930', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#00C8FF'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'}>
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                <FeatherIcon name="shield" size={32} color="#00C8FF" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#00C8FF' }}>Automated Compliance Monitoring</h3>
              <p className="font-inter mb-4 leading-relaxed" style={{ color: '#FFFFFF' }}>
                AI-powered label review flags potential compliance issues before submission. Track approval timelines, benchmark against historical patterns, and receive alerts when filings move through the process.
              </p>
              <p className="font-inter font-semibold" style={{ color: '#00C8FF' }}>
                Value: Reduce time-to-market and eliminate costly resubmissions.
              </p>
            </div>

            {/* CTA Card */}
            <div className="rounded-xl p-8 border-2 transition-all duration-300 flex flex-col justify-between"
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 200, 255, 0.3)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#00C8FF';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 200, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div>
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                  <FeatherIcon name="arrow-right" size={32} color="#00C8FF" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-mont font-bold mb-3" style={{ color: '#0A1930' }}>Ready to Transform Your Data Strategy?</h3>
                <p className="font-inter mb-6 leading-relaxed" style={{ color: '#333333' }}>
                  See how ConsumerIQ can help your team make faster, smarter decisions with unified market intelligence built specifically for beverage alcohol suppliers.
                </p>
              </div>
              <a href="#contact" className="inline-block">
                <button className="w-full px-6 py-4 rounded-lg font-mont font-semibold text-lg transition-all duration-300"
                  style={{ backgroundColor: '#00C8FF', color: '#0A1930' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#0A1930';
                    e.currentTarget.style.color = '#00C8FF';
                    e.currentTarget.style.outline = '2px solid #00C8FF';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#00C8FF';
                    e.currentTarget.style.color = '#0A1930';
                    e.currentTarget.style.outline = 'none';
                  }}>
                  Talk to Our Team
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Architecture Section */}
      <section id="solution" className="py-20 bg-surface-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-deep-indigo mb-6">
              One Platform. One Source of Truth. Zero Guesswork.
            </h2>
            <p className="text-xl text-charcoal-gray font-inter leading-relaxed">
              ConsumerIQ eliminates data fragmentation by creating a single, mastered data spine specifically designed for beverage alcohol suppliers.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-8 border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(0, 200, 255, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00C8FF'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                  <FeatherIcon name="file-text" size={32} color="#00C8FF" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4">
                  Regulatory Intelligence
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  TTB COLA filings, state licensing data, competitive label tracking
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(0, 200, 255, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00C8FF'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                  <FeatherIcon name="activity" size={32} color="#00C8FF" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4">
                  Commercial Performance
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  Distributor depletions from VIP and Encompass, retail scan and POS data
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 border-2 transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'rgba(0, 200, 255, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00C8FF'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 200, 255, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)' }}>
                  <FeatherIcon name="radio" size={32} color="#00C8FF" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4">
                  Market Signals
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  On-premise menu data, social sentiment, industry publications, geographic mapping
                </p>
              </div>
            </div>

            <div className="bg-deep-indigo rounded-2xl p-10 text-center">
              <p className="text-2xl text-surface-white font-inter leading-relaxed">
                The result? <span className="text-electric-cyan font-mont font-bold">Role-specific intelligence delivered in real-time through AI-powered analytics</span>—so every team operates from the same reliable foundation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Functions We Serve Section */}
      <section id="functions" className="py-20" style={{ backgroundColor: '#EBEFF2' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-deep-indigo mb-4">
              Precision-Built Intelligence for Every Commercial Function
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Sales & Commercial Teams */}
            <div className="rounded-2xl p-10 shadow-sm transition-all duration-300 hover:shadow-2xl" style={{ backgroundColor: '#0A1930' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 200, 255, 0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
              <h3 className="text-3xl font-mont font-bold mb-6" style={{ color: '#FFFFFF' }}>For Sales & Commercial Teams</h3>
              <p className="text-lg font-inter mb-6 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Distributors control your retail access. You need objective proof that promotions drive sales. Your team needs to know which accounts to prioritize and which territories are underperforming—before the quarterly review reveals the damage.
              </p>

              <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#0A1930' }}>
                <h4 className="text-xl font-mont font-semibold mb-4" style={{ color: '#00C8FF' }}>What You Get:</h4>
                <ul className="space-y-3 font-inter" style={{ color: '#FFFFFF' }}>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Real-time distributor performance dashboards with health scoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Territory analytics linking promotional activity to sales velocity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Chain distribution tracking across every SKU and account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Pricing compliance monitoring to protect brand positioning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Competitive positioning analysis and market share tracking</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold" style={{ color: '#FFFFFF' }}>
                The Outcome? <span style={{ color: '#00C8FF' }}>Hold distributors accountable with data. Optimize trade spend based on measurable ROI. Hit revenue targets by focusing resources where they matter most.</span>
              </p>
            </div>

            {/* Marketing & Innovation Teams */}
            <div className="rounded-2xl p-10 shadow-sm transition-all duration-300 hover:shadow-2xl" style={{ backgroundColor: '#0A1930' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 200, 255, 0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
              <h3 className="text-3xl font-mont font-bold mb-6" style={{ color: '#FFFFFF' }}>For Marketing & Innovation Teams</h3>
              <p className="text-lg font-inter mb-6 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Campaigns need to perform. New products need to launch on time. You're expected to spot trends early, measure promo effectiveness, and find whitespace opportunities—all while traditional research takes months and COLA approvals feel like black boxes.
              </p>

              <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#0A1930' }}>
                <h4 className="text-xl font-mont font-semibold mb-4" style={{ color: '#00C8FF' }}>What You Get:</h4>
                <ul className="space-y-3 font-inter" style={{ color: '#FFFFFF' }}>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>AI-powered COLA timeline predictions and compliance risk assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Competitive launch intelligence from regulatory filings and market signals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Campaign lift measurement tied to promotional activity and sales data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Social sentiment tracking correlated with purchase behavior</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Category trend analysis combining retail, on-premise, and regulatory data</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold" style={{ color: '#FFFFFF' }}>
                The Outcome? <span style={{ color: '#00C8FF' }}>Launch products faster with fewer regulatory surprises. Identify emerging opportunities before competitors. Prove marketing ROI with hard data, not gut feel.</span>
              </p>
            </div>

            {/* Commercial IT & Analytics Teams */}
            <div className="rounded-2xl p-10 shadow-sm transition-all duration-300 hover:shadow-2xl" style={{ backgroundColor: '#0A1930' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 200, 255, 0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
              <h3 className="text-3xl font-mont font-bold mb-6" style={{ color: '#FFFFFF' }}>For Commercial IT & Analytics Teams</h3>
              <p className="text-lg font-inter mb-6 leading-relaxed" style={{ color: '#FFFFFF' }}>
                Fragmented data sources, inconsistent formats, and endless data quality issues consume your time. Business teams want self-service analytics, but they can't trust the underlying data. You're seen as the bottleneck—not by choice, but by necessity.
              </p>

              <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#0A1930' }}>
                <h4 className="text-xl font-mont font-semibold mb-4" style={{ color: '#00C8FF' }}>What You Get:</h4>
                <ul className="space-y-3 font-inter" style={{ color: '#FFFFFF' }}>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Pre-built integrations with major distributor, retail, and regulatory data sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Automated master data management with AI-powered matching and deduplication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Self-service analytics tools that don't sacrifice governance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Real-time data quality monitoring with anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <FeatherIcon name="check" size={20} color="#00C8FF" strokeWidth={3} />
                    </div>
                    <span>Rapid feed onboarding with no-code configuration</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold" style={{ color: '#FFFFFF' }}>
                The Outcome? <span style={{ color: '#00C8FF' }}>Shift from data janitor to strategic enabler. Deliver reliable insights in hours, not weeks. Build trust through consistent, accurate, real-time analytics.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20" style={{ background: 'linear-gradient(to right, #00C8FF, #0099CC)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-mont font-bold mb-6" style={{ color: '#0A1930' }}>
              Ready to Turn Data Chaos into Commercial Advantage?
            </h2>
            <p className="text-xl mb-10 font-inter leading-relaxed" style={{ color: '#FFFFFF' }}>
              The U.S. beverage alcohol market rewards speed, precision, and intelligence. ConsumerIQ delivers the unified analytics foundation your team needs to compete—and win.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact">
                <button className="px-10 py-4 rounded-lg font-mont font-bold text-lg transition-all shadow-lg"
                  style={{ backgroundColor: '#FFFFFF', color: '#0A1930' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0A1930'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.outline = '2px solid #FFFFFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#0A1930'; e.currentTarget.style.outline = 'none'; }}>
                  Schedule a Demo
                </button>
              </a>
              <a href="#faq">
                <button className="px-10 py-4 rounded-lg border-2 font-mont font-bold text-lg transition-all"
                  style={{ backgroundColor: 'transparent', color: '#FFFFFF', borderColor: '#FFFFFF' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.color = '#0A1930'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFFFFF'; }}>
                  View FAQ
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0A1930' }} className="pt-16 pb-8">
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
                <li><a href="#features" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Features</a></li>
                <li><a href="#solution" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Platform</a></li>
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
                <li><a href="#" className="transition-colors hover:text-electric-cyan" style={{ color: '#EBEFF2' }}>Contact</a></li>
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
        </>
      )}

      {/* Thinking Overlay */}
      <ThinkingOverlay
        isVisible={isThinking}
        stages={stages}
        onCancel={handleCancelThinking}
      />

      {/* Improved Chat Widget */}
      <ImprovedChatWidget
        ref={chatWidgetRef}
        onPageGenerated={handlePageGenerated}
        onThinkingStart={handleThinkingStart}
        onStageUpdate={handleStageUpdate}
      />
    </div>
  )
}
