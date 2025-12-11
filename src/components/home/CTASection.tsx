import React from 'react';
import { VideoIcon, PlusIcon } from '@/components/icons/Icons';

interface CTASectionProps {
  onStartMeeting: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onStartMeeting }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
          <VideoIcon size={20} className="text-white" />
          <span className="text-sm font-medium text-white">Start your first meeting today</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to connect with
          <br />
          your team?
        </h2>

        <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
          Join thousands of teams who trust NeetFast for their video meetings. 
          No credit card required, no time limits, completely free.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStartMeeting}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-lg shadow-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            <PlusIcon size={24} />
            Start a Free Meeting
          </button>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
          >
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div>
            <p className="text-4xl font-bold text-white">50K+</p>
            <p className="text-indigo-200 text-sm mt-1">Meetings hosted</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">100K+</p>
            <p className="text-indigo-200 text-sm mt-1">Happy users</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">99.9%</p>
            <p className="text-indigo-200 text-sm mt-1">Uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
