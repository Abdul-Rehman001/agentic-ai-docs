"use client";
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocItem {
  slug: string;
  title: string;
}

interface PageNavigationProps {
  prevDoc: DocItem | null;
  nextDoc: DocItem | null;
}

export default function PageNavigation({ prevDoc, nextDoc }: PageNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' && prevDoc) {
        router.push(`/${prevDoc.slug}`);
      } else if (e.key === 'ArrowRight' && nextDoc) {
        router.push(`/${nextDoc.slug}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDoc, nextDoc, router]);

  if (!prevDoc && !nextDoc) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prevDoc ? (
        <Link 
          href={`/${prevDoc.slug}`}
          className="flex flex-col gap-1 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group shadow-sm dark:shadow-none"
        >
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Previous
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors truncate">
            {prevDoc.title}
          </div>
        </Link>
      ) : <div />}

      {nextDoc ? (
        <Link 
          href={`/${nextDoc.slug}`}
          className="flex flex-col gap-1 p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors group items-end text-right shadow-sm dark:shadow-none"
        >
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            Next
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors truncate">
            {nextDoc.title}
          </div>
        </Link>
      ) : <div />}
    </div>
  );
}
