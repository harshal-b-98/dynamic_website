import ChatInterface from '@/components/organisms/ChatInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Consumer IQ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your AI-powered conversation assistant. Ask questions, get insights,
            and explore personalized content.
          </p>
        </div>

        {/* Chat Interface Section */}
        <div className="max-w-4xl mx-auto">
          <div className="h-[600px]">
            <ChatInterface />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Powered by Claude and GPT-4 for intelligent conversations
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">💬 Persistent Chat</h3>
            <p className="text-sm text-gray-600">
              Your conversations are saved and accessible across sessions
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Real-time</h3>
            <p className="text-sm text-gray-600">
              Get instant responses with seamless interaction
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
