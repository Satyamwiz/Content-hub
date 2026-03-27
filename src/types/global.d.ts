declare global {
  var twitterAuthStates: Map<string, { codeVerifier: string; state: string }> | undefined;
}

export {};