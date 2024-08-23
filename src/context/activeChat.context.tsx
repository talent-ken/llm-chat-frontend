import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState
} from 'react';

interface IActiveChat {
  activeId: string;
  setActiveId: Dispatch<SetStateAction<string>>;
  roomCount: number;
  setRoomCount: Dispatch<SetStateAction<number>>;
}

export const ActiveChatContext = createContext<IActiveChat>({} as IActiveChat);

export const ActiveChatProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const [activeId, setActiveId] = useState('');
  const [roomCount, setRoomCount] = useState(0);

  const value = useMemo(
    () => ({
      activeId,
      setActiveId,
      roomCount,
      setRoomCount
    }),
    [activeId, roomCount]
  );

  return (
    <ActiveChatContext.Provider value={value}>{children}</ActiveChatContext.Provider>
  );
};

export const useActiveChat = () => {
  const context = useContext(ActiveChatContext);
  if (context === undefined) {
    throw new Error('useActiveChat must be used within an ActiveChatProvider');
  }

  return context;
};
