/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const wasRemembered = localStorage.getItem("rememberMe") === "true";

    if (wasRemembered && savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username.trim() === "DongleIQ" && password.trim() === "1234") {
      localStorage.setItem("isLoggedIn", "true");

      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem("savedUsername", username);
        localStorage.setItem("savedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("rememberMe");
      }

      setError("");
      navigate("/form");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-y-auto animated-bg">
      <div className="absolute w-[500px] h-[500px] bg-pink-500/20 blur-[180px] rounded-full animate-float top-[-100px] left-[-100px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[180px] rounded-full animate-float2 bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="absolute top-6 right-6">
          <button
            onClick={() => navigate("/admin")}
            className="text-white/40 hover:text-white text-xs px-3 py-1 border border-white/20 rounded-full transition-colors"
          >
            Admin Panel
          </button>
        </div>

        <div className="py-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-wide bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            DCM Portal
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative overflow-hidden w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-8 transition duration-500 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine pointer-events-none"></div>

            <h2 className="text-3xl font-semibold text-white text-center mb-8">
              Login
            </h2>

            {error && (
              <div className="mb-6 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/60 py-2 focus:outline-none focus:border-white transition duration-300"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent border-b border-white/40 text-white placeholder-white/60 py-2 focus:outline-none focus:border-white transition duration-300"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm text-white/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-white"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition duration-300 shadow-lg"
              >
                Log In
              </button>

              <p className="text-center text-white/80 text-sm mt-6">
                Don't have an account?{" "}
                <span className="text-white font-medium cursor-pointer hover:underline">
                  Register
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
