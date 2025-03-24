export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  role: string;
  message: string;
  model: string;
}

// 发送聊天消息
export const sendMessage = async (data: ChatRequest) => {
  const response = await fetch('http://localhost:8080/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok || !response.body) {
    throw new Error('请求失败');
  }
  return response.body;
};