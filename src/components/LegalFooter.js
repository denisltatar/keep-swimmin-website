import React from 'react';
import { Link } from 'react-router-dom';
import WhaleMark from '../assets/Keep Swimmin Whale-01 2.png';

const LegalFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <img src={WhaleMark} alt="" className="h-6 w-6 rounded-md object-contain" width={24} height={24} />
            <span>Keep Swimmin&apos;</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <Link to="/terms" className="transition hover:text-slate-800">
              Terms of Service
            </Link>
            <Link to="/privacy" className="transition hover:text-slate-800">
              Privacy Policy
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 sm:text-left">
          &copy; {year} Keep Swimmin&apos;. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default LegalFooter;
