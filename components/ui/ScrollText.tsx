'use client';

import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  text: string;
  as?: 'h2' | 'p';
  className?: string;
};

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const word = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/** Text whose words appear one after another once it scrolls into view. */
export function ScrollText({ text, as = 'p', className }: Props) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (reduceMotion) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }} aria-label={text}>
      {text.split(' ').map((item, index) => (
        <motion.span key={`${item}-${index}`} variants={word} className="mr-[0.25em] inline-block">
          {item}
        </motion.span>
      ))}
    </Tag>
  );
}
