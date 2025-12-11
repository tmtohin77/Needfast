import React from 'react';
import {
  VideoIcon,
  MicIcon,
  ScreenShareIcon,
  ChatIcon,
  UsersIcon,
  LockIcon,
  GridIcon,
  SettingsIcon,
} from '@/components/icons/Icons';

const features = [
  {
    icon: VideoIcon,
    title: 'HD Video Calls',
    description: 'Crystal-clear video quality with adaptive streaming that adjusts to your connection.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: MicIcon,
    title: 'Clear Audio',
    description: 'Advanced noise cancellation ensures your voice is heard clearly every time.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: ScreenShareIcon,
    title: 'Screen Sharing',
    description: 'Share your entire screen or specific windows with just one click.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: ChatIcon,
    title: 'Real-time Chat',
    description: 'Send messages, emojis, and files during your meeting without interrupting.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: UsersIcon,
    title: 'Group Meetings',
    description: 'Host meetings with up to 50 participants in a responsive grid layout.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: LockIcon,
    title: 'Secure & Private',
    description: 'End-to-end encryption keeps your conversations private and secure.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: GridIcon,
    title: 'Flexible Layouts',
    description: 'Switch between grid, spotlight, and sidebar views to suit your needs.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: SettingsIcon,
    title: 'Host Controls',
    description: 'Manage participants, mute all, lock meetings, and more as the host.',
    color: 'from-red-500 to-red-600',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              seamless meetings
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make your video meetings productive and enjoyable.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-750 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
