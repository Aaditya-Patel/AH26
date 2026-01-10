import { useState } from 'react';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';
import { educationAPI } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function Education() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you learn about carbon credits. Ask me anything!',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await educationAPI.chat(message);
      const { answer, sources } = response.data;
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, sources },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are carbon credits?',
    'How does the CCTS work?',
    'What are the 9 industrial sectors covered?',
    'Explain the MRV process',
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Education Agent</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow" style={{ height: '600px' }}>
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={loading}
            />
          </div>

          {/* Suggested Questions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Suggested Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
