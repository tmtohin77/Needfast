import React, { useState } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { VideoIcon, PlusIcon, LinkIcon } from '@/components/icons/Icons';

interface HeroSectionProps {
  onStartMeeting: () => void;
  onJoinMeeting: (code: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartMeeting, onJoinMeeting }) => {
  const [meetingCode, setMeetingCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    if (meetingCode.trim()) {
      onJoinMeeting(meetingCode.trim());
    }
  };

  const participantImages = [
    'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380028401_6d90cecf.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380028444_ae301e57.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380027998_47134044.jpg',
    'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380029974_774caadb.jpg',
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                100% Free Forever
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Video meetings
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                made simple
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              Connect with anyone, anywhere. Crystal-clear video calls, screen sharing, 
              and real-time chat — all in one place. No downloads required.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={onStartMeeting}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
              >
                <PlusIcon size={24} />
                New Meeting
              </button>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    placeholder="Enter meeting code"
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  />
                </div>
                <button
                  onClick={handleJoin}
                  disabled={!meetingCode.trim()}
                  className="px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 rounded-2xl font-semibold transition-colors"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {participantImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`User ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 object-cover"
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">50,000+</span> meetings hosted
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20">
              <img
                src="https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380011516_d094b89c.jpg"
                alt="NeetFast Video Meeting"
                className="w-full h-auto"
              />
              
              {/* Floating UI elements */}
              <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Live</span>
              </div>

              <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {participantImages.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-6 h-6 rounded-full border border-white"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">+12 in call</span>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-2xl -z-10 opacity-60 blur-sm" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl -z-10 opacity-60 blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
