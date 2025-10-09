export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Dynamic AI-Driven Website
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          A conversation-first platform that generates personalized web pages
          dynamically using AI, RAG, and component-based architecture.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/chat"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Chat
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Docs
          </a>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Uses Claude and GPT-4 for intelligent conversations and content generation
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Personalized</h3>
            <p className="text-sm text-gray-600">
              Detects user personas and tailors content dynamically
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Fast</h3>
            <p className="text-sm text-gray-600">
              Built on Next.js 15 with optimized performance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
