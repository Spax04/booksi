import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';

// Internal Imports
import { BASE_URL } from '../../lib/utils/constans';
import { LoginController, UserController } from '../../services';
import { QUERY_KEYS } from 'web_common/shared-logic/constants';
import { TLoginReq, TLoginRes, TNewUser, TProfileImage } from 'web_common/shared-logic/types';
import { TBaseDataResponse } from '../../types';
import { TOKEN_KEY, TOKEN_KEY_COGNITO, TOKEN_KEY_REFRESH } from '../../data';
import { hashPassword } from '../../lib/utils/common';
import { setSessionVal } from '../../lib/utils/storage';

// Store & Context
import { useAppDispatch } from '../useAppStore';
//import { useAuth } from '../useAuth';
import { authActions } from '../../store/auth/slice';
import { IRootState } from '../../store/auth/types';

export const useLoginApi = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [_, setCookie] = useCookies(['user']);
  const { mutateAsync: changePasswordEmail } = useUpdatePasswordEmailApi();

  const loginApi = async (options: TLoginReq & { rememberMe?: boolean }) => {
    const { email, password, isHashPassword = true, isGoogle } = options;
    const payload = {
      email: email?.toLowerCase(),
      password: isHashPassword ? hashPassword(password) : password,
      isGoogle,
    };

    const rsp = await LoginController().login<TLoginRes & { data: { idToken: string; refreshToken: string } }>(
      payload,
      { token: '', baseUrl: BASE_URL || '' }
    );

    if (rsp?.success && 'data' in rsp) {
      setSessionVal(TOKEN_KEY, rsp.data.authToken, 'localStorage');
      setSessionVal(TOKEN_KEY_COGNITO, rsp.data.idToken, 'localStorage');
      setSessionVal(TOKEN_KEY_REFRESH, rsp.data.refreshToken, 'localStorage');
    }
    return rsp;
  };

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (rsp, variables) => {
      if ('error' in rsp && rsp?.error?.response?.status === 400) {
        await changePasswordEmail(variables.email);
      }

      if (rsp?.success && 'data' in rsp) {
        const tokenDetails: any = jwtDecode(rsp.data.authToken);
        
        dispatch(authActions.setAuthenticateUser({ ...rsp.data, external_id: tokenDetails.external_id } as IRootState['authenticateUser']));
        dispatch(authActions.setTokenDetails(tokenDetails as IRootState['tokenDetails']));

        if (variables.rememberMe) {
          setCookie('user', { email: variables.email, password: variables.password });
        }

        if ((window as any)?.ReactNativeWebView) {
          (window as any)?.ReactNativeWebView.postMessage(JSON.stringify({ personnel: rsp.data.personnel, isLogIn: true }));
        }

        if (variables.isRedirect) navigate('/team');
      }
    },
  });
};

export const useRegisterApi = () => {
  const { mutateAsync: loginMutate } = useLoginApi();

  return useMutation({
    mutationFn: (newUser: TNewUser) => LoginController().register<TBaseDataResponse>({
      ...newUser,
      password: newUser.isCampaign ? (newUser?.password ?? '') : hashPassword(newUser?.password ?? ''),
    }, { token: '', baseUrl: BASE_URL || '' }),
    onSuccess: async (data, variables) => {
      if (data.success) {
        await loginMutate({ email: variables.email || '', password: variables.password || '', isRedirect: false });
      }
    },
  });
};

export const useUpdatePasswordEmailApi = () => {
  const { getIdToken } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (email: string) => LoginController().updatePasswordEmail({ email }, { token: getIdToken() || '', baseUrl: BASE_URL || '' }),
    onSuccess: (rsp: any) => { if (rsp.success) navigate('/resetPasswordPage'); },
  });
};

export const useSetPasswordAPI = () => {
  const { getIdToken } = useAuth();
  const { mutateAsync: loginMutate } = useLoginApi();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { password: string; resetKey: string; email: string }) => 
      LoginController().setPassword(payload, { token: getIdToken() || '', baseUrl: BASE_URL || '' }),
    onSuccess: async (_, variables) => {
      await loginMutate({ email: variables.email, password: variables.password, isRedirect: false, isHashPassword: false });
      navigate('/events');
    },
  });
};

export const useGetPersonnel = (options: { email: string }) => {
  const { getIdToken } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.USER.GET_PERSONNEL],
    queryFn: async () => {
      const rsp = await LoginController().getPersonnel<TLoginRes>({ email: options.email?.toLowerCase() }, { token: getIdToken() || '', baseUrl: BASE_URL || '' });
      return rsp.success && 'data' in rsp ? rsp.data : rsp;
    },
  });
};

export const useGetFollowers = (options: { email: string }) => {
  const { getIdToken, isLoggedIn } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.USER.GET_FOLLOWERS],
    enabled: isLoggedIn(),
    queryFn: async () => {
      const rsp = await LoginController().getFollowers<any>({ email: options.email?.toLowerCase() }, { token: getIdToken() || '', baseUrl: BASE_URL || '' });
      return rsp.success && 'data' in rsp ? rsp.data : rsp;
    },
  });
};

export const useGetUserById = (options: { id: string }) => {
  const { getIdToken } = useAuth();
  return useQuery({
    queryKey: [QUERY_KEYS.USER.GET_USER_BY_ID],
    queryFn: async () => {
      const rsp = await LoginController().getUser<TLoginRes>({ id: options.id?.toLowerCase() }, { token: getIdToken() || '', baseUrl: BASE_URL || '' });
      return rsp.success && 'data' in rsp ? rsp.data : rsp;
    },
  });
};

export const useAddFieldsToUserApi = () => {
  const { getIdToken } = useAuth();
  return useMutation({
    mutationKey: ['addFields'],
    mutationFn: (user: any) => UserController().addFieldsBubblesToUser(user, { token: getIdToken() || '', baseUrl: BASE_URL || '' }),
  });
};

export const useAddFieldsToExpoUserApi = () => {
  const { getIdToken } = useAuth();
  return useMutation({
    mutationKey: ['addFields'],
    mutationFn: (options: TNewUser & { images: Array<TProfileImage> }) => 
      UserController().addFieldsToExpoUser(options, { token: getIdToken() || '', baseUrl: BASE_URL || '' }),
  });
};