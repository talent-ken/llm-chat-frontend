import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useState
} from 'react';

import { LoaderCircle, ArrowUpIcon, PlusIcon } from 'lucide-react';

import ChatLine from '../../components/ChatLine';

import { getRoomDataFromStorage, saveRoomDataToStorage } from '../../lib/utils';
import type { Message, ChatRoomContent } from '../../constants/types';
import { useActiveChat } from '../../context/activeChat.context';

const ChatPanel = () => {
  const { activeId, setRoomCount } = useActiveChat();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('New Chat');
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const getPageTitleAndSummary = useCallback(async (messages: Message[]) => {
    const response = await fetch(process.env.REACT_APP_LLM_URL as string, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: [...messages] })
    });

    if (!response.ok) {
      return;
    }

    const { title, summary } = await response.json();

    console.log({ title, summary });

    setTitle(title);
    setSummary(summary);
  }, []);

  const handleMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);

    try {
      const response = await fetch(process.env.REACT_APP_LLM_URL as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Network response was not okay.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let botMessage = '';

      while (!done) {
        const { value, done: doneReading } = await reader?.read()!;
        done = doneReading;

        const chunkValue = decoder.decode(value, { stream: true });
        botMessage += chunkValue;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;

          if (updatedMessages[lastMessageIndex]?.sender === 'bot') {
            updatedMessages[lastMessageIndex].text = botMessage;
          } else {
            updatedMessages.push({ sender: 'bot', text: chunkValue });
          }

          return updatedMessages;
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log('Complete bot response:', botMessage);
    } catch (err) {
      console.error('Error during streaming:', err);
      setError(
        'An error occurred while communicating with the server. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setInput('');
    }
  }, []);

  useEffect(() => {
    const roomData = getRoomDataFromStorage(activeId);

    if (roomData) {
      const {
        title: storedTitle,
        summary: storedSummary,
        messages: storedMessages
      } = roomData;

      setTitle(storedTitle);
      setSummary(storedSummary);
      setMessages(storedMessages);
    }
  }, [activeId]);

  useEffect(() => {
    const roomData = getRoomDataFromStorage(activeId);
    roomData.messages = messages.length ? messages : roomData.messages;
    saveRoomDataToStorage(roomData);
  }, [messages, activeId]);

  // useEffect(() => {
  //   if (messages.length > 1 && title === 'New Chat') {
  //     getPageTitleAndSummary(messages);
  //   }
  // }, [getPageTitleAndSummary, messages, title]);

  const handleSend = useCallback(() => {
    if (input.trim() === '') return;
    handleMessage(input);
  }, [handleMessage, input]);

  const handleEnterDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const key = e.key;

      if (key === 'Enter') {
        handleSend();
      }
    },
    [handleSend]
  );

  const handlePromptChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const value = e.target.value;
    setInput(value);
  }, []);

  const handleNewChat = () => {
    const initialRoomData: ChatRoomContent = {
      id: new Date().getTime().toString(),
      title: 'New Chat',
      summary: '',
      messages: [],
      createdAt: new Date()
    };

    saveRoomDataToStorage(initialRoomData);
    setRoomCount((prev) => prev + 1);
  };

  return (
    <section className="h-[calc(100%-3rem)] max-w-3xl w-full px-4 md:px-6 lg:px-10 p-4 lg:p-6 flex flex-col">
      <h2 className="text-center text-gray-500 font-semibold">
        This is the beginning of your chat history with the LLM
      </h2>
      <span className="font-medium text-sm text-center text-gray-400 pb-2">
        {new Date().toLocaleDateString('us-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}
      </span>
      <div className="flex flex-col py-6 md:px-4 overflow-y-auto gap-y-4 outline-none shadow-inner">
        {messages.map((msg, index) => (
          <ChatLine key={index} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <div className="pt-2 w-full flex flex-col md:px-4">
        {Boolean(error) && (
          <div className="text-red-500 text-xs text-center font-medium">{error}</div>
        )}
        <div className="w-full flex flex-col border-gray-200 border rounded-lg overflow-hidden shadow-md">
          <input
            type="text"
            name="user-prompt"
            id="user-prompt"
            className="px-3 py-2 w-full outline-none text-sm disabled:bg-white"
            placeholder="Type your message..."
            onChange={handlePromptChange}
            onKeyDown={handleEnterDown}
            value={input}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center px-3 pt-1 pb-2">
            <button
              className="flex items-center gap-x-2 bg-blue-500 text-white py-1 pl-2 pr-3 text-sm rounded-full border border-blue-400 shadow shadow-blue-400"
              onClick={handleNewChat}
            >
              <PlusIcon size={20} />
              <span className="font-medium text-sm">New Chat</span>
            </button>
            <button
              className="bg-blue-500 text-white py-1 pl-2 pr-3 text-sm rounded-full border border-blue-400 shadow shadow-blue-400 flex items-center gap-x-2"
              onClick={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  <span className="font-medium text-sm">Sending</span>
                </>
              ) : (
                <>
                  <ArrowUpIcon size={20} />
                  <span className="font-medium text-sm">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPanel;
