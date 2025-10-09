
interface CookieOptions {
  expires?: number; 
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

class CookieManager {
  set(name: string, value: string, options: CookieOptions = {}): void {
    const {
      expires = 7, 
      secure = window.location.protocol === 'https:',
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    cookieString += `; path=/`;
    
    if (secure) {
      cookieString += `; secure`;
    }
    
    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  }

  remove(name: string): void {
    this.set(name, '', { expires: -1 });
  }
  exists(name: string): boolean {
    return this.get(name) !== null;
  }
  clearAuth(): void {
    this.remove('accessToken');
    this.remove('refreshToken');
  }
}

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const cookieManager = new CookieManager();
export default cookieManager;
