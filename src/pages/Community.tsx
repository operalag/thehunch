import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Twitter, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const channels = [
  {
    icon: MessageCircle,
    name: 'Discord',
    members: '1,500+ members',
    description: 'Primary hub for technical discussions, governance proposals, and developer support',
    color: 'bg-purple-500',
    link: 'https://discord.com',
  },
  {
    icon: Send,
    name: 'Telegram',
    members: '800+ members',
    description: 'Announcements, community chat, and real-time updates on development milestones',
    color: 'bg-primary',
    link: 'https://t.me',
  },
  {
    icon: Twitter,
    name: 'Twitter/X',
    members: '500+ followers',
    description: 'Protocol updates, ecosystem news, and community highlights',
    color: 'bg-black',
    link: 'https://twitter.com',
  },
  {
    icon: Github,
    name: 'GitHub',
    members: '50+ stars',
    description: 'Open source contracts, documentation, and contribution opportunities',
    color: 'bg-gray-800',
    link: 'https://github.com',
  },
];

const Community = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="gradient-text mb-6">Join the Hunch Community</h1>
            <p className="text-xl text-muted-foreground">
              Building Oracle Infrastructure Together
            </p>
            <p className="text-muted-foreground mt-4">
              2,000+ developers, investors, and TON enthusiasts collaborating to bring decentralized oracles to 900M Telegram users
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {channels.map((channel, index) => (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-border rounded-xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 rounded-full ${channel.color} flex items-center justify-center mb-6`}>
                  <channel.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{channel.name}</h3>
                <p className="text-sm text-primary font-semibold mb-4">{channel.members}</p>
                <p className="text-muted-foreground mb-6 leading-relaxed">{channel.description}</p>
                <Button
                  className={`w-full ${channel.color} hover:opacity-90 text-white`}
                  onClick={() => window.open(channel.link, '_blank')}
                >
                  Join {channel.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
