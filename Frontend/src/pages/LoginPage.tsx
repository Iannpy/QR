import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { User, Lock, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { authed, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authed === true) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      navigate("/");
    } else {
      setError("Credenciales inválidas. Intentalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">
          Acceso
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Inicia sesión para generar y administrar tus QR con tracking.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usuario
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-9 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border p-2 text-sm"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border p-2 text-sm"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2 disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
