import React from "react";
import ReactMarkdown from "react-markdown";

const Markdown = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => (
          <p
            className="w-full md:max-w-md paragraph-text text-sm md:text-base leading-relaxed"
            {...props}
          />
        ),
        strong: ({ node, ...props }) => (
          <strong className="paragraph-text font-semibold" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside space-y-2 mb-4" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-gray-700 leading-snug" {...props} />
        ),
       
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
