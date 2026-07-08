import { getAllDocs } from '@/lib/markdown';

export async function GET() {
  const docs = getAllDocs();
  
  let content = `# Agentic AI Handbook - Full Documentation\n\n`;
  content += `> This file is optimized for LLMs (Claude, GPT, Gemini) to ingest the entire handbook context at once.\n\n`;

  docs.forEach(doc => {
    content += `\n\n================================================================================\n`;
    content += `# DOCUMENT: ${doc.title}\n`;
    content += `================================================================================\n\n`;
    content += doc.content;
  });

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
