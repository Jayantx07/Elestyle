import React from 'react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { AccordionItem } from '../molecules/AccordionItem';
import { Link } from 'react-router-dom';

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      id: '1',
      question: 'How long does delivery take?',
      answer: 'Most orders arrive within 3-7 business days.',
      defaultOpen: true,
    },
    {
      id: '2',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you will receive an email with a tracking link.',
    },
    {
      id: '3',
      question: 'Do you offer discount coupons?',
      answer: 'We occasionally offer promotions to our newsletter subscribers.',
    },
    {
      id: '4',
      question: 'Can I return a product?',
      answer: 'Yes, we accept returns within 30 days of purchase in original condition.',
    },
    {
      id: '5',
      question: 'Is shipping free?',
      answer: 'Shipping is free on orders over $150.',
    },
  ];

  return (
    <section className="py-16 md:py-32 px-4 rounded-[3rem] md:rounded-[4rem] mx-2 md:mx-4 relative z-10 shadow-sm" style={{ backgroundColor: 'white' }}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32">
        
        <div className="lg:w-1/3">
          <Typography variant="subtitle" className="mb-6 block">
            FAQ
          </Typography>
          <Typography variant="h2" as="h2" className="mb-6">
            Frequently Asked <Typography as="span" em>Questions</Typography>
          </Typography>
          <Typography variant="body" className="mb-8 max-w-sm">
            Need more help? We're here for you.
          </Typography>
          <Link to="/contact">
            <Button variant="primary">CONTACT US</Button>
          </Link>
        </div>
        
        <div className="lg:w-2/3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              defaultOpen={faq.defaultOpen}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
};
