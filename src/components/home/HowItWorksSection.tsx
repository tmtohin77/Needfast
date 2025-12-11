import React from 'react';
import { PlusIcon, LinkIcon, VideoIcon, ChatIcon } from '@/components/icons/Icons';

const steps = [
  {
    number: '01',
    icon: PlusIcon,
    title: 'Create a Meeting',
    description: 'Click "New Meeting" to instantly create a meeting room with a unique code.',
  },
  {
    number: '02',
    icon: LinkIcon,
    title: 'Share the Link',
    description: 'Copy the meeting code or link and share it with participants via any channel.',
  },
  {
    number: '03',
    icon: VideoIcon,
    title: 'Start Your Call',
    description: 'Once everyone joins, start your video call with crystal-clear quality.',
  },
  {
    number: '04',
    icon: ChatIcon,
    title: 'Collaborate',
    description: 'Share your screen, chat, and collaborate in real-time with your team.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-full text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Start meeting in
            <br />
            <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">
              just 4 simple steps
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No downloads, no sign-ups required. Get started in seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-cyan-300 dark:from-indigo-700 dark:to-cyan-700" />
                )}

                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Icon size={32} className="text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
