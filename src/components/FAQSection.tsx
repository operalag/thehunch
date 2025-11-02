import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: 'What is an oracle?',
      answer: "Oracles are bridges between blockchains and the real world. Smart contracts can't access off-chain data on their own—they need oracles to fetch, verify, and deliver external information like prices, weather, or API responses.",
    },
    {
      question: 'Why should I care about hunch?',
      answer: "If you're building on TON and need real-world data, hunch will be your infrastructure. We're focused on security, decentralization, and speed—ensuring your dApp can trust the data it receives.",
    },
    {
      question: 'When is the token launching?',
      answer: "We're not ready to share tokenomics details yet. Join the waitlist to be among the first to know when we announce.",
    },
    {
      question: 'How can I become a data provider?',
      answer: "We're currently onboarding a select group of initial data providers. If you have infrastructure and want to participate, join the waitlist and indicate your interest.",
    },
    {
      question: 'Is hunch open source?',
      answer: "Parts of the protocol will be open source. We'll share our approach to transparency and audits as we get closer to launch.",
    },
    {
      question: 'How is hunch different from other oracles?',
      answer: "hunch is built specifically for TON's architecture, taking advantage of infinite sharding and high throughput. We're not porting a solution from another chain—we're building native infrastructure from the ground up.",
    },
    {
      question: 'Can I invest or buy tokens now?',
      answer: 'No. We are not conducting any token sale, presale, or fundraise at this time. Be cautious of scams. Official announcements will only come from verified channels.',
    },
  ];

  return (
    <section className="py-32 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom max-w-4xl relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-white text-center mb-16"
        >
          Questions?
        </motion.h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="glass-light rounded-xl border border-white/5 px-7 py-2 hover:border-[hsl(var(--electric-cyan))]/30 transition-all"
              >
                <AccordionTrigger className="text-white text-xl font-semibold hover:text-[hsl(var(--electric-cyan))] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[hsl(var(--soft-gray))] text-base leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
