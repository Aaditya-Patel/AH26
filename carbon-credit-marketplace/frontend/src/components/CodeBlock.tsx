import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  animated?: boolean;
}

interface CodeLine {
  content: string;
  type: 'keyword' | 'string' | 'comment' | 'normal' | 'class' | 'function';
}

function highlightCode(code: string): CodeLine[] {
  const lines = code.split('\n');
  return lines.map(line => {
    // Simple syntax highlighting
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return { content: line, type: 'comment' };
    }
    if (line.includes('class ') || line.includes('def ') || line.includes('function ')) {
      return { content: line, type: 'class' };
    }
    if (/(const|let|var|import|export|from|return|if|else|async|await)/.test(line)) {
      return { content: line, type: 'keyword' };
    }
    if (/".*"|'.*'|`.*`/.test(line)) {
      return { content: line, type: 'string' };
    }
    return { content: line, type: 'normal' };
  });
}

export function CodeBlock({
  code,
  language = 'typescript',
  showLineNumbers = true,
  className,
  animated = true,
}: CodeBlockProps) {
  const highlightedLines = highlightCode(code);

  const typeColors = {
    keyword: 'text-swachh-marigold-400',
    string: 'text-swachh-saffron',
    comment: 'text-gray-500',
    normal: 'text-swachh-green-400',
    class: 'text-swachh-marigold-500',
    function: 'text-swachh-green-500',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className={cn(
        'code-block overflow-hidden',
        'bg-swachh-black/95 dark:bg-swachh-black/80',
        'border border-swachh-green-500/20',
        'shadow-lg shadow-swachh-green-500/5',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-swachh-green-500/20 bg-swachh-black/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 ml-2 font-mono">{language}</span>
      </div>

      {/* Code Content */}
      <motion.div
        className="p-4 overflow-x-auto"
        variants={animated ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
      >
        <pre className="font-mono text-sm leading-relaxed">
          {highlightedLines.map((line, index) => (
            <motion.div
              key={index}
              className="flex"
              variants={animated ? lineVariants : undefined}
            >
              {showLineNumbers && (
                <span className="w-8 text-right pr-4 text-gray-600 select-none">
                  {index + 1}
                </span>
              )}
              <span className={cn(typeColors[line.type])}>
                {line.content || ' '}
              </span>
            </motion.div>
          ))}
        </pre>
      </motion.div>
    </motion.div>
  );
}

// Hero code display for landing page
export function HeroCodeBlock() {
  const code = `class CarbonMarketplaceAgent {
  // AI-Powered Carbon Credit Trading
  
  async calculateFootprint(data) {
    return await this.ai.analyze(data);
  }
  
  async matchBuyerSeller(criteria) {
    return await this.ai.matchOptimal(criteria);
  }
  
  async processTransaction(credit) {
    return await this.blockchain.verify(credit);
  }
}`;

  return (
    <CodeBlock
      code={code}
      language="CarbonMarketplace.ts"
      className="max-w-lg mx-auto"
      animated
    />
  );
}

export default CodeBlock;
