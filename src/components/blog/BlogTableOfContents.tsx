
import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
}

export const BlogTableOfContents = ({ content }: BlogTableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from content
    const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[1-6]>/gi;
    const matches = Array.from(content.matchAll(headingRegex));
    
    const items = matches.map(match => ({
      id: match[2],
      text: match[3],
      level: parseInt(match[1])
    }));
    
    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 0.1
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-fade-in">
      <h3 className="text-lg font-semibold text-black mb-4">Table of Contents</h3>
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
              activeId === item.id
                ? 'bg-[#27AE60]/10 text-[#27AE60] border-l-2 border-[#27AE60]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`}
            style={{ 
              paddingLeft: `${(item.level - 1) * 16 + 12}px`,
              marginLeft: activeId === item.id ? '-2px' : '0'
            }}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
};
