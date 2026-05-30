"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return <p className="text-text-muted italic text-xs">No README content provided.</p>;

  // Inline formatting parser
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    let workingText = text;

    interface Token {
      type: "text" | "code" | "bold" | "italic" | "link";
      content: string;
      linkUrl?: string;
    }

    let tokens: Token[] = [{ type: "text", content: workingText }];

    // 1. Parse inline code: `code`
    tokens = tokens.flatMap((token): Token[] => {
      if (token.type !== "text") return [token];
      const parts = token.content.split(/(`[^`\n]+`)/g);
      return parts.map((part): Token => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return { type: "code", content: part.slice(1, -1) };
        }
        return { type: "text", content: part };
      });
    });

    // 2. Parse bold: **text**
    tokens = tokens.flatMap((token): Token[] => {
      if (token.type !== "text") return [token];
      const parts = token.content.split(/(\*\*[^\*\n]+\*\*)/g);
      return parts.map((part): Token => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return { type: "bold", content: part.slice(2, -2) };
        }
        return { type: "text", content: part };
      });
    });

    // 3. Parse italic: *text*
    tokens = tokens.flatMap((token): Token[] => {
      if (token.type !== "text") return [token];
      const parts = token.content.split(/(\*[^\*\n]+\*)/g);
      return parts.map((part): Token => {
        if (part.startsWith("*") && part.endsWith("*")) {
          return { type: "italic", content: part.slice(1, -1) };
        }
        return { type: "text", content: part };
      });
    });

    // 4. Parse links: [label](url)
    tokens = tokens.flatMap((token): Token[] => {
      if (token.type !== "text") return [token];
      const parts = token.content.split(/(\[[^\]\n]+\]\([^\)\n]+\))/g);
      return parts.map((part): Token => {
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            return { type: "link", content: match[1], linkUrl: match[2] };
          }
        }
        return { type: "text", content: part };
      });
    });

    return tokens.map((token, idx) => {
      switch (token.type) {
        case "code":
          return (
            <code key={idx} className="bg-deep-archive px-1.5 py-0.5 rounded-xs border border-white/10 font-mono text-[11px] text-growth">
              {token.content}
            </code>
          );
        case "bold":
          return (
            <strong key={idx} className="font-bold text-text-primary">
              {token.content}
            </strong>
          );
        case "italic":
          return (
            <em key={idx} className="italic text-text-secondary">
              {token.content}
            </em>
          );
        case "link":
          return (
            <a
              key={idx}
              href={token.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-reflection-blue hover:underline font-mono text-xs transition-colors"
            >
              {token.content}
            </a>
          );
        default:
          return <span key={idx}>{token.content}</span>;
      }
    });
  };

  // Split lines and parse blocks
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockLines: string[] = [];

  const CodeBlockComponent = ({ code, language }: { code: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    };

    return (
      <div className="my-4 rounded-xs border border-white/10 bg-deep-archive overflow-hidden font-mono text-xs shadow-md">
        <div className="flex justify-between items-center bg-white/[0.02] px-4 py-2 border-b border-white/5">
          <div className="flex items-center space-x-2 text-[10px] text-text-muted uppercase tracking-wider">
            <Terminal size={10} className="text-growth" />
            <span>{language || "code"}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-[10px] text-text-muted hover:text-text-primary transition-colors p-1"
          >
            {copied ? (
              <>
                <Check size={10} className="text-growth" />
                <span className="text-growth">COPIED</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-text-secondary select-all custom-scrollbar bg-black/20">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks (```)
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // Close code block
        const codeText = codeBlockLines.join("\n");
        const lang = codeBlockLanguage;
        blocks.push(
          <CodeBlockComponent key={`code-${i}`} code={codeText} language={lang} />
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Open code block
        inCodeBlock = true;
        codeBlockLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-white/10" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        const parsedChildren = parseInlineMarkdown(headingText);

        switch (level) {
          case 1:
            blocks.push(
              <h1 key={`h1-${i}`} className="font-serif text-2xl text-text-primary mt-6 mb-3 pb-2 border-b border-white/5 font-semibold">
                {parsedChildren}
              </h1>
            );
            break;
          case 2:
            blocks.push(
              <h2 key={`h2-${i}`} className="font-serif text-xl text-text-primary mt-5 mb-2.5 pb-1.5 border-b border-white/5 font-medium">
                {parsedChildren}
              </h2>
            );
            break;
          case 3:
            blocks.push(
              <h3 key={`h3-${i}`} className="font-serif text-base text-text-primary mt-4 mb-2 font-medium">
                {parsedChildren}
              </h3>
            );
            break;
          default:
            blocks.push(
              <h4 key={`h4-${i}`} className="font-mono text-xs uppercase tracking-wider text-text-primary mt-4 mb-1.5 font-bold">
                {parsedChildren}
              </h4>
            );
            break;
        }
        continue;
      }
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteText = line.replace(/^\s*>\s*/, "");
      blocks.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-growth/40 bg-white/[0.01] px-4 py-2 my-3 text-text-secondary italic text-xs leading-relaxed">
          {parseInlineMarkdown(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Unordered Checkboxes / Tasks: - [ ] or - [x]
    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("* [ ]") || trimmed.startsWith("* [x]")) {
      const checked = trimmed.includes("[x]");
      const itemText = trimmed.slice(5).trim();
      blocks.push(
        <div key={`task-${i}`} className="flex items-start space-x-3.5 my-2.5 pl-2 font-mono text-xs">
          <div className="mt-0.5 shrink-0">
            {checked ? (
              <div className="w-3.5 h-3.5 rounded-xs bg-growth/20 border border-growth/50 flex items-center justify-center">
                <Check size={10} className="text-growth stroke-[3]" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-xs bg-white/5 border border-white/10" />
            )}
          </div>
          <span className={`text-xs leading-tight ${checked ? "text-text-disabled line-through" : "text-text-secondary"}`}>
            {parseInlineMarkdown(itemText)}
          </span>
        </div>
      );
      continue;
    }

    // Unordered Lists: - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.slice(2);
      blocks.push(
        <div key={`ul-${i}`} className="flex items-start space-x-2 my-1.5 pl-4 font-mono text-xs">
          <span className="text-growth shrink-0 mt-1">•</span>
          <span className="text-xs text-text-secondary leading-relaxed">
            {parseInlineMarkdown(itemText)}
          </span>
        </div>
      );
      continue;
    }

    // Ordered Lists: 1. or 2. etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const num = orderedMatch[1];
      const itemText = orderedMatch[2];
      blocks.push(
        <div key={`ol-${i}`} className="flex items-start space-x-2.5 my-1.5 pl-4 font-mono text-xs">
          <span className="text-text-muted shrink-0">{num}.</span>
          <span className="text-xs text-text-secondary leading-relaxed">
            {parseInlineMarkdown(itemText)}
          </span>
        </div>
      );
      continue;
    }

    // Paragraph
    if (trimmed.length > 0) {
      blocks.push(
        <p key={`p-${i}`} className="text-xs text-text-secondary font-light font-sans leading-relaxed mb-3">
          {parseInlineMarkdown(line)}
        </p>
      );
    } else {
      // Empty line renders small spacer
      blocks.push(<div key={`spacer-${i}`} className="h-2" />);
    }
  }

  return <div className="markdown-body space-y-1">{blocks}</div>;
}
