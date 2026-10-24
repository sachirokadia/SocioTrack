import React from 'react';

// Shared city skyline for the auth screens (login / register), taken
// from the promo's middle phone: coloured buildings, sun, clouds and
// people walking along the bottom.
const CitySkyline: React.FC = () => (
  <svg
    className="relative z-0 w-full h-48 sm:h-56 -mb-1"
    viewBox="0 0 800 200"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <circle cx="680" cy="35" r="22" fill="#fde68a" opacity="0.9" />
    <ellipse cx="150" cy="30" rx="55" ry="14" fill="#ffffff" opacity="0.7" />
    <ellipse cx="420" cy="22" rx="45" ry="12" fill="#ffffff" opacity="0.6" />
    <rect x="20" y="70" width="70" height="130" fill="#3aa99e" />
    <rect x="95" y="100" width="55" height="100" fill="#f2a65a" />
    <rect x="155" y="55" width="80" height="145" fill="#e85d75" />
    <rect x="240" y="90" width="60" height="110" fill="#7ec850" />
    <rect x="305" y="60" width="90" height="140" fill="#4db6a6" />
    <rect x="400" y="105" width="55" height="95" fill="#f2a65a" />
    <rect x="460" y="70" width="75" height="130" fill="#e85d75" />
    <rect x="540" y="95" width="60" height="105" fill="#3aa99e" />
    <rect x="605" y="60" width="85" height="140" fill="#7ec850" />
    <rect x="695" y="100" width="60" height="100" fill="#4db6a6" />
    <rect x="0" y="185" width="800" height="15" fill="#2f9e8f" />
    {[35, 55, 75, 95, 115, 135, 155].map((y) => (
      <rect key={y} x="40" y={y} width="12" height="10" fill="#fef3c7" opacity="0.85" />
    ))}
    {[70, 90, 110, 130].map((y) => (
      <rect key={y} x="175" y={y} width="12" height="10" fill="#fef3c7" opacity="0.85" />
    ))}
    <circle cx="330" cy="172" r="6" fill="#1f2937" />
    <rect x="324" y="178" width="12" height="14" rx="4" fill="#1f2937" />
    <circle cx="470" cy="172" r="6" fill="#1f2937" />
    <rect x="464" y="178" width="12" height="14" rx="4" fill="#1f2937" />
  </svg>
);

export default CitySkyline;
