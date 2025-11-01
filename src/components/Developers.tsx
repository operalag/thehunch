import { motion } from 'framer-motion';
import { Code, BookOpen, GitBranch, Terminal } from 'lucide-react';
import { Button } from './ui/button';

const useCases = [
  {
    title: 'Prediction Markets',
    description: 'Resolve bets and wagers with fast, secure oracle data',
    icon: '🎯',
  },
  {
    title: 'Insurance DApps',
    description: 'Trigger payouts based on real-world events',
    icon: '🛡️',
  },
  {
    title: 'Gaming & NFTs',
    description: 'Dynamic NFTs and game outcomes based on events',
    icon: '🎮',
  },
  {
    title: 'DeFi Protocols',
    description: 'Price feeds and settlement data for smart contracts',
    icon: '💰',
  },
];

const codeSnippet = `// Request oracle resolution
const requestResolution = async (eventId) => {
  const fee = parseUnits("194", 9); // 194 TON
  
  await oracleContract.requestResolution(
    eventId,
    { value: fee }
  );
};

// Listen for resolution
oracleContract.on("EventResolved", 
  (eventId, outcome) => {
    console.log(\`Event \${eventId}: \${outcome}\`);
    // Trigger your smart contract logic
  }
);`;

const Developers = () => {
  return (
    <section id="developers" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Developers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple integration, powerful capabilities
          </p>
        </motion.div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl hover:shadow-glow transition-smooth text-center"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="font-bold mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="glass rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center space-x-3">
                <Terminal size={20} className="text-accent" />
                <span className="font-mono text-sm">oracle-integration.ts</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(codeSnippet)}
              >
                Copy
              </Button>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-sm font-mono text-muted-foreground">
                {codeSnippet}
              </code>
            </pre>
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <div className="gradient-card p-6 rounded-xl text-center group hover:shadow-glow transition-smooth">
            <Code className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-smooth" />
            <h3 className="font-bold mb-2">API Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete reference for all contract methods
            </p>
            <Button variant="link" className="text-primary">
              Read Docs →
            </Button>
          </div>

          <div className="gradient-card p-6 rounded-xl text-center group hover:shadow-glow transition-smooth">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-accent group-hover:scale-110 transition-smooth" />
            <h3 className="font-bold mb-2">Integration Guide</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Step-by-step tutorials and best practices
            </p>
            <Button variant="link" className="text-accent">
              View Guides →
            </Button>
          </div>

          <div className="gradient-card p-6 rounded-xl text-center group hover:shadow-glow transition-smooth">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-smooth" />
            <h3 className="font-bold mb-2">GitHub Repo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Open-source contracts and SDK
            </p>
            <Button variant="link" className="text-primary">
              View on GitHub →
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Developers;
