"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  flowchart: { htmlLabels: true },
  themeVariables: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    primaryColor: '#09090b',
    primaryTextColor: '#fafafa',
    primaryBorderColor: '#3b82f6',
    lineColor: '#38bdf8',
    secondaryColor: '#172554',
    tertiaryColor: '#1e1b4b',
    // Sequence Diagram
    actorBkg: '#09090b',
    actorBorder: '#3b82f6',
    actorTextColor: '#fafafa',
    actorLineColor: '#38bdf8',
    signalColor: '#7dd3fc',
    signalTextColor: '#ffffff',
    noteBkgColor: '#172554',
    noteBkg: '#172554',
    noteBorderColor: '#3b82f6',
    noteTextColor: '#fafafa',
    // Flowchart
    nodeBkg: '#09090b',
    nodeBorder: '#3b82f6',
    nodeTextColor: '#fafafa',
    clusterBkg: 'rgba(59, 130, 246, 0.05)',
    clusterBorder: 'rgba(59, 130, 246, 0.4)',
    edgeLabelBackground: '#09090b',
  }
});

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (ref.current && !hasRendered) {
      const renderChart = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substring(7)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid render error', error);
        }
      };
      renderChart();
      setHasRendered(true);
    }
  }, [chart, hasRendered]);

  return <div ref={ref} className="flex justify-center my-8 overflow-x-auto w-full max-w-full" />;
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none 
      prose-headings:font-semibold prose-headings:tracking-tight 
      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
      prose-code:text-blue-300 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-gray-800
      prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-950/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      prose-li:marker:text-gray-600
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match && match[1] === 'mermaid') {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
