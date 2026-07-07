import { getDocBySlug, getDocSlugs } from '@/lib/markdown';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ModuleProgressCheckbox from '@/components/ModuleProgressCheckbox';
import { notFound } from 'next/navigation';

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

  const isLearningModule = !['readme', 'glossary'].includes(resolvedParams.slug.toLowerCase());

  return (
    <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <MarkdownRenderer content={doc.content} />
      {isLearningModule && (
        <ModuleProgressCheckbox slug={resolvedParams.slug} />
      )}
    </article>
  );
}
