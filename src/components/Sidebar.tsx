import Link from 'next/link';
import { getAllDocs } from '@/lib/markdown';
import { Book, FileText, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const docs = getAllDocs();

  return (
    <aside className="w-72 bg-sidebar border-r border-border h-screen sticky top-0 overflow-y-auto flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-blue-500/25 transition-all">
            AI
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            Agentic AI
          </span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-6">
        
        {/* Getting Started Section */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
            Getting Started
          </div>
          {docs.filter(d => ['readme', 'glossary'].includes(d.slug.toLowerCase())).map((doc) => (
            <Link
              key={doc.slug}
              href={`/${doc.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
            >
              {doc.slug.toLowerCase() === 'readme' ? (
                <Book className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              )}
              <span className="truncate flex-1">{doc.title}</span>
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-500" />
            </Link>
          ))}
        </div>

        {/* Prerequisites Section */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
            Prerequisites
          </div>
          {docs.filter(d => d.slug.startsWith('00-')).map((doc) => (
            <Link
              key={doc.slug}
              href={`/${doc.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
            >
              <div className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-500 group-hover:border-blue-500 dark:group-hover:border-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {doc.title.match(/^\d+/)?.[0] || '•'}
              </div>
              <span className="truncate flex-1">{doc.title.replace(/^\d+\.\s/, '')}</span>
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-500" />
            </Link>
          ))}
        </div>

        {/* Core Modules Section */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
            Core Curriculum
          </div>
          {docs.filter(d => !['readme', 'glossary'].includes(d.slug.toLowerCase()) && !d.slug.startsWith('00-')).map((doc) => (
            <Link
              key={doc.slug}
              href={`/${doc.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
            >
              <div className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-500 group-hover:border-blue-500 dark:group-hover:border-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {doc.title.match(/^\d+/)?.[0] || '•'}
              </div>
              <span className="truncate flex-1">{doc.title.replace(/^\d+\.\s/, '')}</span>
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-500" />
            </Link>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-300/80 mb-2 font-medium">Progress</p>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-1/4 rounded-full"></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-right">1 / 10 Modules</p>
        </div>
      </div>
    </aside>
  );
}
