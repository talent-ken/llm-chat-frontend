import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ChatRoomContent } from '../constants/types';
import { APP_NAME } from '../constants/constants';

export const classnames = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const getStructuredDataFromLocalStorage = () => {
  const storedRawData: string | null = localStorage.getItem(APP_NAME);
  return storedRawData ? JSON.parse(storedRawData) : {};
};

export const getRoomIds = () => {
  const localStorageData = getStructuredDataFromLocalStorage();

  return Object.keys(localStorageData);
};

export const saveRoomDataToStorage = (roomData: ChatRoomContent) => {
  const localStorageData = getStructuredDataFromLocalStorage();

  const roomId = roomData.id;
  localStorageData[roomId] = {
    ...localStorageData[roomId],
    ...roomData
  };

  localStorage.setItem(APP_NAME, JSON.stringify(localStorageData));
};

export const getRoomDataFromStorage = (roomId: string): ChatRoomContent => {
  const localStorageData = getStructuredDataFromLocalStorage();
  return localStorageData[roomId];
};
