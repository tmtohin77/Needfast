import React from 'react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    image: 'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380028401_6d90cecf.jpg',
    quote: 'NeetFast has transformed how our remote team collaborates. The video quality is exceptional and the interface is incredibly intuitive.',
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    company: 'StartupXYZ',
    image: 'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380028444_ae301e57.jpg',
    quote: 'Finally, a video conferencing tool that just works. No complicated setup, no subscription fees. It\'s perfect for our daily standups.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'Creative Agency',
    image: 'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380027998_47134044.jpg',
    quote: 'The screen sharing feature is seamless, and I love how easy it is to share files during meetings. Highly recommend!',
  },
  {
    name: 'David Kim',
    role: 'CEO',
    company: 'Innovation Labs',
    image: 'https://d64gsuwffb70l.cloudfront.net/69398f313bc31555bcf902f8_1765380029974_774caadb.jpg',
    quote: 'We switched from expensive enterprise solutions to NeetFast. Same features, zero cost. Our team loves it.',
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/50 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by teams
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              around the world
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what our users have to say about their experience with NeetFast.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
