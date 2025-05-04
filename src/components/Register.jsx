import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    cars: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = {
        ...formData,
        cars: formData.cars.split(",").map((car) => car.trim()),
      };

      await axios.post(
        "https://auth-drivesync-ebapcqbegrg4b3fa.polandcentral-01.azurewebsites.net/api/auth/register",
        payload
      );
      setMessage({
        text: "Registration successful! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Registration failed", error);
      setMessage({
        text:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="p-3">
      <div className="uppercase leading-none">
        <p className="font-bold">drive sync</p>
        <p className="opacity-50">car management app</p>
      </div>
      <div className="flex flex-col justify-center items-center mt-[15vh]">
        <form onSubmit={handleSubmit} className="p-4 w-full max-w-md">
          <h2 className="mb-4 uppercase font-medium text-2xl">Register</h2>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full py-2 border-b"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <input
              type="text"
              name="cars"
              value={formData.cars}
              onChange={handleChange}
              placeholder="Car models (comma separated)"
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
            {isLoading ? "Processing..." : "Register"}
          </button>

          <div className="flex justify-between mt-2 font-medium">
            <p>Already have an account?</p>
            <a href="/login" className="underline-link is--alt">
              Login
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Register;
