import React from 'react';
import { CheckIcon } from '@/components/icons/Icons';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal use and small teams',
    features: [
      'Unlimited 1:1 meetings',
      'Group meetings up to 50 participants',
      'Screen sharing',
      'Real-time chat',
      'File sharing (10MB limit)',
      'HD video quality',
      'No time limits',
      'Basic host controls',
    ],
    cta: 'Get Started Free',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$0',
    period: 'forever',
    description: 'Advanced features for power users',
    features: [
      'Everything in Free',
      'Meeting recording (coming soon)',
      'Custom backgrounds',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom branding',
      'SSO integration',
    ],
    cta: 'Coming Soon',
    popular: false,
    disabled: true,
  },
];

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/50 rounded-full text-sm font-medium text-green-700 dark:text-green-300 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
              pricing for everyone
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            NeetFast is completely free. No hidden fees, no credit card required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-500/30 scale-105'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-sm font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                <span className={`text-lg ${plan.popular ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  /{plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/50'
                    }`}>
                      <CheckIcon size={12} className={plan.popular ? 'text-white' : 'text-green-600 dark:text-green-400'} />
                    </div>
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.disabled}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : plan.disabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
