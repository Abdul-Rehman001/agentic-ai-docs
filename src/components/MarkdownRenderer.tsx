"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Copy, Check, Target, Wrench, BookOpen, Search, ArrowRight, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
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

  return (
    <div className="w-full overflow-x-auto my-8 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <div ref={ref} className="min-w-max flex justify-center mx-auto" />
    </div>
  );
};

const EMOJI_MAP: Record<string, React.ReactNode> = {
  '🎯': <Target className="inline-block w-5 h-5 text-purple-500 mr-2 -mt-1" />,
  '🛠️': <Wrench className="inline-block w-5 h-5 text-gray-500 mr-2 -mt-1" />,
  '📖': <BookOpen className="inline-block w-5 h-5 text-blue-500 mr-2 -mt-1" />,
  '🔍': <Search className="inline-block w-5 h-5 text-indigo-500 mr-2 -mt-1" />,
  '➡️': <ArrowRight className="inline-block w-4 h-4 text-blue-500 mx-1 -mt-0.5" />,
  '✅': <CheckCircle2 className="inline-block w-5 h-5 text-green-500 mr-1.5 -mt-0.5" />,
  '⚠️': <AlertTriangle className="inline-block w-5 h-5 text-yellow-500 mr-1.5 -mt-0.5" />,
  '❌': <XCircle className="inline-block w-5 h-5 text-red-500 mr-1.5 -mt-0.5" />,
  '💡': <Lightbulb className="inline-block w-5 h-5 text-yellow-400 mr-1 -mt-0.5" />
};

function processText(text: string): React.ReactNode {
  const regex = new RegExp(`(${Object.keys(EMOJI_MAP).join('|')})`, 'g');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  
  return (
    <>
      {parts.map((part, i) => {
        if (EMOJI_MAP[part]) {
          return <React.Fragment key={i}>{EMOJI_MAP[part]}</React.Fragment>;
        }
        return part;
      })}
    </>
  );
}

function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    return processText(children);
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => <React.Fragment key={i}>{processChildren(child)}</React.Fragment>);
  }
  return children;
}

const PreComponent = ({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Check if this pre block contains a custom interactive component (mermaid or quiz)
  // react-markdown passes the code element as children
  let isCustomInteractive = false;
  if (React.isValidElement(children)) {
    const childProps = children.props as { className?: string };
    if (typeof childProps.className === 'string' && (childProps.className.includes('language-mermaid') || childProps.className.includes('language-quiz'))) {
      isCustomInteractive = true;
    }
  }

  // If it's a custom interactive component, don't wrap it in a <pre> or add a copy button.
  // Just render it directly so it handles its own styling and wrapping.
  if (isCustomInteractive) {
    return <>{children}</>;
  }

  const handleCopy = () => {
    if (preRef.current) {
      const text = preRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-6">
      <button 
        onClick={handleCopy}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 dark:text-blue-300 rounded-md p-1.5 z-10 flex items-center justify-center backdrop-blur-sm"
        title="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre ref={preRef} className={`mt-0! mb-0! overflow-x-auto ${className || ''}`} {...props}>
        {children}
      </pre>
    </div>
  );
};

const QuizComponent = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  const questionLine = lines.find(l => l.startsWith('Q: '));
  const explanationLine = lines.find(l => l.startsWith('Explanation: '));
  const options = lines.filter(l => l.startsWith('- [ ]') || l.startsWith('- [x]')).map(l => {
    return {
      text: l.substring(6).trim(),
      isCorrect: l.startsWith('- [x]')
    };
  });

  const question = questionLine ? questionLine.replace('Q: ', '') : '';
  const explanation = explanationLine ? explanationLine.replace('Explanation: ', '') : '';

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="my-8 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#121214] p-6 shadow-md dark:shadow-xl not-prose text-base font-sans whitespace-normal">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Knowledge Check</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-6">{question}</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isSubmitted = selectedIdx !== null;
          let optClass = "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300";
          
          if (isSubmitted) {
            if (opt.isCorrect) optClass = "border-green-500/50 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400";
            else if (isSelected && !opt.isCorrect) optClass = "border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400";
            else optClass = "border-gray-100 dark:border-white/5 bg-transparent opacity-50 text-gray-500";
          }

          return (
            <button 
              key={idx}
              disabled={isSubmitted}
              onClick={() => { setSelectedIdx(idx); setShowExplanation(true); }}
              className={`text-left px-4 py-3 rounded-lg border transition-all ${optClass}`}
            >
              {opt.text}
            </button>
          )
        })}
      </div>
      {showExplanation && (
        <div className={`mt-6 p-4 rounded-lg text-sm border ${options[selectedIdx!]?.isCorrect ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-200'}`}>
          <span className="font-bold">{options[selectedIdx!]?.isCorrect ? 'Correct!' : 'Incorrect.'}</span> {explanation}
        </div>
      )}
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert sm:prose-lg max-w-none 
      prose-headings:font-semibold prose-headings:tracking-tight 
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300
      prose-code:text-blue-800 dark:prose-code:text-blue-300 prose-code:bg-blue-100 dark:prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-gray-100 dark:prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800
      prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      prose-li:marker:text-gray-400 dark:prose-li:marker:text-gray-600
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          table({ children, ...props }) {
            return (
              <div className="w-full overflow-x-auto my-8 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <table className="min-w-full" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          p: ({ children, ...props }) => <p {...props}>{processChildren(children)}</p>,
          li: ({ children, ...props }) => <li {...props}>{processChildren(children)}</li>,
          td: ({ children, ...props }) => <td {...props}>{processChildren(children)}</td>,
          th: ({ children, ...props }) => <th {...props}>{processChildren(children)}</th>,
          h1: ({ children, ...props }) => <h1 {...props}>{processChildren(children)}</h1>,
          h3: ({ children, ...props }) => <h3 {...props}>{processChildren(children)}</h3>,
          h4: ({ children, ...props }) => <h4 {...props}>{processChildren(children)}</h4>,
          blockquote: ({ children, ...props }) => <blockquote {...props}>{processChildren(children)}</blockquote>,
          pre: PreComponent,
          h2({ children, ...props }) {
            const text = String(children);
            if (text.includes('Common Pitfalls')) {
              return (
                <h2 {...props} className="flex items-center gap-2 text-red-500 dark:text-red-400 border-b border-red-500/20 pb-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>{children}</span>
                </h2>
              );
            }
            return <h2 {...props}>{processChildren(children)}</h2>;
          },
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match && match[1] === 'mermaid') {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />;
            }
            if (match && match[1] === 'quiz') {
              return <QuizComponent content={String(children)} />;
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
