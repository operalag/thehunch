import { motion } from 'framer-motion';
import { Send, Twitter, MessageCircle, Github, FileText } from 'lucide-react';

const CommunitySection = () => {
  const channels = [
    {
      icon: Send,
      name: 'Telegram',
      label: 'Community Chat',
    },
    {
      icon: Twitter,
      name: 'X (Twitter)',
      label: 'Updates & News',
    },
    {
      icon: MessageCircle,
      name: 'Discord',
      label: 'Developer Hub',
    },
    {
      icon: Github,
      name: 'GitHub',
      label: 'Open Source',
    },
    {
      icon: FileText,
      name: 'Blog',
      label: 'Research & Insights',
    },
  ];

  return (
    <section id="community" className="py-32 bg-[hsl(var(--slate-gray))]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white mb-6">Join the hunch community</h2>
          <p className="text-xl text-[hsl(var(--soft-gray))]">
            We're building in public. Follow along and get involved.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[hsl(var(--deep-navy))] rounded-2xl p-10 border border-white/5 hover:border-[hsl(var(--electric-cyan))]/30 transition-all duration-300 text-center"
              >
                <Icon className="h-12 w-12 text-white mx-auto mb-4" />
                <h5 className="text-white font-semibold mb-2">{channel.name}</h5>
                <p className="text-[hsl(var(--soft-gray))] text-sm mb-3">{channel.label}</p>
                <p className="text-[hsl(var(--soft-gray))] text-sm">Coming Soon</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
