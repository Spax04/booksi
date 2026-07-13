// Types
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { IBaseResponse, TAxiosError } from '../../types/responses';

// Utilities
import { BASE_URL, DEFAULT_REQ_METHOD } from '../utils/constans';
import { getDefaultHeaders, getDefaultReqOptions } from '../utils/helpers';
import { decryptData, encryptData } from '../utils/secret.utils';

type BaseReqOptions = {
  method: string,
  data: string
};

export function useRequest() {
  const initRequestOptions = <T>(
    data: T,
    options?: { method?: string },
  ): BaseReqOptions => ({
      method: options?.method ?? DEFAULT_REQ_METHOD,
      ...(data && { data: JSON.stringify(data) }),
    });

  const axiosRequest = async <T>(
    path: string,
    options?: AxiosRequestConfig & { authToken?: string, isEncrypted?: boolean },
  ): Promise<T | { success: boolean; error: TAxiosError }> => {
    const authToken = options?.authToken ?? null;

    const headers = getDefaultHeaders(authToken || '');

    const fetchOptions = getDefaultReqOptions(options?.method);

    if (options?.data) {
      fetchOptions.data = options.isEncrypted ? {
        data: encryptData(options.data),
      } : options.data;
    }

    if (options?.headers) {
      options.headers?.forEach(([key, val]: [string, string]) => {
        headers[key] = val;
        if (val === null) {
          delete headers[key];
        }
      });
    }

    fetchOptions.headers = new Headers(headers);

    const axiosOptions = {
      method: fetchOptions.method,
      url: BASE_URL + path,
      headers,
      data: fetchOptions.data,
    } as AxiosRequestConfig;

    try {
      const res: any = await axios<IBaseResponse>(axiosOptions);
    // @ts-ignore
      return options?.isEncrypted ? JSON.parse(decryptData(res.data)) as T : res.data as T;
    } catch (err) {
      console.log('useRequest throw an error', err);

      return {
        success: false,
        error: err as AxiosError & TAxiosError,
      };
    }
  };

  return { axiosRequest, initRequestOptions };
}
