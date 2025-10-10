'use client'

import { useState, useRef } from 'react'
import ImprovedChatWidget from '@/components/organisms/ImprovedChatWidget'
import { DynamicPageRenderer } from '@/components/organisms/DynamicPageRenderer'
import ThinkingOverlay from '@/components/organisms/ThinkingOverlay'
import { PageSpecification } from '@/lib/page-generation'
import { ThinkingStage, DEFAULT_THINKING_STAGES } from '@/lib/thinking-process'

export default function Home() {
  const [currentPageSpec, setCurrentPageSpec] = useState<PageSpecification | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [stages, setStages] = useState<ThinkingStage[]>(
    DEFAULT_THINKING_STAGES.map(stage => ({ ...stage, status: 'pending' as const }))
  )
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
    setCurrentPageSpec(pageSpec)
    setIsThinking(false)
    // Minimize chat back to bar mode after page is generated
    chatWidgetRef.current?.minimizeToBar()
  }

  // Handler to return to landing page
  const handleBackToLanding = () => {
    setCurrentPageSpec(null)
  }

  // Handler to cancel thinking
  const handleCancelThinking = () => {
    setIsThinking(false)
  }

  return (
    <div className="min-h-screen bg-surface-white">
      {/* Navigation */}
      <nav className="border-b border-light-data-gray bg-surface-white z-50 relative">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-deep-indigo rounded flex items-center justify-center">
                <span className="text-electric-cyan font-mont font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-mont font-bold text-deep-indigo">ConsumerIQ</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-charcoal-gray hover:text-deep-indigo transition-colors font-inter">Features</a>
              <a href="#functions" className="text-charcoal-gray hover:text-deep-indigo transition-colors font-inter">Functions</a>
              <a href="#solution" className="text-charcoal-gray hover:text-deep-indigo transition-colors font-inter">Solution</a>
              <button className="px-5 py-2.5 bg-electric-cyan text-deep-indigo font-inter font-semibold rounded-lg hover:bg-deep-indigo hover:text-electric-cyan transition-colors">
                Talk to Our Team
              </button>
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
              {/* Back to Landing Button */}
              <button
                onClick={handleBackToLanding}
                className="mb-8 flex items-center gap-2 text-[var(--charcoal-gray)] hover:text-[var(--electric-cyan)] transition-all duration-300 font-inter font-medium group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </button>

              {/* Render Dynamic Page */}
              <div className="dynamic-page-content">
                <DynamicPageRenderer
                  pageSpec={currentPageSpec}
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
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-deep-indigo to-black py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-mont font-extrabold text-surface-white mb-6 leading-tight">
              Stop Guessing. Start Winning.
            </h1>
            <p className="text-xl md:text-2xl text-light-data-gray mb-10 leading-relaxed font-inter max-w-4xl mx-auto">
              Spot opportunities early. Prove promotional impact. Outmaneuver competitors. ConsumerIQ gives U.S. beverage alcohol suppliers real-time market intelligence—without the data chaos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-electric-cyan text-deep-indigo rounded-lg font-mont font-semibold text-lg hover:bg-surface-white transition-all shadow-lg">
                Explore Solutions
              </button>
              <button className="px-8 py-4 bg-transparent text-surface-white rounded-lg border-2 border-electric-cyan font-mont font-semibold text-lg hover:bg-electric-cyan hover:text-deep-indigo transition-all">
                See How It Works
              </button>
              <button className="px-8 py-4 bg-deep-indigo text-electric-cyan rounded-lg border-2 border-electric-cyan font-mont font-semibold text-lg hover:bg-electric-cyan hover:text-deep-indigo transition-all">
                Talk to Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-light-data-gray">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-deep-indigo mb-4">
              The Real Cost of Fragmented Data
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-surface-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-mont font-bold text-deep-indigo mb-4">Delayed, Conflicting Reports</h3>
              <p className="text-charcoal-gray font-inter leading-relaxed">
                Distributor data arrives on the 15th. Retail scans on the 20th. By the time you reconcile them, the market has moved and opportunities are gone.
              </p>
            </div>

            <div className="bg-surface-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-mont font-bold text-deep-indigo mb-4">Invisible Execution</h3>
              <p className="text-charcoal-gray font-inter leading-relaxed">
                You approved the promotion and paid for displays—but did they go up? Without proof linking field execution to sales velocity, <span className="text-refined-copper font-semibold">trade dollars disappear without accountability</span>.
              </p>
            </div>

            <div className="bg-surface-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-mont font-bold text-deep-indigo mb-4">Reactive Innovation</h3>
              <p className="text-charcoal-gray font-inter leading-relaxed">
                Traditional research takes months. Your COLA approval process feels like a black box. Every delay costs a seasonal window while <span className="text-risk-red font-semibold">competitors capture whitespace first</span>.
              </p>
            </div>

            <div className="bg-surface-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-mont font-bold text-deep-indigo mb-4">The IT Bottleneck</h3>
              <p className="text-charcoal-gray font-inter leading-relaxed">
                Analytics teams spend 70% of their time cleaning data instead of generating insights. Sales and marketing make gut-feel decisions because they can't trust the numbers—or wait weeks for answers.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center max-w-4xl mx-auto">
            <p className="text-lg font-inter text-charcoal-gray">
              Industry research shows <span className="text-refined-copper font-bold text-xl">bad data costs beverage suppliers 15-25% in lost revenue annually</span>. That's missed market share, wasted trade spend, and strategic opportunities handed to faster-moving competitors.
            </p>
          </div>
        </div>
      </section>

      {/* Product Features Section */}
      <section id="features" className="py-20 bg-deep-indigo">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-surface-white mb-4">
              Intelligence Built for How Your Team Actually Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Natural Language Analytics */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Natural Language Analytics</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                Ask questions in plain English. Get instant answers. "Which distributors are underperforming in the Southeast?" "Show me RTD launches in the last 60 days." No SQL. No waiting for IT. No conflicting spreadsheets.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Transform weeks of data wrangling into seconds of insight generation.
              </p>
            </div>

            {/* Predictive Intelligence */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Predictive Intelligence</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                Our AI doesn't just report what happened—it forecasts what's coming. Predict COLA approval timelines before submission. Identify emerging category opportunities before competitors move. Flag distributor performance risks before they impact your numbers.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Make proactive decisions with confidence, not reactive pivots in crisis mode.
              </p>
            </div>

            {/* Unified Performance Dashboards */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Unified Performance Dashboards</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                Sales tracks distributor health and territory performance. Marketing measures campaign lift and promo ROI. IT monitors data quality and feed latency. Everyone sees the same numbers, updated in near real-time.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Eliminate the "which report is right?" debates and accelerate decision velocity.
              </p>
            </div>

            {/* Competitive Launch Tracking */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Competitive Launch Tracking</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                Monitor TTB filings, social signals, and menu additions to detect competitor innovations early. Analyze category trends and identify whitespace opportunities while they're still open.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Launch smarter, faster, and into less crowded spaces.
              </p>
            </div>

            {/* Execution Verification Engine */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Execution Verification Engine</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                Link trade promotion plans to field execution photos and sales outcomes. Verify display compliance, measure promotional lift, and calculate true trade spend ROI—all in one workflow.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Turn trade dollars into measurable revenue instead of unverifiable expenses.
              </p>
            </div>

            {/* Automated Compliance Monitoring */}
            <div className="bg-deep-indigo border-2 border-electric-cyan/30 rounded-xl p-8 hover:border-electric-cyan transition-all">
              <div className="w-14 h-14 bg-electric-cyan/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-electric-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-mont font-bold text-electric-cyan mb-3">Automated Compliance Monitoring</h3>
              <p className="text-surface-white font-inter mb-4 leading-relaxed">
                AI-powered label review flags potential compliance issues before submission. Track approval timelines, benchmark against historical patterns, and receive alerts when filings move through the process.
              </p>
              <p className="text-electric-cyan font-inter font-semibold">
                Value: Reduce time-to-market and eliminate costly resubmissions.
              </p>
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
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-light-data-gray rounded-xl p-8">
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-electric-cyan rounded-lg flex items-center justify-center text-deep-indigo font-bold">1</span>
                  Regulatory Intelligence
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  TTB COLA filings, state licensing data, competitive label tracking
                </p>
              </div>

              <div className="bg-light-data-gray rounded-xl p-8">
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-electric-cyan rounded-lg flex items-center justify-center text-deep-indigo font-bold">2</span>
                  Commercial Performance
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  Distributor depletions from VIP and Encompass, retail scan and POS data
                </p>
              </div>

              <div className="bg-light-data-gray rounded-xl p-8">
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-electric-cyan rounded-lg flex items-center justify-center text-deep-indigo font-bold">3</span>
                  Market Signals
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  On-premise menu data, social sentiment, industry publications, geographic mapping
                </p>
              </div>

              <div className="bg-light-data-gray rounded-xl p-8">
                <h3 className="text-xl font-mont font-bold text-deep-indigo mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 bg-electric-cyan rounded-lg flex items-center justify-center text-deep-indigo font-bold">4</span>
                  Execution Verification
                </h3>
                <p className="text-charcoal-gray font-inter leading-relaxed">
                  Field photos, trade promotion tracking, compliance monitoring
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
      <section id="functions" className="py-20 bg-light-data-gray">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-deep-indigo mb-4">
              Precision-Built Intelligence for Every Commercial Function
            </h2>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Sales & Commercial Teams */}
            <div className="bg-surface-white rounded-2xl p-10 shadow-sm">
              <h3 className="text-3xl font-mont font-bold text-deep-indigo mb-6">For Sales & Commercial Teams</h3>
              <p className="text-lg text-charcoal-gray font-inter mb-6 leading-relaxed">
                Distributors control your retail access. You need objective proof that promotions drive sales. Your team needs to know which accounts to prioritize and which territories are underperforming—before the quarterly review reveals the damage.
              </p>

              <div className="bg-light-data-gray rounded-xl p-6 mb-6">
                <h4 className="text-xl font-mont font-semibold text-deep-indigo mb-4">What You Get:</h4>
                <ul className="space-y-3 text-charcoal-gray font-inter">
                  <li className="flex items-start gap-3">
                    <span className="text-refined-copper mt-1">●</span>
                    <span>Real-time distributor performance dashboards with health scoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-refined-copper mt-1">●</span>
                    <span>Territory analytics linking field execution to sales velocity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-refined-copper mt-1">●</span>
                    <span>Display compliance verification with photo-validated execution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-refined-copper mt-1">●</span>
                    <span>Chain distribution tracking across every SKU and account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-refined-copper mt-1">●</span>
                    <span>Pricing compliance monitoring to protect brand positioning</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold text-deep-indigo">
                The Outcome? <span className="text-refined-copper">Hold distributors accountable with data. Optimize trade spend based on measurable ROI. Hit revenue targets by focusing resources where they matter most.</span>
              </p>
            </div>

            {/* Marketing & Innovation Teams */}
            <div className="bg-deep-indigo rounded-2xl p-10 shadow-sm">
              <h3 className="text-3xl font-mont font-bold text-surface-white mb-6">For Marketing & Innovation Teams</h3>
              <p className="text-lg text-surface-white font-inter mb-6 leading-relaxed">
                Campaigns need to perform. New products need to launch on time. You're expected to spot trends early, measure promo effectiveness, and find whitespace opportunities—all while traditional research takes months and COLA approvals feel like black boxes.
              </p>

              <div className="bg-deep-indigo/50 border-2 border-electric-cyan/30 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-mont font-semibold text-electric-cyan mb-4">What You Get:</h4>
                <ul className="space-y-3 text-surface-white font-inter">
                  <li className="flex items-start gap-3">
                    <span className="text-electric-cyan mt-1">●</span>
                    <span>AI-powered COLA timeline predictions and compliance risk assessment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-electric-cyan mt-1">●</span>
                    <span>Competitive launch intelligence from regulatory filings and market signals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-electric-cyan mt-1">●</span>
                    <span>Campaign lift measurement tied to actual execution and sales data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-electric-cyan mt-1">●</span>
                    <span>Social sentiment tracking correlated with purchase behavior</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-electric-cyan mt-1">●</span>
                    <span>Category trend analysis combining retail, on-premise, and regulatory data</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold text-surface-white">
                The Outcome? <span className="text-electric-cyan">Launch products faster with fewer regulatory surprises. Identify emerging opportunities before competitors. Prove marketing ROI with hard data, not gut feel.</span>
              </p>
            </div>

            {/* Commercial IT & Analytics Teams */}
            <div className="bg-surface-white rounded-2xl p-10 shadow-sm">
              <h3 className="text-3xl font-mont font-bold text-deep-indigo mb-6">For Commercial IT & Analytics Teams</h3>
              <p className="text-lg text-charcoal-gray font-inter mb-6 leading-relaxed">
                Fragmented data sources, inconsistent formats, and endless data quality issues consume your time. Business teams want self-service analytics, but they can't trust the underlying data. You're seen as the bottleneck—not by choice, but by necessity.
              </p>

              <div className="bg-light-data-gray rounded-xl p-6 mb-6">
                <h4 className="text-xl font-mont font-semibold text-deep-indigo mb-4">What You Get:</h4>
                <ul className="space-y-3 text-charcoal-gray font-inter">
                  <li className="flex items-start gap-3">
                    <span className="text-data-green mt-1">●</span>
                    <span>Pre-built integrations with major distributor, retail, and regulatory data sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-data-green mt-1">●</span>
                    <span>Automated master data management with AI-powered matching and deduplication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-data-green mt-1">●</span>
                    <span>Self-service analytics tools that don't sacrifice governance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-data-green mt-1">●</span>
                    <span>Real-time data quality monitoring with anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-data-green mt-1">●</span>
                    <span>Rapid feed onboarding with no-code configuration</span>
                  </li>
                </ul>
              </div>

              <p className="text-lg font-mont font-semibold text-deep-indigo">
                The Outcome? <span className="text-data-green">Shift from data janitor to strategic enabler. Deliver reliable insights in hours, not weeks. Build trust through consistent, accurate, real-time analytics.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-electric-cyan to-electric-cyan">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-mont font-bold text-deep-indigo mb-6">
              Ready to Turn Data Chaos into Commercial Advantage?
            </h2>
            <p className="text-xl text-surface-white mb-10 font-inter leading-relaxed">
              The U.S. beverage alcohol market rewards speed, precision, and intelligence. ConsumerIQ delivers the unified analytics foundation your team needs to compete—and win.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-surface-white text-deep-indigo rounded-lg font-mont font-bold text-lg hover:bg-deep-indigo hover:text-surface-white hover:border-2 hover:border-surface-white transition-all shadow-lg">
                Schedule a Demo
              </button>
              <button className="px-10 py-4 bg-deep-indigo text-surface-white rounded-lg border-2 border-deep-indigo font-mont font-bold text-lg hover:bg-surface-white hover:text-deep-indigo transition-all">
                View FAQ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-light-data-gray py-12 bg-surface-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-deep-indigo rounded flex items-center justify-center">
                <span className="text-electric-cyan font-mont font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-mont font-bold text-deep-indigo">ConsumerIQ</span>
            </div>
            <div className="text-charcoal-gray font-inter">
              <p>&copy; 2025 ConsumerIQ. All rights reserved.</p>
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
