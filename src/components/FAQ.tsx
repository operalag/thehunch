import { motion } from 'framer-motion';
import { Button } from './ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const faqs = [
  {
    question: 'How fast is Hunch Oracle compared to UMA?',
    answer: 'Hunch Oracle resolves events in 3-6 hours, compared to UMA\'s 48+ hour dispute period. This 8x speed improvement is achieved through our streamlined challenge mechanism and TON blockchain\'s high throughput.',
  },
  {
    question: 'What happens if someone challenges my proposal?',
    answer: 'Challenges require escalating bonds (2x, 4x, 8x) to deter frivolous disputes. If you\'re correct, you earn 12% rewards and the challenger forfeits their bond. If you\'re wrong, you forfeit your bond and the challenger earns rewards.',
  },
  {
    question: 'Why do I need to stake 10,000 $HNCH to participate?',
    answer: 'The $HNCH staking requirement prevents spam and griefing attacks. Only serious, reputable oracles with skin in the game can participate, ensuring high-quality resolutions.',
  },
  {
    question: 'How are staking rewards calculated?',
    answer: 'Staking APY ranges from 14% (1-month lock) to 42% (12-month lock) with multipliers from 1.0x to 3.0x. Rewards are paid in TON from service fees, not inflated token emissions.',
  },
  {
    question: 'What is the RewardPool and how does it work?',
    answer: '40% of all service fees go to the RewardPool, which pays honest oracles who correctly resolve events. This creates a sustainable incentive system funded by actual protocol usage.',
  },
  {
    question: 'Can I integrate Hunch Oracle into my DApp?',
    answer: 'Yes! Hunch Oracle is permissionless and open-source. Check our developer documentation for integration guides, SDKs, and code examples for prediction markets, insurance, gaming, and DeFi use cases.',
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/40 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Hunch Oracle
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button 
            onClick={() => window.open('https://t.me/hunchoracle', '_blank')}
            className="gradient-primary"
          >
            Join our Community
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
