import { router } from 'expo-router';

// Third party
import { useMutation } from '@tanstack/react-query';
import {jwtDecode} from 'jwt-decode';
//import { clarity } from 'react-microsoft-clarity';

//import i18n from 'i18next';
//import ReactGA from 'react-ga4';
//import { useTranslation } from 'react-i18next';
import { LoginController } from '../../services';
import { useAppDispatch, useAppSelector } from '../useAppStore';
import { authActions } from '../../store/auth/slice';

// Data
import { ROUTES, TOKEN_KEY } from '../../lib/utils/constans';

// Types
import { TAxiosError, TGetSettingsRes, TLoginRes } from '../../types/responses';
import { TLoginRequest } from '../../types/requests';

// Hooks
import { useCommonAPI, useUpdateUserAPI } from './useCommonApi';
import { TTokenDetails } from '../../store/auth/types';
import { setSessionVal } from '../../lib/utils/storage.utils';
//import { getSelectedLang } from '../../store/common/selectors';
import { useError } from '../useCommon';
//import { useCrisp } from '../../lib/hooks';
import { useAuth } from '../useAuth';
import { getAuthenticateUser } from '../../store/auth/selectors';

const loginApi = async (options: TLoginRequest) => {
  const {
    email,
    password,
    isHashPassword = true,
  } = options;

  const data = {
    email: email?.toLowerCase(),
    password,
  };

  const rsp = await LoginController().login<TLoginRes>(data);

  if (rsp?.success && 'data' in rsp) setSessionVal(TOKEN_KEY, rsp.data.authToken, 'sessionStorage');

  return rsp;
};

export function useLoginAPI() {
  const dispatch = useAppDispatch();

  const { getPlatformData } = useCommonAPI();

  const { mutateAsync: mutateUpdateUser } = useUpdateUserAPI();
  const { handleReqError } = useError();
  const { getIdToken } = useAuth();
  const { personnel } = useAppSelector(getAuthenticateUser);


  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (rsp: any, variables: any) => {
      if (rsp.success && 'data' in rsp) {
        const authToken = rsp.data.authToken || '';

        const userData = { ...rsp.data };

        if (!rsp.data?.user?.settings) {
          userData.user = {
            name: userData.personnel.name,
          };
        }

        dispatch(authActions.setAuthenticateUser(userData));

        const tokenDetails: TTokenDetails = jwtDecode(authToken);

        dispatch(authActions.setTokenDetails({
          ...tokenDetails,
          external_id: ''
        }));

        if (variables?.isRegistered) {
          if (tokenDetails.subscription?.plan === 'free') {
            router.push({ pathname: '/(tabs)/(home)' });
          } else {
           // router.push({ pathname: '/onboarding/invite-team' });
          }
        }

       
      } else if (rsp?.error && rsp.error?.response?.status) {
        handleReqError(rsp.error, variables);
      } else if ('msg' in rsp) {
        console.error(`ERROR! login request failed! ${rsp.msg}`);
      }
    },
    onError: (error: TAxiosError) => {
      console.error(`ERROR! login request threw an Exception! ${error}`);
    },
  });
}
