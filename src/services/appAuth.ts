// Servicio de autenticación para la aplicación StreamingPro
export class AppAuthService {
  private static instance: AppAuthService;
  private isAuthenticated: boolean = false;

  private constructor() {
    // Intentar recuperar el estado de autenticación de las cookies
    const isAuthenticatedCookie = typeof document !== 'undefined' ? 
      document.cookie.includes('isAuthenticated=true') : false;
    this.isAuthenticated = isAuthenticatedCookie;
  }

  public static getInstance(): AppAuthService {
    if (!AppAuthService.instance) {
      AppAuthService.instance = new AppAuthService();
    }
    return AppAuthService.instance;
  }

  public async login(username: string, password: string): Promise<boolean> {
    console.log('Intentando autenticar con StreamingPro:', { username });
    
    const expectedUsername = process.env.NEXT_PUBLIC_STREAMINGPRO_USERNAME;
    const expectedPassword = process.env.NEXT_PUBLIC_STREAMINGPRO_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      console.error('Faltan credenciales de StreamingPro en las variables de entorno:', {
        hasUsername: !!expectedUsername,
        hasPassword: !!expectedPassword
      });
      return false;
    }

    const credentialsMatch = {
      username: username === expectedUsername,
      password: password === expectedPassword
    };

    console.log('Verificando credenciales:', {
      providedUsername: username,
      expectedUsername,
      usernameMatches: credentialsMatch.username
    });

    if (credentialsMatch.username && credentialsMatch.password) {
      console.log('Autenticación exitosa con StreamingPro');
      this.isAuthenticated = true;
      return true;
    }

    console.log('Credenciales incorrectas');
    return false;
  }

  public logout(): void {
    console.log('Cerrando sesión de StreamingPro');
    this.isAuthenticated = false;
  }

  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}

// Exportar una instancia única del servicio
export const appAuth = AppAuthService.getInstance(); 