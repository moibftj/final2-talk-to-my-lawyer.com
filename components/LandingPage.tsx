import React from 'react';
import { ShimmerButton } from './magicui/shimmer-button';
import { ShinyButton } from './magicui/shiny-button';
import { SparklesText } from './magicui/sparkles-text';
import { Spotlight } from './magicui/spotlight';
import { IconLogo, IconFilePlus, IconUsers, IconStar } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.3)" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <IconLogo className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Law Letter AI
            </span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={onLogin}
              className="text-sm sm:text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <ShimmerButton 
              onClick={onGetStarted}
              className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base"
            >
              Get Started
            </ShimmerButton>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-32 pb-16 sm:pb-24 lg:pb-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 sm:mb-8">
              <SparklesText>Generate Legal Letters</SparklesText>
              <br />
              <span className="text-blue-600 dark:text-blue-400">with AI Power</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Create professional legal documents in minutes. From demand letters to cease and desist notices, 
              our AI assistant helps you craft legally sound letters with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <ShimmerButton 
                onClick={onGetStarted}
                className="w-full sm:w-auto h-10 sm:h-12 lg:h-14 px-6 sm:px-8 lg:px-12 text-sm sm:text-base lg:text-lg font-semibold"
              >
                Start Creating Letters
              </ShimmerButton>
              
              <ShinyButton 
                onClick={onLogin}
                className="w-full sm:w-auto h-10 sm:h-12 lg:h-14 px-6 sm:px-8 lg:px-12 text-sm sm:text-base lg:text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Sign In
              </ShinyButton>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Law Letter AI?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Professional legal document creation made simple, fast, and affordable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl mb-4 sm:mb-6">
                <IconFilePlus className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                AI-Powered Generation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Our advanced AI creates professional legal letters tailored to your specific situation and requirements.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/20 rounded-xl mb-4 sm:mb-6">
                <IconStar className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Multiple Templates
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Choose from demand letters, cease and desist notices, recommendation letters, and more.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/20 rounded-xl mb-4 sm:mb-6">
                <IconUsers className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Easy to Use
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Simple form-based interface makes creating professional legal documents accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24 lg:py-32 bg-slate-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get your legal letter in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 dark:bg-blue-500 rounded-full text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Choose Template
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Select from our comprehensive library of legal letter templates.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 dark:bg-blue-500 rounded-full text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Fill Details
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Provide the specific information and context for your situation.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 dark:bg-blue-500 rounded-full text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Generate & Download
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                AI creates your professional letter instantly. Download as PDF or send via email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Create Your Legal Letter?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 dark:text-blue-200 mb-8 sm:mb-12">
            Join thousands of users who trust Law Letter AI for their legal document needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <ShimmerButton 
              onClick={onGetStarted}
              className="w-full sm:w-auto h-10 sm:h-12 lg:h-14 px-6 sm:px-8 lg:px-12 text-sm sm:text-base lg:text-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Get Started Now
            </ShimmerButton>
            
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto h-10 sm:h-12 lg:h-14 px-6 sm:px-8 lg:px-12 text-sm sm:text-base lg:text-lg font-semibold text-white border-2 border-white/30 hover:border-white/50 rounded-lg transition-all duration-200 hover:bg-white/10"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <IconLogo className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">Law Letter AI</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Law Letter AI. Professional legal document generation powered by AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};