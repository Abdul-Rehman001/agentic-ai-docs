import { getDocBySlug, getDocSlugs, getAllDocs } from '@/lib/markdown';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ModuleProgressCheckbox from '@/components/ModuleProgressCheckbox';
import PageNavigation from '@/components/PageNavigation';
import PageToolbar from '@/components/PageToolbar';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';

export async function generateStaticParams() {
  const slugs = getDocSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const doc = getDocBySlug(resolvedParams.slug);

  if (!doc) {
    notFound();
  }

  // Calculate reading time
  const wordCount = doc.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Determine Next/Previous
  const allDocs = getAllDocs();
  const currentIndex = allDocs.findIndex(d => d.slug === resolvedParams.slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex !== -1 && currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  const isLearningModule = !['readme', 'glossary'].includes(resolvedParams.slug.toLowerCase());

  return (
    <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Toolbar area */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Reading Time Badge */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 w-fit px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5 shadow-sm">
          <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span>{readingTime} min read</span>
        </div>
        
        {/* Quick Actions (Share, Print, Edit) */}
        <PageToolbar slug={resolvedParams.slug} />
      </div>

      <MarkdownRenderer content={doc.content} />
      
      {isLearningModule && (
        <ModuleProgressCheckbox slug={resolvedParams.slug} />
      )}

      {/* Next / Previous Navigation */}
      <PageNavigation prevDoc={prevDoc} nextDoc={nextDoc} />
    </article>
  );
}
