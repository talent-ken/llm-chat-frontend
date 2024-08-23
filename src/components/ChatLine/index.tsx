import { useEffect, useState } from 'react';
import ReactMarkDown from 'react-markdown';
import DOMPurify from 'dompurify';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { classnames } from '../../lib/utils';

type ChatLineProps = {
  sender: 'bot' | 'user';
  text: string;
};

const ChatLine = (props: ChatLineProps) => {
  const { sender, text } = props;
  const [sanitizedText, setSanitizedText] = useState<string>('');

  useEffect(() => {
    // const sanitized = DOMPurify.sanitize(text);
    setSanitizedText(text);
  }, [text]);

  return (
    <div
      className={classnames(
        'w-full border border-gray-300 px-4 py-2 rounded-lg shadow-md flex flex-col gap-y-1',
        {
          'border-pink-300 shadow-pink-200': sender === 'bot'
        }
      )}
    >
      <div className="flex">
        <div className="font-semibold text-gray-800 text-sm">
          {sender === 'bot' ? 'Large Language Model' : 'User Name'}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <ReactMarkDown
          children={sanitizedText}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <div className="rounded-[4.8px] overflow-hidden my-2 border border-gray-300">
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, '')}
                    style={oneDark}
                    customStyle={{ margin: 0, fontSize: '0.75rem' }}
                    language={match[1]}
                    PreTag="div"
                  />
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChatLine;
