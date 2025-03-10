import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { appAuth } from "@/services/appAuth";
import { useAuth } from "../auth/AuthProvider";
import Button from '@/components/ui/Button';

export const Login = () => {
  const { login } = useAuth();
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
      const isAuthenticated = await appAuth.login(credentials.username, credentials.password);
      
      if (!isAuthenticated) {
        setError("Usuario o contraseña incorrectos");
        setCredentials((prev) => ({ ...prev, password: "" }));
        return;
      }

      localStorage.setItem("lastUsername", credentials.username);
      login();
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError("Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.");
      setCredentials((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-text dark:text-text-dark">StreamingPro Central</h2>
            <p className="mt-2 text-sm text-text-muted dark:text-text-muted-dark">
              Access your account to manage your streams
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
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-text dark:text-text-dark bg-card-background dark:bg-card-background-dark ring-1 ring-inset ring-auth-input-border dark:ring-auth-input-border-dark focus:ring-2 focus:ring-inset focus:ring-auth-input-focus dark:focus:ring-auth-input-focus-dark sm:text-sm sm:leading-6"
                  placeholder="Username"
                  disabled={isLoading}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
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
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-text dark:text-text-dark bg-card-background dark:bg-card-background-dark ring-1 ring-inset ring-auth-input-border dark:ring-auth-input-border-dark focus:ring-2 focus:ring-inset focus:ring-auth-input-focus dark:focus:ring-auth-input-focus-dark sm:text-sm sm:leading-6"
                  placeholder="Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-error dark:text-error-dark text-center">{error}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Iniciando sesión..."
              fullWidth
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
