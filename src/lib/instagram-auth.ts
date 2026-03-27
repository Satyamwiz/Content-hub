// Instagram Authentication Storage Utility

export interface InstagramAuthData {
  accessToken: string;
  userId: string;
  connectedAt: string;
}

const STORAGE_KEY = 'instagram_auth';

export class InstagramAuth {
  /**
   * Save Instagram credentials to localStorage
   */
  static saveCredentials(accessToken: string, userId: string): void {
    const authData: InstagramAuthData = {
      accessToken,
      userId,
      connectedAt: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to save Instagram credentials:', error);
      throw new Error('Failed to save credentials. Please try again.');
    }
  }

  /**
   * Get Instagram credentials from localStorage
   */
  static getCredentials(): InstagramAuthData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const authData: InstagramAuthData = JSON.parse(stored);
      
      // Validate the data structure
      if (!authData.accessToken || !authData.userId) {
        this.clearCredentials();
        return null;
      }
      
      return authData;
    } catch (error) {
      console.error('Failed to retrieve Instagram credentials:', error);
      this.clearCredentials();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const credentials = this.getCredentials();
    return credentials !== null;
  }

  /**
   * Clear Instagram credentials from localStorage
   */
  static clearCredentials(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear Instagram credentials:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    const credentials = this.getCredentials();
    return credentials?.accessToken || null;
  }

  /**
   * Get user ID
   */
  static getUserId(): string | null {
    const credentials = this.getCredentials();
    return credentials?.userId || null;
  }

  /**
   * Truncate token for display (show first 10 and last 4 characters)
   */
  static truncateToken(token: string): string {
    if (!token || token.length < 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 4)}`;
  }

  /**
   * Validate token format (basic validation)
   */
  static validateTokenFormat(token: string): { valid: boolean; error?: string } {
    if (!token || token.trim().length === 0) {
      return { valid: false, error: 'Access token is required' };
    }

    if (token.length < 20) {
      return { valid: false, error: 'Access token appears to be too short' };
    }

    // Check for common token patterns (Instagram tokens are typically long alphanumeric strings)
    const tokenPattern = /^[A-Za-z0-9_-]+$/;
    if (!tokenPattern.test(token)) {
      return { valid: false, error: 'Access token contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Validate user ID format
   */
  static validateUserIdFormat(userId: string): { valid: boolean; error?: string } {
    if (!userId || userId.trim().length === 0) {
      return { valid: false, error: 'User ID is required' };
    }

    // Instagram user IDs are typically numeric
    const userIdPattern = /^\d+$/;
    if (!userIdPattern.test(userId)) {
      return { valid: false, error: 'User ID must be numeric' };
    }

    return { valid: true };
  }
}