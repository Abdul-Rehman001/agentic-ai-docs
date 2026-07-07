"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, FileText, ChevronRight, Menu, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useProgress } from './ProgressContext';

export default function AppLayout({ children, docs }: { children: React.ReactNode, docs: any[] }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();
  const { completedModules, isCompleted } = useProgress();

  // Only count actual numbered modules for progress (exclude README/Glossary)
  const learningModules = docs.filter(d => !['readme', 'glossary'].includes(d.slug.toLowerCase()));
  const totalModules = learningModules.length;
  // Calculate how many of the completed slugs are actually learning modules
  const completedCount = completedModules.filter(slug => learningModules.some(m => m.slug === slug)).length;
  const progressPercent = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

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
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 whitespace-nowrap">
            Agentic AI
          </span>
        </Link>
        {isDesktopCollapsed && (
          <Link href="/" className="mx-auto hidden md:flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold shadow-lg">
            AI
          </Link>
        )}
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {!isDesktopCollapsed && (
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-6 mt-2">
            Modules
          </div>
        )}
        {docs.map((doc) => {
          const isReadme = doc.slug.toLowerCase() === 'readme';
          const isGlossary = doc.slug.toLowerCase() === 'glossary';
          const isActive = pathname === `/${doc.slug}`;
          
          return (
            <Link
              key={doc.slug}
              href={`/${doc.slug}`}
              title={doc.title}
              className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${isActive ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {isReadme ? (
                  <Book className="w-4 h-4" />
                ) : isGlossary ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold transition-colors ${
                    isCompleted(doc.slug)
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : isActive 
                        ? 'border-blue-400 text-blue-400' 
                        : 'border-gray-600 text-gray-500 group-hover:border-blue-400 group-hover:text-blue-400'
                  }`}>
                    {isCompleted(doc.slug) ? <CheckCircle2 className="w-2.5 h-2.5" /> : (doc.title.match(/^\d+/)?.[0] || '•')}
                  </div>
                )}
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
      
      {!isDesktopCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs text-blue-300/80 font-medium">Progress</p>
              <p className="text-[10px] text-gray-400 font-medium">{completedCount} / {totalModules} Modules</p>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#09090b]">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
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
          className="hidden md:flex absolute -right-3.5 top-6 w-7 h-7 bg-[#1a1a1f] border border-border rounded-full items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all z-50 shadow-sm"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, rgba(59, 130, 246, 0.25) 45%, #09090b 85%, #000000 100%)'
        }}
      >
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-border flex items-center px-4 bg-sidebar z-10 shrink-0 shadow-sm">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 ml-2 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
            AI
          </div>
          <span className="font-bold ml-2.5 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 text-sm">
            Agentic AI
          </span>
        </header>

        {/* Content Area with Depth (Gray Container) */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth p-4 sm:p-6 md:p-8 lg:p-12">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
          
          <div className="max-w-4xl mx-auto bg-[#121214] border border-white/5 rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
