import fs from 'fs';
import path from 'path';

// Using parent directory to access the MD files created by the user
const docsDirectory = path.join(process.cwd(), '..');

export function getDocSlugs() {
  const files = fs.readdirSync(docsDirectory);
  return files.filter(file => file.endsWith('.md'));
}

export function getDocBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(docsDirectory, `${realSlug}.md`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return { slug: realSlug, content: fileContents };
  } catch (error) {
    return null;
  }
}

export function getAllDocs() {
  const slugs = getDocSlugs();
  const docs = slugs.map((slug) => {
    // Generate a pretty title from the slug
    // e.g., "01-llm-fundamentals-and-tool-calling.md" -> "1. LLM Fundamentals And Tool Calling"
    // "glossary.md" -> "Glossary"
    let title = slug.replace(/\.md$/, '').replace(/-/g, ' ');
    // Handle numbering (e.g., "01 ")
    const match = title.match(/^(\d+)\s(.*)/);
    if (match) {
      title = `${parseInt(match[1], 10)}. ${match[2]}`;
    }
    // Capitalize words
    title = title.replace(/\b\w/g, l => l.toUpperCase());

    return {
      slug: slug.replace(/\.md$/, ''),
      title: title,
    };
  });
  
  // Sort docs: Numbers first (01, 02), then README, then Glossary
  return docs.sort((a, b) => {
    if (a.slug.toLowerCase() === 'readme') return -1;
    if (b.slug.toLowerCase() === 'readme') return 1;
    if (a.slug.toLowerCase() === 'glossary') return 1;
    if (b.slug.toLowerCase() === 'glossary') return -1;
    return a.slug.localeCompare(b.slug);
  });
}
