import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="50" cy="50" r="48" fill="url(#gradient)" stroke="white" strokeWidth="2" />
        <defs>
            <radialGradient id="gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'hsl(28, 80%, 50%)'}} />
            </radialGradient>
        </defs>
        <path d="M20,85 Q50,95 80,85 L80,95 Q50,105 20,95 Z" fill="hsl(var(--secondary))" />
        <path d="M30 70 Q 40 50, 50 30" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50 75 Q 55 55, 60 35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M70 80 Q 65 60, 70 40" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M45 35 L 50 30 L 55 35 Z" fill="white" />
        <path d="M55 40 L 60 35 L 65 40 Z" fill="white" />
        <path d="M65 45 L 70 40 L 75 45 Z" fill="white" />
    </svg>
  );
}