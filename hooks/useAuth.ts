import { jwtDecode } from "jwt-decode";
import { TOKEN_KEY } from '../lib/utils/constans';
import { getSessionValue } from '../lib/utils/storage.utils';
import { TTokenDetails } from '../store/auth/types';

export function useAuth() {
  const getIdToken = (token?: string): string | null => {
    if (token) return token;
    return getSessionValue(TOKEN_KEY, 'sessionStorage');
  };

  const isLoggedIn = (): boolean => {
    const idToken = getIdToken();
    return !!idToken;
  };

  const isTokenExpired = () => {
    const token = getIdToken();

    if (!token) {
      return true;
    }

    const tokenDetails = jwtDecode<TTokenDetails>(token);

    return (new Date(tokenDetails?.expiration)?.getTime() || 0) <= new Date().getTime();
  };

  return {
    isLoggedIn,
    isTokenExpired,
    getIdToken,
  };
}
