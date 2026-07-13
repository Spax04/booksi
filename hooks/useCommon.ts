import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { getAuthenticateUser, getTokenDetails } from '../store/auth/selectors';
import { TAxiosError } from '../types/responses';
import { persistor } from '../store';
import { router } from '@/.expo/types/router';
import { getIdToken } from '@/lib/utils/helpers/request.helper';


export function useCommon() {
  const queryClient = useQueryClient();
  const { personnel } = useAppSelector(getAuthenticateUser);

  const handleLogout = async () => {
   
    await persistor.purge();
    queryClient.removeQueries();
    router.push({ pathname: '/signin' })  };

  return {
    handleLogout,
  };
}

//! Implement logging
export function useError() {
  const tokenDetails = useAppSelector(getTokenDetails);
  const { personnel } = useAppSelector(getAuthenticateUser);
  const { handleLogout } = useCommon();
  const dispatch = useAppDispatch();

  const handleReqError = (error: TAxiosError, data?: any) => {
    const token = getIdToken();


    const apiCallName = error.request?.responseURL ? new URL(error.request.responseURL).pathname : '';

    if ((error?.response?.status === 500 || error?.response?.status === 404) && data?.route !== 'forgot') {
      window.location.href = '/error';
    }

    const message: { url: string, msg: string, token: string, data?: any } = {
      url: error.request.responseURL,
      msg: error.response?.data?.msg,
      token,
    };

    if (data) {
      message.data = data;
    }
    console.error(`${error.request.responseURL}: ${error.response?.data?.msg}`);

    if (error?.response?.status === 401 || error.code === 'ERR_NETWORK') {
      handleLogout();
    }

    return false;
  };

  return {
    handleReqError,
  };
}
