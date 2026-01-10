import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Calculator, 
  Users, 
  FileText, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  Globe,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { HeroCodeBlock } from '@/components/CodeBlock';
import { ThemeToggle } from '@/components/ThemeToggle';
import { staggerContainer, staggerItem } from '../utils/animations';

const features = [
  {
    icon: Leaf,
    title: 'Education Agent',
    description: 'Learn about carbon credits, regulations, and market dynamics through AI-powered guidance',
    color: 'text-swachh-green-500',
    gradient: 'from-swachh-green-500/20 to-swachh-green-600/20',
  },
  {
    icon: Calculator,
    title: 'Calculator Agent',
    description: 'Calculate your emissions and credit requirements with precision using intelligent analysis',
    color: 'text-swachh-marigold-500',
    gradient: 'from-swachh-marigold-500/20 to-swachh-marigold-600/20',
  },
  {
    icon: Users,
    title: 'Matching Agent',
    description: 'Find the perfect sellers based on your specific needs using AI-powered matching',
    color: 'text-swachh-saffron',
    gradient: 'from-swachh-saffron/20 to-swachh-marigold-500/20',
  },
  {
    icon: FileText,
    title: 'Formalities Advisor',
    description: 'Navigate government procedures and compliance requirements with expert guidance',
    color: 'text-swachh-green-600',
    gradient: 'from-swachh-green-600/20 to-swachh-green-700/20',
  },
];

const stats = [
  { value: '50K+', label: 'Carbon Credits Traded' },
  { value: '1000+', label: 'Verified Projects' },
  { value: '99.9%', label: 'Transaction Success' },
  { value: '24/7', label: 'AI Support' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
      
      {/* Gradient Orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-swachh-green-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-96 h-96 bg-swachh-marigold-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-96 h-96 bg-swachh-saffron/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Leaf className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold font-display">
                <GradientText>Carbon Market</GradientText>
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div 
                className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4 text-swachh-marigold-500" />
                <span className="text-sm font-medium">Powered by AI Agents</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display mb-6 leading-tight">
                Trade Carbon Credits
                <br />
                <GradientText animated className="text-5xl md:text-6xl lg:text-7xl">
                  Intelligently
                </GradientText>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                AI-powered platform for carbon credit trading with intelligent agents
                to guide you through emissions calculation, seller matching, and compliance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="xl" variant="glow" className="w-full sm:w-auto">
                    Start Trading
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Explore Platform
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold font-display">
                      <GradientText>{stat.value}</GradientText>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Code Block */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <HeroCodeBlock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Meet Your AI <GradientText>Agents</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four specialized AI agents work together to simplify your carbon credit journey
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={staggerItem}>
                <GlassCard
                  className="p-6 h-full"
                  glow={index % 2 === 0 ? 'green' : 'orange'}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Why Choose <GradientText>Carbon Market?</GradientText>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Shield, title: 'Secure Transactions', desc: 'Bank-grade security for all your carbon credit trades' },
                  { icon: Zap, title: 'Instant Matching', desc: 'AI-powered matching finds you the best deals in seconds' },
                  { icon: Globe, title: 'Global Marketplace', desc: 'Access verified carbon credit projects worldwide' },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-swachh-green-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-swachh-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8" glow="green">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center mb-6">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold font-display mb-2">
                    Swachh Bharat Mission
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Supporting India's vision for a cleaner, greener future through sustainable carbon trading
                  </p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-swachh-saffron" />
                    <div className="w-8 h-8 rounded-full bg-white border" />
                    <div className="w-8 h-8 rounded-full bg-swachh-green-500" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">
              Ready to Make a <GradientText animated>Difference?</GradientText>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of organizations committed to reducing their carbon footprint
              and contributing to a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="xl" variant="glass" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-swachh-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-display">Carbon Market</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered carbon credit marketplace for a sustainable future.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/education" className="hover:text-swachh-green-400 transition-colors">Education</Link></li>
                <li><Link to="/calculator" className="hover:text-swachh-green-400 transition-colors">Calculator</Link></li>
                <li><Link to="/matching" className="hover:text-swachh-green-400 transition-colors">Matching</Link></li>
                <li><Link to="/marketplace" className="hover:text-swachh-green-400 transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-swachh-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-swachh-green-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-swachh-green-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-swachh-green-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center hover:bg-swachh-green-500/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center hover:bg-swachh-green-500/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg glass-dark flex items-center justify-center hover:bg-swachh-green-500/20 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Carbon Credit Marketplace. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Supporting</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 rounded-full bg-swachh-saffron" />
                <div className="w-4 h-4 rounded-full bg-white" />
                <div className="w-4 h-4 rounded-full bg-swachh-green-500" />
              </div>
              <span className="text-gray-400 text-sm">Swachh Bharat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
