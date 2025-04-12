'use client';

import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'default' | 'slide-up' | 'slide-left' | 'fade' | 'none';
}

const variants = {
  'default': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  'slide-left': {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  },
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'none': {
    initial: {},
    animate: {},
    exit: {}
  }
};

const PageTransition = ({ 
  children, 
  mode = 'default' 
}: PageTransitionProps) => {
  // Get the animation variant based on the mode
  const variant = variants[mode];
  
  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 