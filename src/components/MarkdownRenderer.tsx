"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

interface Block {
  type: "paragraph" | "heading" | "code" | "blockquote" | "ul" | "ol" | "todo" | "hr";
  level?: number;
  language?: string;
  content?: string;
  lines?: string[];
  items?: { text: string; checked?: boolean; num?: string }[];
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return <p className="text-text-muted italic text-xs">No README content provided.</p>;

  // Inline formatting parser: **bold**, *italic*, `code`, and [label](url)
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
            <code key={idx} className="bg-deep-archive px-1.5 py-0.5 rounded-xs border border-white/10 font-mono text-[10px] text-growth">
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

  // Split content by lines and compile into structured blocks
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let currentBlock: Block | null = null;

  const closeCurrentBlock = () => {
    if (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  };

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
            className="flex items-center space-x-1 text-[10px] text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
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
        <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-text-secondary select-all custom-scrollbar bg-black/20 text-left">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        // Close code block
        blocks.push({
          type: "code",
          language: codeBlockLanguage,
          content: codeBlockLines.join("\n")
        });
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        codeBlockLines.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      closeCurrentBlock();
      inCodeBlock = true;
      codeBlockLanguage = trimmed.slice(3).trim();
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      closeCurrentBlock();
      blocks.push({ type: "hr" });
      continue;
    }

    // Headings
    if (trimmed.startsWith("#")) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        closeCurrentBlock();
        blocks.push({
          type: "heading",
          level: headingMatch[1].length,
          content: headingMatch[2]
        });
        continue;
      }
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteText = line.replace(/^\s*>\s*/, "");
      if (currentBlock && currentBlock.type === "blockquote") {
        currentBlock.lines?.push(quoteText);
      } else {
        closeCurrentBlock();
        currentBlock = {
          type: "blockquote",
          lines: [quoteText]
        };
      }
      continue;
    }

    // Todo List Items: - [ ] or - [x]
    const todoMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (todoMatch) {
      const checked = todoMatch[1].toLowerCase() === "x";
      const text = todoMatch[2];
      if (currentBlock && currentBlock.type === "todo") {
        currentBlock.items?.push({ text, checked });
      } else {
        closeCurrentBlock();
        currentBlock = {
          type: "todo",
          items: [{ text, checked }]
        };
      }
      continue;
    }

    // Unordered List Items: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      const text = ulMatch[1];
      if (currentBlock && currentBlock.type === "ul") {
        currentBlock.items?.push({ text });
      } else {
        closeCurrentBlock();
        currentBlock = {
          type: "ul",
          items: [{ text }]
        };
      }
      continue;
    }

    // Ordered List Items: 1. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      const num = olMatch[1];
      const text = olMatch[2];
      if (currentBlock && currentBlock.type === "ol") {
        currentBlock.items?.push({ text, num });
      } else {
        closeCurrentBlock();
        currentBlock = {
          type: "ol",
          items: [{ text, num }]
        };
      }
      continue;
    }

    // Empty space/newline
    if (trimmed === "") {
      closeCurrentBlock();
      // Add a subtle spacer block so paragraph spacing is preserved
      blocks.push({ type: "hr", content: "spacer" });
      continue;
    }

    // Normal paragraph text block
    if (currentBlock && currentBlock.type === "paragraph") {
      currentBlock.lines?.push(line);
    } else {
      closeCurrentBlock();
      currentBlock = {
        type: "paragraph",
        lines: [line]
      };
    }
  }

  // Close final block
  closeCurrentBlock();

  const renderedBlocks = blocks.map((block, idx) => {
    switch (block.type) {
      case "heading":
        if (block.level === 1) {
          return (
            <h1 key={idx} className="font-serif text-2xl text-text-primary mt-6 mb-3 pb-2 border-b border-white/5 font-semibold text-left">
              {parseInlineMarkdown(block.content || "")}
            </h1>
          );
        } else if (block.level === 2) {
          return (
            <h2 key={idx} className="font-serif text-xl text-text-primary mt-5 mb-2.5 pb-1.5 border-b border-white/5 font-medium text-left">
              {parseInlineMarkdown(block.content || "")}
            </h2>
          );
        } else if (block.level === 3) {
          return (
            <h3 key={idx} className="font-serif text-base text-text-primary mt-4 mb-2 font-medium text-left">
              {parseInlineMarkdown(block.content || "")}
            </h3>
          );
        } else {
          return (
            <h4 key={idx} className="font-mono text-xs uppercase tracking-wider text-text-primary mt-4 mb-1.5 font-bold text-left">
              {parseInlineMarkdown(block.content || "")}
            </h4>
          );
        }

      case "blockquote":
        return (
          <blockquote key={idx} className="border-l-2 border-growth/40 bg-white/[0.01] px-4 py-2.5 my-3 text-text-secondary italic text-xs leading-relaxed text-left rounded-r-xs">
            {block.lines?.map((line, lIdx) => (
              <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                {parseInlineMarkdown(line)}
              </p>
            ))}
          </blockquote>
        );

      case "hr":
        if (block.content === "spacer") {
          return <div key={idx} className="h-2" />;
        }
        return <hr key={idx} className="my-6 border-white/10" />;

      case "code":
        return <CodeBlockComponent key={idx} code={block.content || ""} language={block.language || ""} />;

      case "ul":
        return (
          <ul key={idx} className="list-none space-y-1.5 my-3 pl-2 text-left">
            {block.items?.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start space-x-2 font-mono text-xs">
                <span className="text-growth shrink-0 mt-1">•</span>
                <span className="text-xs text-text-secondary leading-relaxed">
                  {parseInlineMarkdown(item.text)}
                </span>
              </li>
            ))}
          </ul>
        );

      case "ol":
        return (
          <ol key={idx} className="list-none space-y-1.5 my-3 pl-2 text-left">
            {block.items?.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start space-x-2.5 font-mono text-xs">
                <span className="text-text-muted shrink-0">{item.num}.</span>
                <span className="text-xs text-text-secondary leading-relaxed">
                  {parseInlineMarkdown(item.text)}
                </span>
              </li>
            ))}
          </ol>
        );

      case "todo":
        return (
          <div key={idx} className="space-y-2 my-3 pl-2 text-left">
            {block.items?.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-start space-x-3.5 font-mono text-xs">
                <div className="mt-0.5 shrink-0">
                  {item.checked ? (
                    <div className="w-3.5 h-3.5 rounded-xs bg-growth/20 border border-growth/50 flex items-center justify-center">
                      <Check size={10} className="text-growth stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-xs bg-white/5 border border-white/10" />
                  )}
                </div>
                <span className={`text-xs leading-tight ${item.checked ? "text-text-disabled line-through" : "text-text-secondary"}`}>
                  {parseInlineMarkdown(item.text)}
                </span>
              </div>
            ))}
          </div>
        );

      default: // paragraph
        return (
          <p key={idx} className="text-xs text-text-secondary font-light font-sans leading-relaxed mb-3.5 text-left">
            {parseInlineMarkdown(block.lines?.join(" ") || "")}
          </p>
        );
    }
  });

  return <div className="markdown-body space-y-1 w-full">{renderedBlocks}</div>;
}

