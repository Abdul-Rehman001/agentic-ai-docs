"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, FileText, ChevronRight, Menu, ChevronLeft, CheckCircle2, Search, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { useProgress } from '@/components/ProgressContext';
import { useTheme } from '@/components/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop';

export default function AppLayout({ children, docs }: { children: React.ReactNode, docs: any[] }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(true);
  const [isPrerequisitesOpen, setIsPrerequisitesOpen] = useState(true);
  const [isCoreCurriculumOpen, setIsCoreCurriculumOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { completedModules, isCompleted } = useProgress();
  const { theme, toggleTheme } = useTheme();

  // Only count actual numbered modules for progress (exclude README/Glossary)
  const learningModules = docs.filter(d => !['readme', 'glossary'].includes(d.slug.toLowerCase()));
  const totalModules = learningModules.length;
  // Calculate how many of the completed slugs are actually learning modules
  const completedCount = completedModules.filter(slug => learningModules.some(m => m.slug === slug)).length;
  const progressPercent = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  // Full-text search implementation (Optimized with useMemo)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const results = [];
    for (const doc of docs) {
      // 1. Title match
      if (doc.title.toLowerCase().includes(query)) {
        results.push({ doc, type: 'title', match: doc.title });
        continue; // Only show title match to prevent duplicate spam
      }

      // 2. Content match (find first occurrence)
      if (doc.content) {
        const matchIndex = doc.content.toLowerCase().indexOf(query);
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(doc.content.length, matchIndex + query.length + 30);
          let snippet = doc.content.substring(start, end).replace(/\n/g, ' ').trim();
          if (start > 0) snippet = '...' + snippet;
          if (end < doc.content.length) snippet = snippet + '...';
          
          results.push({ doc, type: 'content', match: snippet });
        }
      }
    }
    return results.slice(0, 6); // Max 6 results for smaller dropdown
  }, [searchQuery, docs]);


  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isDesktopCollapsed) setIsDesktopCollapsed(false);
        if (!isMobileOpen && window.innerWidth < 768) setIsMobileOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktopCollapsed, isMobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between h-[72px]">
        <Link href="/" className={`flex items-center gap-3 group ${isDesktopCollapsed ? 'hidden md:hidden' : 'flex'}`}>
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            AI
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 whitespace-nowrap">
            Agentic AI
          </span>
        </Link>
        {isDesktopCollapsed && (
          <Link href="/" className="mx-auto hidden md:flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg">
            AI
          </Link>
        )}
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden relative">
        {!isDesktopCollapsed && (
          <div className="px-3 mb-4 relative z-50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search handbook... (Cmd+K)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#121214] border border-gray-300 dark:border-white/5 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[50vh] overflow-y-auto flex flex-col z-50">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-gray-500 text-center italic">No results found</div>
                ) : (
                  searchResults.map((result, idx) => (
                    <Link
                      key={`${result.doc.slug}-${idx}`}
                      href={`/${result.doc.slug}`}
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 flex flex-col gap-0.5 transition-colors"
                    >
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {result.doc.title}
                      </div>
                      {result.type === 'content' && (
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                          {result.match}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        
        {!isDesktopCollapsed && (
          <button 
            onClick={() => setIsGettingStartedOpen(!isGettingStartedOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-6 mt-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span>Getting Started</span>
            {isGettingStartedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
        {isGettingStartedOpen && docs.filter(d => ['start-here', 'readme', 'glossary'].includes(d.slug.toLowerCase())).map((doc) => {
          const isStartHere = doc.slug.toLowerCase() === 'start-here';
          const isReadme = doc.slug.toLowerCase() === 'readme';
          const isGlossary = doc.slug.toLowerCase() === 'glossary';
          const isActive = pathname === `/${doc.slug}`;
          return (
            <Link key={doc.slug} href={`/${doc.slug}`} className={`relative flex items-center ${isDesktopCollapsed ? 'justify-center mx-3 px-0' : 'gap-3 mx-3 px-3'} py-2.5 rounded-lg text-sm transition-all group ${isActive ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <div className="shrink-0 flex items-center justify-center">
                {isStartHere ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : isReadme ? <Book className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              {!isDesktopCollapsed && (
                <>
                  <span className="truncate flex-1">{doc.title}</span>
                  <ChevronRight className={`w-3 h-3 transition-all ${isActive ? 'opacity-100 text-blue-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-500'}`} />
                </>
              )}
            </Link>
          );
        })}

        {!isDesktopCollapsed && (
          <button 
            onClick={() => setIsPrerequisitesOpen(!isPrerequisitesOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-6 mt-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span>Prerequisites</span>
            {isPrerequisitesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
        {isPrerequisitesOpen && docs.filter(d => d.slug.startsWith('00-')).map((doc) => {
          const isActive = pathname === `/${doc.slug}`;
          return (
            <Link key={doc.slug} href={`/${doc.slug}`} className={`relative flex items-center ${isDesktopCollapsed ? 'justify-center mx-3 px-0' : 'gap-3 mx-3 px-3'} py-2.5 rounded-lg text-sm transition-all group ${isActive ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <div className="shrink-0 flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${isCompleted(doc.slug) ? 'border-green-500 bg-green-500/10 text-green-500' : isActive ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'}`}>
                  {isCompleted(doc.slug) ? <CheckCircle2 className="w-3 h-3" /> : (doc.title.match(/^\d+/)?.[0] || '•')}
                </div>
              </div>
              {!isDesktopCollapsed && (
                <>
                  <span className="truncate flex-1">{doc.title.replace(/^\d+\.\s/, '')}</span>
                  <ChevronRight className={`w-3 h-3 transition-all ${isActive ? 'opacity-100 text-blue-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-500'}`} />
                </>
              )}
            </Link>
          );
        })}

        {!isDesktopCollapsed && (
          <button 
            onClick={() => setIsCoreCurriculumOpen(!isCoreCurriculumOpen)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-6 mt-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span>Core Curriculum</span>
            {isCoreCurriculumOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
        {isCoreCurriculumOpen && docs.filter(d => !['start-here', 'readme', 'glossary'].includes(d.slug.toLowerCase()) && !d.slug.startsWith('00-')).map((doc) => {
          const isActive = pathname === `/${doc.slug}`;
          return (
            <Link key={doc.slug} href={`/${doc.slug}`} className={`relative flex items-center ${isDesktopCollapsed ? 'justify-center mx-3 px-0' : 'gap-3 mx-3 px-3'} py-2.5 rounded-lg text-sm transition-all group ${isActive ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
              <div className="shrink-0 flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${isCompleted(doc.slug) ? 'border-green-500 bg-green-500/10 text-green-500' : isActive ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'}`}>
                  {isCompleted(doc.slug) ? <CheckCircle2 className="w-3 h-3" /> : (doc.title.match(/^\d+/)?.[0] || '•')}
                </div>
              </div>
              {!isDesktopCollapsed && (
                <>
                  <span className="truncate flex-1">{doc.title.replace(/^\d+\.\s/, '')}</span>
                  <ChevronRight className={`w-3 h-3 transition-all ${isActive ? 'opacity-100 text-blue-400' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-500'}`} />
                </>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom Section: Progress & Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 backdrop-blur-md shrink-0 flex flex-col gap-3">
        {/* Progress Tracker */}
        {!isDesktopCollapsed && (
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-medium text-blue-500 dark:text-blue-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{completedCount} of {totalModules} modules</span>
              {progressPercent === 100 && (
                <span className="text-green-500 dark:text-green-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <button
            onClick={toggleTheme}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/5`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!isDesktopCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          
          <a
            href="https://github.com/Abdul-Rehman001/agentic-ai-docs"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-white/5 ${isDesktopCollapsed ? 'flex-none' : 'flex-1'}`}
            title="View on GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 shrink-0"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            {!isDesktopCollapsed && <span>GitHub</span>}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden w-full bg-gray-50 dark:bg-[#09090b]">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDesktopCollapsed ? 'md:w-[72px]' : 'w-72 md:w-72'} shrink-0`}
      >
        <SidebarContent />
        
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-6 w-7 h-7 bg-white dark:bg-[#1a1a1f] border border-gray-200 dark:border-white/5 rounded-full items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-all z-50 shadow-sm"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#09090b] transition-colors duration-300">
        {/* Mobile Header */}
        <header className="h-14 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#09090b] flex items-center px-4 md:hidden shrink-0 transition-colors duration-300">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 font-medium text-sm text-gray-900 dark:text-gray-100">Agentic AI Handbook</span>
        </header>

        {/* Content Area with Depth (Gray Container) */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto relative scroll-smooth p-4 sm:p-6 md:p-8 lg:p-12">
          {/* Authentic Radial Gradients */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 opacity-0 dark:opacity-100"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.25) 0%, rgba(59, 130, 246, 0.15) 45%, transparent 85%)'
            }}
          />
          <div 
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 opacity-100 dark:opacity-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.10) 45%, transparent 85%)'
            }}
          />
          
          <div className="relative z-10 max-w-4xl mx-auto bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-2xl p-6 sm:p-8 md:p-12 shadow-xl dark:shadow-2xl transition-colors duration-300">
            {children}
          </div>
        </div>
        <ScrollToTop />
      </main>
    </div>
  );
}
