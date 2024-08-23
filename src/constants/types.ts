export type Message = {
  sender: 'user' | 'bot';
  text: string;
};

export type ChatRoomContent = {
  id: string;
  title: string;
  summary: string;
  messages: Message[];
  createdAt: Date;
};
