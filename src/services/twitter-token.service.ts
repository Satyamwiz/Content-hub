import { TwitterAuthTokens } from './twitter.service';

// In-memory storage for development - replace with database in production
class TwitterTokenStore {
  private tokens: Map<string, TwitterAuthTokens> = new Map();
  private authStates: Map<string, { codeVerifier: string; state: string }> = new Map();

  // Store OAuth state for verification
  storeAuthState(sessionId: string, codeVerifier: string, state: string): void {
    this.authStates.set(sessionId, { codeVerifier, state });
  }

  // Get OAuth state
  getAuthState(sessionId: string): { codeVerifier: string; state: string } | null {
    return this.authStates.get(sessionId) || null;
  }

  // Remove OAuth state after use
  removeAuthState(sessionId: string): void {
    this.authStates.delete(sessionId);
  }

  // Store user tokens
  storeTokens(userId: string, tokens: TwitterAuthTokens): void {
    this.tokens.set(userId, tokens);
  }

  // Get user tokens
  getTokens(userId: string): TwitterAuthTokens | null {
    return this.tokens.get(userId) || null;
  }

  // Remove user tokens
  removeTokens(userId: string): void {
    this.tokens.delete(userId);
  }

  // Check if tokens exist and are valid
  hasValidTokens(userId: string): boolean {
    const tokens = this.tokens.get(userId);
    if (!tokens) return false;
    
    // Check if tokens are expired
    if (tokens.expiresAt && tokens.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  }

  // Get all stored user IDs (for cleanup/debugging)
  getAllUserIds(): string[] {
    return Array.from(this.tokens.keys());
  }
}

export const twitterTokenService = new TwitterTokenStore();

// Helper functions for easier access
export class TwitterTokenService {
  static storeAuthState(sessionId: string, codeVerifier: string, state: string): void {
    twitterTokenService.storeAuthState(sessionId, codeVerifier, state);
  }

  static getAuthState(sessionId: string): { codeVerifier: string; state: string } | null {
    return twitterTokenService.getAuthState(sessionId);
  }

  static removeAuthState(sessionId: string): void {
    twitterTokenService.removeAuthState(sessionId);
  }

  static storeTokens(userId: string, tokens: TwitterAuthTokens): void {
    twitterTokenService.storeTokens(userId, tokens);
  }

  static getTokens(userId: string): TwitterAuthTokens | null {
    return twitterTokenService.getTokens(userId);
  }

  static removeTokens(userId: string): void {
    twitterTokenService.removeTokens(userId);
  }

  static hasValidTokens(userId: string): boolean {
    return twitterTokenService.hasValidTokens(userId);
  }

  static async refreshTokensIfNeeded(userId: string): Promise<TwitterAuthTokens | null> {
    const tokens = twitterTokenService.getTokens(userId);
    if (!tokens) return null;

    // Check if tokens need refresh (refresh 5 minutes before expiry)
    const needsRefresh = tokens.expiresAt && 
      tokens.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

    if (needsRefresh && tokens.refreshToken) {
      try {
        const { TwitterService } = await import('./twitter.service');
        const newTokens = await TwitterService.refreshAccessToken(tokens.refreshToken);
        twitterTokenService.storeTokens(userId, newTokens);
        return newTokens;
      } catch (error) {
        console.error('Failed to refresh Twitter tokens:', error);
        // Remove invalid tokens
        twitterTokenService.removeTokens(userId);
        return null;
      }
    }

    return tokens;
  }
}