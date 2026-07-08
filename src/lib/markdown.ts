import fs from 'fs';
import path from 'path';

// Using current directory since the MD files are now in the project root
const docsDirectory = process.cwd();

export function getDocSlugs() {
  const files = fs.readdirSync(docsDirectory);
  return files.filter(file => 
    file.endsWith('.md') && 
    file !== 'AGENTS.md' && 
    file !== 'CLAUDE.md'
  );
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

    const fullPath = path.join(docsDirectory, slug);
    const content = fs.readFileSync(fullPath, 'utf8');

    return {
      slug: slug.replace(/\.md$/, ''),
      title: title,
      content: content,
    };
  });
  
  // Sort docs: start-here first, then readme, then glossary, then numbers
  return docs.sort((a, b) => {
    const slugA = a.slug.toLowerCase();
    const slugB = b.slug.toLowerCase();
    if (slugA === 'start-here') return -1;
    if (slugB === 'start-here') return 1;
    if (slugA === 'readme') return -1;
    if (slugB === 'readme') return 1;
    if (slugA === 'glossary') return 1;
    if (slugB === 'glossary') return -1;
    return slugA.localeCompare(slugB);
  });
}
