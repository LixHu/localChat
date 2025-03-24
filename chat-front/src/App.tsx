import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Role, getRoles, createRole } from './api/roles';
import { ChatMessage, sendMessage } from './api/chat';
import { Model, getModels } from './api/models';
import ModelSelect from './components/ModelSelect';

interface Message extends ChatMessage { }

function App() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoles();
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await getModels();
      console.log(response.data.models)
      setModels(response.data.models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim() || !newRole.description.trim()) return;

    try {
      setIsCreating(true);
      await createRole(newRole);
      await fetchRoles();
      setNewRole({ name: '', description: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating role:', error);
      setIsCreating(false);
    }
  };

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!selectedRole) {
      setToastMessage('请先选择一个角色');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!selectedModel) {
      setToastMessage('请先选择一个模型');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (isStreaming) return;

    const parseSSE = (line: string) => {
      let event = 'message';
      let data = '';

      line.split('\n').forEach(l => {
        if (l.startsWith('event:')) {
          event = l.replace('event:', '').trim();
        } else if (l.startsWith('data:')) {
          data += l.replace('data:', '').trim();
        }
      });

      return { event, data };
    };

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await sendMessage({
        role: selectedRole.id,
        model: selectedModel.name,
        message: input
      });

      const reader = response.getReader();

      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将 Uint8Array 转换为字符串
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          const { event, data } = parseSSE(line);

          if (event === 'message' && data) {
            try {
              const content = JSON.parse(data).content;
              if (content) {
                accumulatedContent += content;
                // 更新消息列表，保持之前的消息不变，只更新最新的 AI 响应
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                    newMessages[newMessages.length - 1].content = accumulatedContent;
                  } else {
                    newMessages.push({ role: 'assistant', content: accumulatedContent });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative">
      <div className="container mx-auto px-4 py-8 h-screen flex gap-4">
        {/* Roles sidebar */}
        <div className="w-64 shrink-0 space-y-4 overflow-y-auto">
          <h2 className="text-xl font-bold">选择角色</h2>
          <div className="space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full p-3 rounded-lg text-left transition ${selectedRole?.id === role.id ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <div className="font-medium">{role.name}</div>
                <div className="text-sm text-gray-400">{role.description}</div>
              </button>
            ))}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full mt-4 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
            >
              创建新角色
            </button>

            {/* 创建角色弹窗 */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96 relative">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-medium mb-4">创建新角色</h3>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="角色名称"
                    className="w-full mb-4 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="角色描述"
                    className="w-full mb-4 bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      handleCreateRole();
                      setShowCreateModal(false);
                    }}
                    disabled={isCreating || !newRole.name.trim() || !newRole.description.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                  >
                    {isCreating ? '创建中...' : '创建角色'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat section */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden h-full">
          <div className="flex justify-end p-4 border-b border-gray-700">
            <div className="w-48">
              <ModelSelect
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                models={models}
                disabled={isStreaming}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex w-full mb-4"
              >
                <div
                  className={`prose prose-invert max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-600'} rounded-lg p-4 text-gray-100`}
                >
                  <ReactMarkdown
                    remarkPlugins={[]}
                    rehypePlugins={[]}
                    key={message.content.length}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={selectedRole ? '输入消息...' : '请先选择一个角色'}
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!selectedRole || !input.trim() || isStreaming}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity">

          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default App

