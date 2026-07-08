"use client";

import { Share2, Download, Edit3, Check } from 'lucide-react';
import { useState } from 'react';

interface PageToolbarProps {
  slug: string;
}

export default function PageToolbar({ slug }: PageToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Construct the github edit url. Assuming repo structure where markdown files are at root or in docs folder.
  const editUrl = `https://github.com/Abdul-Rehman001/agentic-ai-docs/edit/main/${slug}.md`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button 
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm"
        title="Copy Link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied!' : 'Share'}</span>
      </button>

      <button 
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm"
        title="Download as PDF"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Download</span>
      </button>

      <a 
        href={editUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm"
        title="Suggest an edit on GitHub"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Suggest Edit</span>
      </a>
    </div>
  );
}
