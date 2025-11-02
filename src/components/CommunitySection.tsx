import { motion } from 'framer-motion';
import { Send, Twitter, Github } from 'lucide-react';

const CommunitySection = () => {
  const channels = [
    {
      icon: Send,
      name: 'Telegram',
      label: 'Community Chat',
      link: 'https://t.me/hunch_oracle',
    },
    {
      icon: Twitter,
      name: 'X (Twitter)',
      label: 'Updates & News',
    },
    {
      icon: Github,
      name: 'GitHub',
      label: 'Open Source',
    },
  ];

  return (
    <section id="community" className="py-32 bg-[hsl(var(--deep-navy))] relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l7.9-7.9h-.828zm5.656 0l-8.485 8.485 1.414 1.414L28.828 0h-.828z' fill='%2300D4FF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white mb-6">Join the HUNCH community</h2>
          <p className="text-xl text-[hsl(var(--soft-gray))]">
            We're building in public. Follow along and get involved.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-light rounded-2xl p-10 border border-white/5 hover:border-[hsl(var(--electric-cyan))]/30 transition-all duration-300 text-center cursor-pointer"
                onClick={() => channel.link && window.open(channel.link, '_blank')}
              >
                <Icon className="h-12 w-12 text-white mx-auto mb-4" />
                <h5 className="text-white font-semibold mb-2">{channel.name}</h5>
                <p className="text-[hsl(var(--soft-gray))] text-sm mb-3">{channel.label}</p>
                {channel.link ? (
                  <p className="text-[hsl(var(--electric-cyan))] text-sm font-medium">Join Now →</p>
                ) : (
                  <p className="text-[hsl(var(--soft-gray))] text-sm">Coming Soon</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
