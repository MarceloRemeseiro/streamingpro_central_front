
interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface RequestBody {
  [key: string]: string | number | boolean | null | undefined;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl: string;

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_RESTREAMER_API_URL?.replace(/\/$/, '');
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_RESTREAMER_API_URL no está definida');
    }
    this.baseUrl = baseUrl;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getApiUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  public async login(): Promise<boolean> {
    try {
      const response = await fetch('/api/restreamer/login', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Error en la respuesta de autenticación:', data);
        return false;
      }

      const tokens: AuthTokens = await response.json();
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      return true;
    } catch (error) {
      console.error('Error al autenticar:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('/api/restreamer/login/refresh', {
        headers: {
          'Authorization': `Bearer ${this.refreshToken}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return false;
    }
  }

  public async request<T>(method: string, path: string, body?: RequestBody): Promise<T> {
    if (!this.accessToken) {
      const success = await this.login();
      if (!success) {
        throw new Error('No se pudo autenticar con Restreamer');
      }
    }

    try {
      const url = this.getApiUrl(path);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Si el token expiró, intentamos refrescarlo
          const success = await this.refreshAccessToken();
          if (!success) {
            // Si no se pudo refrescar, intentamos login completo
            const loginSuccess = await this.login();
            if (!loginSuccess) {
              throw new Error('No se pudo renovar la autenticación');
            }
          }
          return this.request<T>(method, path, body);
        }

        const errorText = await response.text();
        console.error(`Error en la petición ${method}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url
        });
        throw new Error(`Error en la petición: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error en la petición ${method}:`, {
        error,
        path,
        method,
        body
      });
      throw error;
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
} 