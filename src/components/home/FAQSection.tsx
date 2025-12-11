import React, { useState } from 'react';
import { PlusIcon, XIcon } from '@/components/icons/Icons';

const faqs = [
  {
    question: 'Is NeetFast really free?',
    answer: 'Yes! NeetFast is completely free with no hidden costs. We believe everyone should have access to high-quality video conferencing. There are no time limits, no participant limits (up to 50), and no credit card required.',
  },
  {
    question: 'Do I need to download anything?',
    answer: 'No downloads required! NeetFast works directly in your web browser. Just open the link and join your meeting. It works on Chrome, Firefox, Safari, Edge, and other modern browsers.',
  },
  {
    question: 'How many people can join a meeting?',
    answer: 'Each meeting can have up to 50 participants. This makes NeetFast perfect for team meetings, webinars, online classes, and large group calls.',
  },
  {
    question: 'Is my meeting secure?',
    answer: 'Absolutely. All meetings are encrypted and secure. Hosts can lock meetings, enable waiting rooms, and control who can join. Your privacy and security are our top priorities.',
  },
  {
    question: 'Can I share my screen?',
    answer: 'Yes! You can share your entire screen, a specific window, or a browser tab. Screen sharing works on desktop browsers and is perfect for presentations, demos, and collaboration.',
  },
  {
    question: 'What devices are supported?',
    answer: 'NeetFast works on any device with a modern web browser - smartphones, tablets, laptops, desktops, and even smart TVs. The interface automatically adapts to your screen size.',
  },
  {
    question: 'Can I chat during meetings?',
    answer: 'Yes! There is a built-in chat feature where you can send text messages, emojis, and share files (up to 10MB) with other participants during the meeting.',
  },
  {
    question: 'How do I invite people to my meeting?',
    answer: 'When you create a meeting, you get a unique meeting code and link. Simply share this code or link via email, messaging apps, or any other way you prefer. Participants can join by entering the code or clicking the link.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently asked
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about NeetFast
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  openIndex === index
                    ? 'bg-indigo-500 text-white rotate-45'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <PlusIcon size={18} />
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Contact our support team
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
