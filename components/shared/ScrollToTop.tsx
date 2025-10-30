// components/scroll-to-top-advanced.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  smooth?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showProgress?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScrollToTop({
  threshold = 300,
  className,
  smooth = true,
  position = 'bottom-right',
  showProgress = false,
  icon = <ChevronUp className="h-5 w-5" />,
  size = 'md'
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);

      if (scrollTop > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed z-50',
            positionClasses[position],
            className
          )}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <div className="relative">
            {showProgress && (
              <svg className="absolute inset-0 -m-1 transform -rotate-90" width="100%" height="100%">
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-primary/20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="100"
                  strokeDashoffset={100 - scrollProgress}
                  className="text-primary transition-all duration-150"
                  strokeLinecap="round"
                />
              </svg>
            )}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={scrollToTop}
                size="icon"
                className={cn(
                  'rounded-full shadow-lg relative',
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary/90',
                  'transition-colors duration-200',
                  sizeClasses[size]
                )}
                aria-label="Scroll to top"
              >
                {icon}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}