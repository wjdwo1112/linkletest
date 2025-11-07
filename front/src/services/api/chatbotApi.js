import { post } from '../apiClient';

export const chatbotApi = {
  sendMessage: async (message) => {
    return await post('/chatbot/chat', { message });
  },
};
