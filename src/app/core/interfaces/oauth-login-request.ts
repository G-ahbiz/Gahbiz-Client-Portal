export interface OAuthLoginRequest {
  provider: string;   // "Facebook"
  idToken: string;    // fb access token
  role: string;       // optional if you pass it
}