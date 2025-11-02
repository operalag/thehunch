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
    <section className="py-32 bg-[hsl(var(--deep-navy))]">
      <div className="container-custom max-w-4xl">
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
