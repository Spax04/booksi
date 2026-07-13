import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import {jwtDecode} from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '../useAppStore';
import { CommonController } from '../../services';
import {
  GetPlatformDataRes, IBaseResponse, TAxiosError, TGetCommissionPlansRes, TGetShop,
} from '../../types/responses';
import { commonActions } from '../../store/common/slice';
import { getAuthenticateUser, getTokenDetails } from '../../store/authenticate/selectors';
import { TUpdateUserReq } from '../../types/requests';
import { authActions } from '../../store/authenticate/slice';
import { TPhone } from '../../types';
import { useError } from '../useCommon';
import { TTokenDetails } from '../../store/authenticate/types';
import { setSessionVal } from '../../utils/storage.util';
import { TOKEN_KEY } from '../../data';
import { CommissionsController } from '../../services/commissions.api';
import { commissionsActions } from '../../store/commissions/slice';

const loadLocationsReq = async (shopName: string) => {
  const data = {
    shopName,
  };

  return CommonController().loadLocations(data);
};

export function useCommonAPI() {
  const dispatch = useAppDispatch();
  const authenticateUser = useAppSelector(getAuthenticateUser);

  const loadLocations = useMutation(() => loadLocationsReq(authenticateUser.personnel.shopName), {
    onSuccess: (rsp: any) => {
      if (rsp?.success) {
        dispatch(authActions.setAuthenticateUser({
          ...authenticateUser,
          shop: {
            ...authenticateUser.shop,
            locationsData: rsp.locations,
          },
        }));
      }
    },
  });

  const getPlatformData = async (shopName: string) => {
    const data = {
      shopName,
    };

    try {
      const [rsp, commissionRsp] = await Promise.all([CommonController()
        .getPlatformData<GetPlatformDataRes>(data),
      CommissionsController().getCommissionsPlans<TGetCommissionPlansRes>(data)]);

      if (rsp?.success && 'data' in rsp && 'commissionPlans' in commissionRsp) {
        dispatch(commonActions.setPlatformData(rsp.data.categories));
        dispatch(commissionsActions.setCommissionPlans(commissionRsp.commissionPlans));
      } else if ('msg' in rsp) {
        console.error(`ERROR! get data failed! ${rsp.msg}`);
      }

      return rsp;
    } catch (err) {
      console.error(`ERROR! get data request threw an Exception! ${err}`);

      const { response }: any = err as AxiosError;

      return {
        success: false,
        msg: response?.data?.msg ?? '',
      };
    }
  };

  return {
    getPlatformData,
    loadLocations,
  };
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

  return useMutation(updateUserApi, {
    onSuccess: (rsp, variables) => {
      if (rsp?.success) {
        dispatch(authActions.setAuthenticateUser({
          ...authenticateUser,
          personnel: {
            ...personnel,
            phone: { e164: variables.phone } as TPhone,
            name: variables.name,
          },
        }));
        dispatch(authActions.setTokenDetails({
          ...tokenDetails,
          settings: variables.settings,
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
  const { enqueueSnackbar } = useSnackbar();
  const { handleReqError } = useError();
  const { t } = useTranslation('help');

  const sendFeedbackApi = (data: { rating: number | string, message: string }) => {
    const payload = {
      ...data,
      rating: String(data.rating),
      userName: personnel.name,
      email: personnel.email,
      shopName: personnel.shopName,
    };

    return CommonController().sendFeedback<IBaseResponse>(payload);
  };

  return useMutation(sendFeedbackApi, {
    onSuccess: (rsp) => {
      if (rsp.success) {
        enqueueSnackbar(`${t('feedbackWasSent')}`, {
          variant: 'success',
        });
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

export function useSetDefaultShopAPI() {
  const { personnel } = useAppSelector(getAuthenticateUser);
  const { enqueueSnackbar } = useSnackbar();
  const { handleReqError } = useError();
  const dispatch = useAppDispatch();
  const tokenDetails = useAppSelector(getTokenDetails);
  const { t } = useTranslation('settings');

  const setDefaultShop = (data: { shopName: string }) => {
    const payload = {
      shopName: data.shopName,
      email: personnel.email,
    };

    return CommonController().setDefaultShop<IBaseResponse>(payload);
  };

  return useMutation(setDefaultShop, {
    onSuccess: (rsp, variables) => {
      if (rsp.success) {
        dispatch(authActions.setTokenDetails({
          ...tokenDetails,
          defaultShop: variables.shopName,
        }));
        enqueueSnackbar(`${t('defaultShopWasChange')}`, {
          variant: 'success',
        });
      } else if (rsp?.error && rsp.error?.response?.status) {
        handleReqError(rsp.error);
      } else if ('msg' in rsp) {
        console.error(`ERROR! set default shop failed! ${rsp.msg}`);
      }
    },
    onError: (error: TAxiosError) => {
      console.error(`ERROR! set default shop request threw an Exception! ${error}`);
    },
  });
}

export function useGetShopAPI() {
  const authenticateUser = useAppSelector(getAuthenticateUser);
  const { handleReqError } = useError();
  const dispatch = useAppDispatch();

  const getShop = (data: { shopName: string }) => {
    const payload = {
      shopName: data.shopName,
      email: authenticateUser.personnel.email,
    };

    return CommonController().getShop<TGetShop>(payload);
  };

  return useMutation(getShop, {
    onSuccess: (rsp) => {
      if (rsp.success && 'personnel' in rsp) {
        const data = {
          ...authenticateUser,
          personnel: rsp.personnel,
          shop: rsp.shop,
        };

        const tokenDetails: TTokenDetails = jwt_decode(rsp.newToken);

        dispatch(authActions.setAuthenticateUser(data));

        dispatch(authActions.setTokenDetails({
          ...tokenDetails,
          permissions: tokenDetails.permissions,
        }));

        setSessionVal(TOKEN_KEY, rsp.newToken, 'sessionStorage');

        window.location.reload();
      } else if (rsp?.error && rsp.error?.response?.status) {
        handleReqError(rsp.error);
      } else if ('msg' in rsp) {
        console.error(`ERROR! get shop failed! ${rsp.msg}`);
      }
    },
    onError: (error: TAxiosError) => {
      console.error(`ERROR! get shop request threw an Exception! ${error}`);
    },
  });
}
