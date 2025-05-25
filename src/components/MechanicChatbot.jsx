import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const MechanicChatbot = () => {
  const [conversation, setConversation] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const sendQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    // Append the user's message.
    setConversation(prev => [...prev, { role: 'user', text: `You: ${trimmedQuestion}` }]);
    setQuestion('');
    setLoading(true);

    // Add a "Loading..." indicator.
    setConversation(prev => [...prev, { role: 'loading', text: 'Loading...' }]);

    try {
      const response = await fetch('https://chatbot-dot-cloud-app-455515.lm.r.appspot.com/api/mechanic-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuestion })
      });
      const data = await response.json();
      const answer = data.answer ? data.answer : 'Sorry, no answer received.';

      // Remove the loading indicator and append the answer.
      setConversation(prev => {
        const filtered = prev.filter(msg => msg.role !== 'loading');
        return [...filtered, { role: 'mechanic', text: `Mechanic: ${answer}` }];
      });
    } catch (error) {
      setConversation(prev => {
        const filtered = prev.filter(msg => msg.role !== 'loading');
        return [...filtered, { role: 'mechanic', text: `Error: ${error.message}` }];
      });
      console.error('Error sending question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', background: '#f5f5f5' }}>
      <header className="bg-white shadow-sm top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="uppercase leading-none">
            <p className="font-bold">drive sync</p>
            <p className="opacity-50 text-sm">car management app</p>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/user/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                location.pathname === '/user/profile' ? 'nav-active' : ''
              }`}
            >
              Profile
              {location.pathname === '/user/profile' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
              )}
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                location.pathname === '/dashboard' ? 'nav-active' : ''
              }`}
            >
              Dashboard
              {location.pathname === '/dashboard' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
              )}
            </Link>
            <Link
              to="/chatbot"
              className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                location.pathname === '/chatbot' ? 'nav-active' : ''
              }`}
            >
              Chatbot
              {location.pathname === '/chatbot' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
              )}
            </Link>
            <Link
              to="/maps"
              className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 relative ${
                location.pathname === '/maps' ? 'nav-active' : ''
              }`}
            >
              Maps
              {location.pathname === '/maps' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#050505]"></span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#181818] hover:bg-[#333333]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <div
        id="chat-container" //asd
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: '#fff',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <h1>Mechanic Chatbot</h1>
        <div
          id="conversation"
          style={{
            marginTop: "20px",
            height: '300px',
            overflowY: 'auto',
            marginBottom: '10px',
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '4px',
            background: '#fafafa',
          }}
        >
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role}`}
              style={{
                marginBottom: '8px',
                lineHeight: '1.4',
                textAlign:
                  msg.role === 'user' ? 'right' : msg.role === 'mechanic' ? 'left' : 'center',
                color: msg.role === 'user' ? '#007BFF' : msg.role === 'mechanic' ? '#28a745' : '#555',
                fontStyle: msg.role === 'loading' ? 'italic' : 'normal',
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div>
          <input
            type="text"
            id="questionInput"
            placeholder="Ask your car question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendQuestion();
            }}
            style={{
              width: 'calc(100% - 80px)',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            id="sendButton"
            onClick={sendQuestion}
            disabled={loading}
            style={{
              padding: '9px 15px',
              marginLeft: '5px',
              border: 'none',
              background: '#007BFF',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicChatbot;