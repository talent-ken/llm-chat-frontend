import { EditIcon } from 'lucide-react';

import { classnames, getRoomDataFromStorage } from '../../lib/utils';
import { useActiveChat } from '../../context/activeChat.context';

type ChatHistoryListProps = {
  roomIds: string[];
};

const ChatHistoryList = (props: ChatHistoryListProps) => {
  const { roomIds } = props;

  const { activeId, setActiveId } = useActiveChat();

  const getTitleAndSummary = (roomId: string) => {
    const roomData = getRoomDataFromStorage(roomId);

    return { title: roomData.title, summary: roomData.summary };
  };

  const handleActiveId = (id: string) => {
    setActiveId(id);
  };

  return (
    <section className="flex flex-col border-r border-l border-gray-200 w-80">
      <div className="h-12 border-b border-gray-200 flex items-center px-4 font-semibold">
        Chat History
      </div>
      <div className="flex flex-col p-1 gap-y-1">
        {roomIds.map((roomId) => {
          const { title, summary } = getTitleAndSummary(roomId);

          return (
            <div
              key={roomId}
              className={classnames(
                'flex w-full px-3 py-1 cursor-pointer hover:bg-gray-300 items-center justify-between duration-300 bg-gray-50 rounded-md',
                {
                  'bg-gray-200': roomId === activeId
                }
              )}
              onClick={() => handleActiveId(roomId)}
            >
              <div className="">
                <div className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {title}
                </div>
                <div className="text-xs font-medium text-gray-600 line-clamp-1">
                  {summary || 'Room Summary'}
                </div>
              </div>
              <div className="text-gray-600 hover:text-white p-1.5 rounded-full">
                <EditIcon size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ChatHistoryList;
