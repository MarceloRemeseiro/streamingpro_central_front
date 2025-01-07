import { authConfig } from '../lib/config';



export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private isAuthenticated = false;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.isAuthenticated = false;
  }

  private async loginToRestreamer(): Promise<void> {
    try {
      const response = await fetch(`${authConfig.apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: authConfig.username,
          password: authConfig.password,
        })
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
    } catch (error) {
      this.clearTokens();
      console.error('Error en login:', error);
      throw new Error('Error de autenticación');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        const checkRefresh = setInterval(() => {
          if (!this.isRefreshing) {
            clearInterval(checkRefresh);
            resolve();
          }
        }, 100);
      });
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        if (!this.refreshToken) {
          await this.loginToRestreamer();
          return;
        }

        const response = await fetch(`${authConfig.apiUrl}/api/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            refresh_token: this.refreshToken,
          })
        });

        if (!response.ok) {
          throw new Error('Error al refrescar el token');
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
      } catch {
        this.clearTokens();
        await this.loginToRestreamer();
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async request<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    if (!this.accessToken) {
      await this.loginToRestreamer();
    }

    try {
      const response = await fetch(`${authConfig.apiUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.request(method, url, data);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error en request:', error);
      throw error;
    }
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public async login(username: string, password: string): Promise<boolean> {
    const isValidUser = username === process.env.NEXT_PUBLIC_STREAMINGPRO_USERNAME &&
                       password === process.env.NEXT_PUBLIC_STREAMINGPRO_PASSWORD;

    if (isValidUser) {
      try {
        await this.loginToRestreamer();
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('Error al conectar con Restreamer:', error);
        return false;
      }
    }

    return false;
  }

  public logout(): void {
    this.clearTokens();
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/v3/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: process.env.NEXT_PUBLIC_RESTREAMER_USERNAME,
        password: process.env.NEXT_PUBLIC_RESTREAMER_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
} 