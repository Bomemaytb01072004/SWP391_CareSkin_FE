import React, { useState, useEffect } from 'react';

function Header() {
  const messages = [
    'FREE SHIPPING FOR CARESKINCLUB MEMBERS AND ALL ORDERS IN APP',
    'EXCLUSIVE DISCOUNTS FOR APP USERS',
    'NEW ARRIVALS JUST DROPPED! CHECK THEM OUT',
    'JOIN THE CARESKINCLUB FOR SPECIAL PERKS',
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <header className="w-full bg-black z-50 border-b-[0.0625rem] border-gray-200">
      <div className="flex items-center justify-center py-2 max-w-full overflow-hidden">
        <p className="text-sm text-slate-50 text-center whitespace-normal">
          {messages[currentMessageIndex]}
        </p>
      </div>
    </header>
  );
}

export default Header;
