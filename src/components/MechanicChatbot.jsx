import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MechanicChatbot = () => {
  const [conversation, setConversation] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

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

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
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
      
      <div className="w-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto py-8 px-4 w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase mb-2">DriveSync Mechanic Chatbot</h1>
            <p className="text-gray-600 font-general-regular">Get expert answers for all your car-related questions</p>
          </div>

          <div className="bg-[#e7e7e7] rounded-xl p-6 mb-6">
            <div 
              className="bg-white p-4 rounded-lg border border-gray-200 h-80 overflow-y-auto mb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {conversation.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="block text-xs font-medium mb-1">
                        {msg.role === 'user' ? 'You' : 'Mechanic'}
                      </span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="text-left mb-4">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                    <span className="block text-xs font-medium mb-1">Mechanic</span>
                    <div className="flex items-center">
                      <div className="dot-typing"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex">
              <input
                type="text"
                placeholder="Ask your car question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendQuestion();
                }}
                className="flex-1 p-3 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button
                onClick={sendQuestion}
                disabled={loading || !question.trim()}
                className="px-4 py-2 bg-[#050505] text-white rounded-r hover:bg-gray-800 transition-all ease-in-out delay-150 disabled:opacity-50 uppercase font-general-medium"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-[#e7e7e7] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 uppercase">Common Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['How often should I change my oil?', 
                'What does the check engine light mean?', 
                'How to jump start a car?', 
                'When should I replace my brakes?'
              ].map((q, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    setQuestion(q);
                  }}
                  className="bg-white p-3 rounded-lg border border-gray-200 text-left hover:bg-gray-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .dot-typing {
          position: relative;
          left: -9999px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #888;
          color: #888;
          box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          animation: dot-typing 1.5s infinite linear;
        }

        @keyframes dot-typing {
          0% {
            box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          }
          16.667% {
            box-shadow: 9984px -10px 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          }
          33.333% {
            box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          }
          50% {
            box-shadow: 9984px 0 0 0 #888, 9999px -10px 0 0 #888, 10014px 0 0 0 #888;
          }
          66.667% {
            box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          }
          83.333% {
            box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px -10px 0 0 #888;
          }
          100% {
            box-shadow: 9984px 0 0 0 #888, 9999px 0 0 0 #888, 10014px 0 0 0 #888;
          }
        }
      `}</style>
    </div>
  );
};

export default MechanicChatbot;