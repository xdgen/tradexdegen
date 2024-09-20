'use client'
import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index: any) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: 'How does the demo trading work?',
      answer: 'Demo trading works by simulating real market conditions using virtual assets.',
    },
    {
      question: 'Is prior trading experience necessary?',
      answer: 'No prior trading experience is necessary. The demo platform is designed for beginners.',
    },
    {
      question: 'How realistic is the trading experience?',
      answer: 'The demo platform mirrors real trading experiences with real-time data.',
    },
    {
      question: 'How can demo trading benefit me?',
      answer: 'It allows you to practice strategies and understand market dynamics without risk.',
    },
    {
      question: 'Can I switch to real trading after practicing?',
      answer: 'Yes, after you feel comfortable, you can switch to live trading at any time.',
    },
  ];

  return (
    <div className="strips text-white p-8 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-center text-3xl font-bold mb-6" data-aos="fade-up">FAQs</h2>
        <h3 className="text-center text-xl mb-10" data-aos="fade-up">Got questions? We&apos;ve got answers</h3>
        <div className="space-y-4" data-aos="fade-up">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-secondary p-4 rounded-lg cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center transition-all duration-300 ease-in-out">
                <h4 className="text-lg font-medium">{item.question}</h4>
                <span className="text-lg">
                  {openIndex === index ? '-' : '+'}
                </span>
              </div>
              {openIndex === index && (
                <p className="mt-3 text-white/80">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
