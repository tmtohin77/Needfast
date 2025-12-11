import React from 'react';

const DevicesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-200 mb-4">
            Cross-Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Works everywhere you do
          </h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            Join meetings from any device — mobile, tablet, laptop, or TV. 
            No downloads required, just open your browser.
          </p>
        </div>

        {/* Device mockups */}
        <div className="relative flex items-end justify-center gap-4 sm:gap-8">
          {/* Mobile */}
          <div className="relative w-20 sm:w-32 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl">
              <div className="bg-gray-800 rounded-xl sm:rounded-2xl aspect-[9/16] flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">N</span>
                  </div>
                  <div className="w-full h-1 sm:h-2 bg-gray-700 rounded mb-1" />
                  <div className="w-3/4 h-1 sm:h-2 bg-gray-700 rounded mx-auto" />
                </div>
              </div>
            </div>
            <p className="text-center text-indigo-200 text-xs sm:text-sm mt-3 font-medium">Mobile</p>
          </div>

          {/* Tablet */}
          <div className="relative w-32 sm:w-48 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 shadow-2xl">
              <div className="bg-gray-800 rounded-xl sm:rounded-2xl aspect-[4/3] flex items-center justify-center">
                <div className="grid grid-cols-2 gap-1 sm:gap-2 p-2 sm:p-4 w-full">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-600 rounded sm:rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-indigo-200 text-xs sm:text-sm mt-3 font-medium">Tablet</p>
          </div>

          {/* Laptop */}
          <div className="relative w-48 sm:w-72 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gray-900 rounded-t-xl sm:rounded-t-2xl p-1.5 sm:p-3 shadow-2xl">
              <div className="bg-gray-800 rounded-lg sm:rounded-xl aspect-video flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-4 w-full">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-600 rounded sm:rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-800 h-2 sm:h-4 rounded-b-lg mx-4" />
            <div className="bg-gray-700 h-1 sm:h-2 rounded-b-xl mx-8" />
            <p className="text-center text-indigo-200 text-xs sm:text-sm mt-3 font-medium">Laptop</p>
          </div>

          {/* TV */}
          <div className="relative w-40 sm:w-64 animate-fade-in hidden md:block" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl">
              <div className="bg-gray-800 rounded-lg sm:rounded-xl aspect-video flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 sm:gap-2 p-2 sm:p-4 w-full">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gradient-to-br from-indigo-600 to-purple-600 rounded sm:rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <div className="w-4 sm:w-8 h-4 sm:h-8 bg-gray-800 rounded-b-lg" />
            </div>
            <p className="text-center text-indigo-200 text-xs sm:text-sm mt-1 font-medium">TV</p>
          </div>
        </div>

        {/* Features list */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">No Downloads</h3>
            <p className="text-indigo-200 text-sm">Works directly in your browser. Just click and join.</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Responsive Design</h3>
            <p className="text-indigo-200 text-sm">Automatically adapts to any screen size.</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Touch Friendly</h3>
            <p className="text-indigo-200 text-sm">Optimized controls for touch devices.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;
