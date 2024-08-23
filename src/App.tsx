import { useEffect, useState, useRef } from 'react';
import { BotMessageSquareIcon } from 'lucide-react';

import ChatPanel from './components/ChatPanel';
import ChatHistoryList from './components/ChatHistoryList';

import { useActiveChat } from './context/activeChat.context';

import { getRoomIds, saveRoomDataToStorage } from './lib/utils';
import { ChatRoomContent } from './constants/types';

const App = () => {
  const { activeId, roomCount, setRoomCount } = useActiveChat();

  const initialRenderRef = useRef(0);
  const [roomIds, setRoomIds] = useState<string[]>([]);

  useEffect(() => {
    const roomIds = getRoomIds();
    setRoomIds(roomIds);
    roomIds.length !== roomCount && setRoomCount(roomIds.length);
    initialRenderRef.current += roomIds.length;
  }, [roomCount, setRoomCount]);

  useEffect(() => {
    if (initialRenderRef.current === 0) {
      const initialRoomData: ChatRoomContent = {
        id: new Date().getTime().toString(),
        title: 'New Chat',
        summary: '',
        messages: [],
        createdAt: new Date()
      };

      saveRoomDataToStorage(initialRoomData);
      return;
    }
  }, [roomCount, roomIds]);

  return (
    <main className="h-screen w-screen flex">
      <div className="h-full flex w-full">
        <ChatHistoryList roomIds={roomIds} />
        <div className="w-full h-full flex flex-col items-center">
          <div className="h-12 border-b border-gray-200 w-full flex items-center"></div>
          {Boolean(activeId) ? (
            <ChatPanel />
          ) : (
            <div className="text-lg font-semibold h-full w-full flex items-center justify-center flex-col gap-y-4">
              <BotMessageSquareIcon size={48} />
              <span>Welcome to the LLM Chat</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default App;
