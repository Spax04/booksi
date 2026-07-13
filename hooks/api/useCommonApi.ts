import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '../useAppStore';
import { CommonController } from '../../services';
import {
 IBaseResponse, TAxiosError
} from '../../types/responses';
import { getAuthenticateUser, getTokenDetails } from '../../store/auth/selectors';
import { TUpdateUserReq } from '../../types/requests';
import { authActions } from '../../store/auth/slice';
import { useError } from '../useCommon';
import { TTokenDetails } from '../../store/auth/types';
import { setSessionVal } from '../../lib/utils/storage.utils';
import { TOKEN_KEY } from '../../lib/utils/constans';
import { Toast } from 'toastify-react-native'

const loadLocationsReq = async (shopName: string) => {
  const data = {
    shopName,
  };

  return CommonController().loadLocations(data);
};

export function useCommonAPI() {
  const dispatch = useAppDispatch();
  const authenticateUser = useAppSelector(getAuthenticateUser);

}

export function useUpdateUserAPI() {
  const authenticateUser = useAppSelector(getAuthenticateUser);
  const dispatch = useAppDispatch();
  const tokenDetails = useAppSelector(getTokenDetails);

  const { personnel } = authenticateUser;
  const { handleReqError } = useError();

  const updateUserApi = (payload: TUpdateUserReq['userData']) => {
    const data = {
      userData: {
        ...payload,
      },
      email: personnel.email,
    };

    return CommonController().updateUser<IBaseResponse>(data);
  };

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: (rsp, variables) => {
      if (rsp?.success) {
        dispatch(authActions.setAuthenticateUser({
          ...authenticateUser,
          personnel: {
            ...personnel,
          },
        }));
        dispatch(authActions.setTokenDetails({
          ...tokenDetails,
        }));
      } else if (rsp?.error && rsp.error?.response?.status) {
        handleReqError(rsp.error, variables);
      } else if ('msg' in rsp) {
        console.error(`ERROR! update user failed! ${rsp.msg}`);
      }
    },
    onError: (error: TAxiosError) => {
      console.error(`ERROR! update user request threw an Exception! ${error}`);
    },
  });
}

export function useFeedbackAPI() {
  const { personnel } = useAppSelector(getAuthenticateUser);
  const { handleReqError } = useError();

  const sendFeedbackApi = (data: { rating: number | string, message: string }) => {
    const payload = {
      ...data,
      rating: String(data.rating),
      userName: personnel.name || '',
      email: personnel.email,
    };

    return CommonController().sendFeedback<IBaseResponse>(payload);
  };

  return useMutation({
    mutationFn: sendFeedbackApi,
    onSuccess: (rsp) => {
      if (rsp.success) {
        Toast.success('Feedback sent successfully!');
      } else if (rsp?.error && rsp.error?.response?.status) {
        handleReqError(rsp.error);
      } else if ('msg' in rsp) {
        console.error(`ERROR! send feedback failed! ${rsp.msg}`);
      }
    },
    onError: (error: TAxiosError) => {
      console.error(`ERROR! send feedback request threw an Exception! ${error}`);
    },
  });
}