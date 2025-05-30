import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MechanicChatbot = () => {
  const [conversation, setConversation] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setConversation(prev => [...prev, { role: 'user', text: trimmedQuestion }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`https://chatbot-dot-cloud-app-455515.lm.r.appspot.com/api/mechanic-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.answer ? data.answer : 'Sorry, no answer received.';

      setConversation(prev => [
        ...prev,
        { role: 'mechanic', text: answer }
      ]);
    } catch (error) {
      setConversation(prev => [
        ...prev,
        { role: 'mechanic', text: `Error: ${error.message}` }
      ]);
      console.error('Error sending question:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text) => {
    try {
      const response = await fetch('https://text-to-speech-dot-cloud-app-455515.lm.r.appspot.com/api/text-to-speech/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioPlayer = new Audio(audioUrl);
      audioPlayer.play();
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <Sidebar />

      <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto py-8 px-4 w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase mb-2">DriveSync Mechanic Chatbot</h1>
            <p className="text-gray-600 font-general-regular">Get expert answers for all your car-related questions</p>
          </div>

          <div className="bg-[#e7e7e7] rounded-xl p-6 mb-6">
            <div
              id="conversation"
              className="bg-white p-4 rounded-lg border border-gray-200 h-80 overflow-y-auto mb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {conversation.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-600">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start the conversation to get car advice</p>
                </div>
              ) : (
                conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-[#050505] text-white'
                          : msg.role === 'loading'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="block text-xs font-medium mb-1">
                        {msg.role === 'user' ? 'You' : 'Mechanic'}
                      </span>
                      <p style={{ fontStyle: msg.role === 'loading' ? 'italic' : 'normal' }}>
                        {msg.text}
                      </p>

                      {/* SPEAK BUTTON - Now shows for all mechanic messages */}
                      {msg.role === 'mechanic' && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="mt-2 text-blue-600 underline text-sm hover:text-blue-800"
                        >
                          🔊 Speak
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="text-left mb-4">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                    <span className="block text-xs font-medium mb-1">Mechanic</span>
                    <p style={{ fontStyle: 'italic' }}>Loading...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex">
              <input
                type="text"
                id="questionInput"
                placeholder="Ask your car question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendQuestion();
                }}
                className="flex-1 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button
                id="sendButton"
                onClick={sendQuestion}
                disabled={loading || !question.trim()}
                className="px-4 py-3 bg-blue-500 text-white rounded-r disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicChatbot;