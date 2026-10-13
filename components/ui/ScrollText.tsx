'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type Props = {
  text: string;
  as?: 'h2' | 'p';
  className?: string;
};

function Word({ word, progress, start, end }: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.08, 1]);
  const y = useTransform(progress, [start, end], [18, 0]);
  const blur = useTransform(progress, [start, end], [6, 0]);
  const filter = useTransform(blur, (value) => `blur(${value}px)`);
  return (
    <motion.span style={{ opacity, y, filter }} className="mr-[0.25em] inline-block will-change-transform">
      {word}
    </motion.span>
  );
}

/** Text whose words fade in one by one as the reader scrolls it into view. */
export function ScrollText({ text, as = 'p', className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.45'] });
  const words = text.split(' ');
  const Tag = motion[as];

  if (reduceMotion) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, index) => (
        <Word key={`${word}-${index}`} word={word} progress={scrollYProgress} start={(index / words.length) * 0.7} end={(index / words.length) * 0.7 + 0.3} />
      ))}
    </Tag>
  );
}
