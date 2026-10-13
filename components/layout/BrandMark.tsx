import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { HOTEL } from '@/lib/hotel-config';

type BrandMarkProps = {
  /** "dark" for light backgrounds, "light" for dark backgrounds and photos. */
  tone?: 'dark' | 'light';
  /** Small caps line under the name. */
  subtitle?: string;
  href?: string;
  className?: string;
};

/** The single hotel logo lockup used by every header, sidebar and auth screen. */
export function BrandMark({ tone = 'dark', subtitle = 'Hotel · Uyo', href = '/', className = '' }: BrandMarkProps) {
  const light = tone === 'light';
  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${light ? 'text-white' : 'text-stone-900'} ${className}`} aria-label={`${HOTEL.name} home`}>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          light ? 'border-white/35 bg-white/10 backdrop-blur-sm' : 'border-stone-300 bg-stone-900 text-amber-200'
        }`}
      >
        <Building2 className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <strong className="block font-serif text-lg tracking-[0.08em]">SKYVIEW</strong>
        <small className={`text-[9px] font-semibold uppercase tracking-[0.24em] ${light ? 'text-amber-200' : 'text-amber-700'}`}>
          {subtitle}
        </small>
      </span>
    </Link>
  );
}
