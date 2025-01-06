import { useState, useEffect } from "react";
import { AuthService } from "@/services/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (error) setError(null);
  }, [credentials, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const auth = AuthService.getInstance();
      await auth.request("GET", "/api/v3/process");
      const token = auth.getAccessToken();
      
      // Guardar el token en una cookie que dure 30 días
      const thirtyDays = 30 * 24 * 60 * 60;
      document.cookie = `auth_token=${token}; path=/; max-age=${thirtyDays}; secure; samesite=strict`; 
      
      localStorage.setItem("lastUsername", credentials.username);
      onLoginSuccess();
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("Error al autenticar. Por favor, verifica tus credenciales.");
      setCredentials((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card-background rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Streaming Pro</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Accede a tu cuenta para gestionar tus streams
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Usuario"
                  disabled={isLoading}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Contraseña"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || !credentials.username || !credentials.password
              }
              className={`
                w-full flex justify-center items-center rounded-md px-4 py-2
                text-sm font-semibold text-white shadow-sm
                transition-colors duration-150
                ${
                  isLoading || !credentials.username || !credentials.password
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Autenticando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>

            {error && (
              <div className="mt-2 text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
