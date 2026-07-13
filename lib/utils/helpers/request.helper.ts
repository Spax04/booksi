import { AxiosBasicCredentials, Method } from 'axios';
import { DEFAULT_REQ_METHOD, TOKEN_KEY } from '../constans';
import { getSessionValue } from '../storage.utils';

const getIdToken = (token?: string) => {
  if (token) return token;
  return getSessionValue(TOKEN_KEY, 'sessionStorage') as string;
};

const getDefaultHeaders = (authToken: string | AxiosBasicCredentials) => ({
  Authorization: `Bearer ${getIdToken('') || authToken}`,
  'Content-Type': 'application/json; charset=utf-8',
  MMT: getIdToken('') || authToken,
} as unknown as { [key: string]: string });

const getDefaultReqOptions = (method?: Method | string) => ({
  method: method ?? DEFAULT_REQ_METHOD,
  mode: 'cors',
  cache: 'no-cache',
  data: {},
  headers: {} as HeadersInit,
});

export {
  getDefaultHeaders,
  getDefaultReqOptions,
  getIdToken,
};
