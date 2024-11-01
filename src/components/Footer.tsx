import React from 'react';

const DEBUG = true;

const Footer: React.FC = () => {
  if (DEBUG) console.log('🎨 Footer rendering');

  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2024 ひとりあそび研究所. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;