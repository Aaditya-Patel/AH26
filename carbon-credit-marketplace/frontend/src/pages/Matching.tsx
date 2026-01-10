import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Leaf, 
  IndianRupee, 
  Calendar, 
  Filter,
  ArrowRight,
  Star,
  Building2,
  Mail
} from 'lucide-react';
import Layout from '../components/Layout';
import { matchingAPI } from '../api/client';
import { SellerMatch } from '../types';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '../utils/animations';

const projectTypes = [
  { value: '', label: 'Any' },
  { value: 'Renewable Energy', label: 'Renewable Energy' },
  { value: 'Forestry', label: 'Forestry' },
  { value: 'Energy Efficiency', label: 'Energy Efficiency' },
  { value: 'Green Hydrogen', label: 'Green Hydrogen' },
];

export default function Matching() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    credits_needed: '',
    max_price: '',
    preferred_vintage: '',
    preferred_project_type: '',
  });
  const [matches, setMatches] = useState<SellerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (location.state?.creditsNeeded) {
      setFormData((prev) => ({
        ...prev,
        credits_needed: location.state.creditsNeeded.toString(),
        max_price: location.state.costEstimate 
          ? Math.ceil(location.state.costEstimate / location.state.creditsNeeded).toString() 
          : '',
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await matchingAPI.find({
        credits_needed: parseInt(formData.credits_needed),
        max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
        preferred_vintage: formData.preferred_vintage ? parseInt(formData.preferred_vintage) : undefined,
        preferred_project_type: formData.preferred_project_type || undefined,
      });
      setMatches(response.data.matches || []);
      if ((response.data.matches || []).length === 0) {
        showToast('No matches found. Try adjusting your criteria.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to find matches. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-saffron to-swachh-marigold-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Seller <GradientText>Matching</GradientText>
              </h1>
              <p className="text-muted-foreground">Find the perfect carbon credit sellers</p>
            </div>
          </div>
        </motion.div>

        {/* Search Form */}
        <GlassCard className="p-6 mb-8" hover={false}>
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-swachh-green-500" />
            <h2 className="text-lg font-semibold font-display">Search Criteria</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="credits" className="flex items-center space-x-2">
                  <Leaf className="w-4 h-4 text-swachh-green-500" />
                  <span>Credits Needed *</span>
                </Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits_needed}
                  onChange={(e) => setFormData({ ...formData, credits_needed: e.target.value })}
                  placeholder="e.g., 1000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center space-x-2">
                  <IndianRupee className="w-4 h-4 text-swachh-marigold-500" />
                  <span>Max Price (₹/credit)</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                  placeholder="e.g., 500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vintage" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-swachh-saffron" />
                  <span>Preferred Vintage</span>
                </Label>
                <Input
                  id="vintage"
                  type="number"
                  value={formData.preferred_vintage}
                  onChange={(e) => setFormData({ ...formData, preferred_vintage: e.target.value })}
                  placeholder="e.g., 2023"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-swachh-green-600" />
                  <span>Project Type</span>
                </Label>
                <Select
                  value={formData.preferred_project_type}
                  onValueChange={(value) => setFormData({ ...formData, preferred_project_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value || 'any'}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full md:w-auto"
                disabled={loading || !formData.credits_needed}
              >
                {loading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Finding Matches...' : 'Find Matches'}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Results */}
        <AnimatePresence mode="wait">
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">
                  Found <GradientText>{matches.length}</GradientText> Matches
                </h2>
                <Badge variant="default" className="text-sm">
                  Best matches first
                </Badge>
              </div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {matches.map((match, index) => (
                  <motion.div key={match.listing_id} variants={staggerItem}>
                    <GlassCard className="p-6 h-full" glow={index === 0 ? 'green' : 'none'}>
                      {/* Match Score */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant={match.match_score > 80 ? 'default' : match.match_score > 60 ? 'secondary' : 'outline'}
                          className="flex items-center space-x-1"
                        >
                          <Star className="w-3 h-3" />
                          <span>{match.match_score}% match</span>
                        </Badge>
                        {index === 0 && (
                          <Badge variant="saffron">Best Match</Badge>
                        )}
                      </div>

                      {/* Seller Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold font-display">{match.seller_name}</h3>
                        <p className="text-sm text-muted-foreground">{match.project_type}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="glass rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-swachh-green-500">
                            {match.available_credits}
                          </p>
                          <p className="text-xs text-muted-foreground">Credits Available</p>
                        </div>
                        <div className="glass rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-swachh-marigold-500">
                            ₹{match.price_per_credit}
                          </p>
                          <p className="text-xs text-muted-foreground">Per Credit</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Vintage</span>
                          <span className="font-medium">{match.vintage}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Verification</span>
                          <Badge variant="outline" className="text-xs">
                            {match.verification_status}
                          </Badge>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      {match.match_reasons && match.match_reasons.length > 0 && (
                        <div className="mb-4 p-3 bg-swachh-green-500/5 rounded-lg">
                          <p className="text-xs font-medium text-swachh-green-600 mb-1">Why this match?</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {match.match_reasons.slice(0, 2).map((reason, i) => (
                              <li key={i} className="flex items-start space-x-1">
                                <span className="text-swachh-green-500">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contact Button */}
                      <Button
                        variant="gradient"
                        className="w-full"
                        onClick={() => showToast('Contact feature coming soon!', 'error')}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && matches.length === 0 && formData.credits_needed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria to find more sellers
            </p>
            <Button
              variant="outline"
              onClick={() => setFormData({ credits_needed: '', max_price: '', preferred_vintage: '', preferred_project_type: '' })}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Initial State */}
        {!loading && matches.length === 0 && !formData.credits_needed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-swachh-green-500/20 to-swachh-marigold-500/20 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-swachh-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Your Perfect Match</h3>
            <p className="text-muted-foreground">
              Enter your requirements above to discover matched sellers
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
