/**
 * GTM Auth Events
 * Login and signup tracking.
 */
import { pushEvent } from "./gtm";
import { LOGIN, SIGN_UP } from "./events";

export interface TrackLoginParams {
  userId?: number | string;
  method?: string;
}

export function trackLogin(params: TrackLoginParams = {}): void {
  pushEvent(LOGIN, {
    ...(params.userId !== undefined ? { user_id: String(params.userId) } : {}),
    ...(params.method ? { method: params.method } : {}),
  });
}

export interface TrackSignUpParams {
  userId?: number | string;
  method?: string;
}

export function trackSignUp(params: TrackSignUpParams = {}): void {
  pushEvent(SIGN_UP, {
    ...(params.userId !== undefined ? { user_id: String(params.userId) } : {}),
    ...(params.method ? { method: params.method } : {}),
  });
}