import React, { useState } from 'react';
import { Send, Search, AlertCircle, CheckCircle } from 'lucide-react';

// Header Component
const Header = () => {
  return (
    <header className="relative flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
      <div className="flex items-center relative">
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-full"></div>
        <span className="font-bold text-white text-xl tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
          Langgraph Search Agent
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header