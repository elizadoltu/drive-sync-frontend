import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();

  const handleDriverLogin = () => {
    navigate("/driver/login");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  const handleDriverRegister = () => {
    navigate("/driver/register");
  };

  const handleAdminRegister = () => {
    navigate("/admin/register");
  };

  return (
    <main className="p-3 h-screen">
      <div className="uppercase leading-none">
        <p className="font-bold">drive sync</p>
        <p className="opacity-50">car management app</p>
      </div>
      
      <div className="flex flex-col justify-center items-center mt-[15vh]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium mb-4 uppercase">
            Welcome to Drive Sync
          </h1>
          <p className="text-lg opacity-70">
            Your complete car management solution
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl px-4">
          {/* Driver Section */}
          <div className="flex-1">
            <div className="p-6 border rounded-lg mb-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#181818] rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-[#f6f6f6]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2 uppercase">Driver</h2>
                <p className="opacity-70 mb-4">
                  Access your personal dashboard and manage your vehicles
                </p>
                <button
                  onClick={handleDriverLogin}
                  className="w-full p-2 mb-2 bg-[#181818] text-[#f6f6f6] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#333333]"
                >
                  Login
                </button>
                <button
                  onClick={handleDriverRegister}
                  className="w-full p-2 border border-[#181818] text-[#181818] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#181818] hover:text-[#f6f6f6]"
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className="flex-1">
            <div className="p-6 border rounded-lg mb-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-[#181818] rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-[#f6f6f6]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2 uppercase">Admin</h2>
                <p className="opacity-70 mb-4">
                  Manage users and oversee fleet operations
                </p>
                <button
                  onClick={handleAdminLogin}
                  className="w-full p-2 mb-2 bg-[#181818] text-[#f6f6f6] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#333333]"
                >
                  Login
                </button>
                <button
                  onClick={handleAdminRegister}
                  className="w-full p-2 border border-[#181818] text-[#181818] rounded-lg transition-all duration-300 ease-in-out hover:bg-[#181818] hover:text-[#f6f6f6]"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LandingPage;