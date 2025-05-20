import React from 'react';

export function Footer() {
  const links = [
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Contact', href: 'mailto:info@forefun.golf' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-secondary hover:text-primary transition-colors duration-DEFAULT"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}