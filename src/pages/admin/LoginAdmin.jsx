import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      const response = await fetch(
        "https://users-dot-cloud-app-455515.lm.r.appspot.com/api/auth/login/admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: "Login successful!", type: "success" });
        localStorage.setItem('token', data.token);
        navigate('/maps');
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed", error);
      setMessage({
        text: error.message || "Login failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-3 h-screen">
      <div className="uppercase leading-none">
        <p className="font-bold">drive sync</p>
        <p className="opacity-50">car management app</p>
      </div>
      <div className="flex flex-col justify-center items-center mt-[20vh]">
        <form onSubmit={handleSubmit} className="p-4 w-full max-w-md">
          <h2 className="mb-4 font-medium text-5xl">Welcome, login to your account</h2>
          <div className="mb-4 mt-10">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>
          
          {message.text && (
            <div
              className={`mt-4 p-2 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="p-2 mt-5 bg-[#181818] text-[#f6f6f6] w-full rounded-lg transition-all duration-300 ease-in-out hover:bg-[#333333] disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
          <div className="flex justify-between mt-2 font-medium">
            <p>Don't have an account?</p>
            <a href="/admin/register" className="underline-link is--alt">
              Register
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

export default LoginAdmin;