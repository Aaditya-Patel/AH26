import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calculator, 
  Users, 
  FileText, 
  ShoppingBag, 
  ArrowRight,
  Leaf,
  TrendingUp,
  Building2,
  Factory,
  Sparkles
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/store';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '../utils/animations';

const agents = [
  {
    path: '/education',
    icon: BookOpen,
    title: 'Education',
    description: 'Learn about carbon credits, regulations, and market dynamics',
    gradient: 'from-swachh-green-500/20 to-swachh-green-600/20',
    iconColor: 'text-swachh-green-500',
    glow: 'green' as const,
  },
  {
    path: '/calculator',
    icon: Calculator,
    title: 'Calculator',
    description: 'Calculate your emissions and credit requirements',
    gradient: 'from-swachh-marigold-500/20 to-swachh-marigold-600/20',
    iconColor: 'text-swachh-marigold-500',
    glow: 'orange' as const,
  },
  {
    path: '/matching',
    icon: Users,
    title: 'Matching',
    description: 'Find perfect sellers matched to your needs',
    gradient: 'from-swachh-saffron/20 to-swachh-marigold-500/20',
    iconColor: 'text-swachh-saffron',
    glow: 'saffron' as const,
  },
  {
    path: '/formalities',
    icon: FileText,
    title: 'Formalities',
    description: 'Navigate government procedures and compliance',
    gradient: 'from-swachh-green-600/20 to-swachh-green-700/20',
    iconColor: 'text-swachh-green-600',
    glow: 'green' as const,
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-swachh-marigold-500" />
            <span className="text-sm text-muted-foreground">Welcome back</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display">
            <GradientText>{user.company_name}</GradientText>
          </h1>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <GlassCard className="p-6" glow="green">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-swachh-green-500/10 flex items-center justify-center">
                  {user.user_type === 'buyer' ? (
                    <Building2 className="w-6 h-6 text-swachh-green-500" />
                  ) : (
                    <Factory className="w-6 h-6 text-swachh-green-500" />
                  )}
                </div>
                <Badge variant="default" className="capitalize">
                  {user.user_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Account Type</p>
              <p className="text-2xl font-bold font-display capitalize">{user.user_type}</p>
            </GlassCard>
          </motion.div>

          {user.sector && (
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="orange">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-swachh-marigold-500/10 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-swachh-marigold-500" />
                  </div>
                  <Badge variant="secondary">Industry</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Sector</p>
                <p className="text-2xl font-bold font-display capitalize">
                  {user.sector.replace('_', ' ')}
                </p>
              </GlassCard>
            </motion.div>
          )}

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6" glow="saffron">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-swachh-saffron/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-swachh-saffron" />
                </div>
                <Badge variant="saffron">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Credits Available</p>
              <p className="text-2xl font-bold font-display">Browse Market</p>
            </GlassCard>
          </motion.div>

          <motion.div variants={staggerItem}>
            <GlassCard className="p-6" glow="green">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-swachh-green-600/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-swachh-green-600" />
                </div>
                <Badge variant="outline">Eco</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Carbon Offset</p>
              <p className="text-2xl font-bold font-display">Get Started</p>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* AI Agents Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display">
                AI <GradientText>Agents</GradientText>
              </h2>
              <p className="text-muted-foreground mt-1">
                Your intelligent assistants for carbon trading
              </p>
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {agents.map((agent, index) => (
              <motion.div key={agent.path} variants={staggerItem}>
                <Link to={agent.path}>
                  <GlassCard className="p-6 h-full group" glow={agent.glow}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <agent.icon className={`w-7 h-7 ${agent.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-2 group-hover:text-swachh-green-500 transition-colors">
                      {agent.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {agent.description}
                    </p>
                    <div className="flex items-center text-swachh-green-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Marketplace CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-8 text-center" variant="default">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">
                Ready to <GradientText animated>Trade?</GradientText>
              </h2>
              <p className="text-muted-foreground mb-6">
                Browse verified carbon credit listings from sellers worldwide and start offsetting your emissions today.
              </p>
              <Link to="/marketplace">
                <Button variant="gradient" size="xl">
                  Browse Marketplace
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Swachh Bharat Footer */}
        <motion.div 
          className="flex items-center justify-center mt-12 space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-sm text-muted-foreground">Supporting</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-swachh-saffron" />
            <div className="w-4 h-4 rounded-full bg-white border border-border" />
            <div className="w-4 h-4 rounded-full bg-swachh-green-500" />
          </div>
          <span className="text-sm text-muted-foreground">Swachh Bharat Mission</span>
        </motion.div>
      </div>
    </Layout>
  );
}
