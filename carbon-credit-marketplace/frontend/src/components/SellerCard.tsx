import { motion } from 'framer-motion';
import { Star, Mail, CheckCircle, Leaf, IndianRupee, Calendar } from 'lucide-react';
import { SellerMatch } from '../types';
import { GlassCard } from './GlassCard';
import { GradientText } from './GradientText';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SellerCardProps {
  seller: SellerMatch;
  onContact?: () => void;
  index?: number;
}

export default function SellerCard({ seller, onContact, index = 0 }: SellerCardProps) {
  const isTopMatch = index === 0;
  const matchScoreColor = seller.match_score > 80 
    ? 'text-swachh-green-500' 
    : seller.match_score > 60 
    ? 'text-swachh-marigold-500' 
    : 'text-swachh-saffron';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <GlassCard 
        className="p-6 h-full" 
        glow={isTopMatch ? 'green' : index % 2 === 0 ? 'orange' : 'none'}
      >
        {/* Header with Match Score */}
        <div className="flex items-center justify-between mb-4">
          <Badge 
            variant={seller.match_score > 80 ? 'default' : seller.match_score > 60 ? 'secondary' : 'outline'}
            className="flex items-center space-x-1"
          >
            <Star className="w-3 h-3" />
            <span>{seller.match_score.toFixed(0)}% match</span>
          </Badge>
          {isTopMatch && (
            <Badge variant="saffron">Best Match</Badge>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold font-display">{seller.seller_name}</h3>
            <p className="text-sm text-muted-foreground">{seller.project_type}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              <GradientText>₹{seller.price_per_credit.toLocaleString()}</GradientText>
            </p>
            <p className="text-xs text-muted-foreground">per credit</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Leaf className="w-4 h-4 text-swachh-green-500" />
              <span className="text-lg font-bold text-swachh-green-500">
                {seller.available_credits || seller.quantity}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Credits Available</p>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Calendar className="w-4 h-4 text-swachh-marigold-500" />
              <span className="text-lg font-bold text-swachh-marigold-500">
                {seller.vintage}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Vintage Year</p>
          </div>
        </div>

        {/* Match Score Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Match Score</span>
            <span className={cn("font-semibold", matchScoreColor)}>
              {seller.match_score.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                seller.match_score > 80 
                  ? "bg-gradient-to-r from-swachh-green-500 to-swachh-green-400"
                  : seller.match_score > 60
                  ? "bg-gradient-to-r from-swachh-marigold-500 to-swachh-marigold-400"
                  : "bg-gradient-to-r from-swachh-saffron to-swachh-marigold-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${seller.match_score}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            />
          </div>
        </div>

        {/* Verification Status */}
        <div className="mb-4">
          <Badge variant="default" className="flex items-center space-x-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            <span>{seller.verification_status}</span>
          </Badge>
        </div>

        {/* Match Reasons */}
        {seller.reasons && seller.reasons.length > 0 && (
          <div className="mb-4 p-3 bg-swachh-green-500/5 rounded-lg">
            <p className="text-xs font-medium text-swachh-green-600 dark:text-swachh-green-400 mb-2">
              Why this match?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {seller.reasons.slice(0, 3).map((reason, i) => (
                <motion.li 
                  key={i} 
                  className="flex items-start space-x-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.05 + 0.3 }}
                >
                  <span className="text-swachh-green-500">•</span>
                  <span>{reason}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Button */}
        {onContact && (
          <Button
            variant="gradient"
            className="w-full"
            onClick={onContact}
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Seller
          </Button>
        )}
      </GlassCard>
    </motion.div>
  );
}
