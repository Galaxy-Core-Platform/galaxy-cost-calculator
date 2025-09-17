import React, { useState } from 'react';

export const SDLCLanding: React.FC = () => {
  const [requirements, setRequirements] = useState('');
  const [email, setEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    if (requirements.trim()) {
      setIsStarted(true);
    }
  };

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Project Started!</h2>
            <p className="text-gray-600 mt-2">Your SDLC workflow has been initiated</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Your Requirements:</h3>
            <p className="text-sm text-gray-700">{requirements}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium">Processing</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated Time:</span>
              <span className="text-gray-800 font-medium">2-3 minutes</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsStarted(false);
              setRequirements('');
              setEmail('');
            }}
            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
          >
            Start New Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-600 to-purple-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="text-6xl mr-4">🚀</div>
            <h1 className="text-5xl font-bold text-white">SDLC Agent</h1>
          </div>
          <p className="text-xl text-white/90 mb-8">
            Intelligent Software Development Lifecycle Assistant
          </p>

          {/* API Status */}
          <div className="inline-flex items-center px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-300/30 mb-8">
            <span className="text-green-200 text-sm">✅ API connected at http://localhost:8000</span>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="relative -mt-8 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Start New Project</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe Your Requirements
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  rows={6}
                  placeholder="Example: I need a payment processing API that can handle credit card transactions..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={handleStart}
                disabled={!requirements.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Project
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Fast Setup</h3>
                <p className="text-sm text-gray-600">Get started in seconds</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Quality Assured</h3>
                <p className="text-sm text-gray-600">Best practices built-in</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Full Control</h3>
                <p className="text-sm text-gray-600">Customize everything</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};