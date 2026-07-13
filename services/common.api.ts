import { useRequest } from '../lib/hooks';

import { CONTROLLERS } from '../lib/utils/enums';
import { TSendFeedbackReq, TUpdateUserReq } from '../types/requests';
import { TAxiosError } from '../types/responses';

export function CommonController() {
  const {
    axiosRequest,
    initRequestOptions,
  } = useRequest();

  const controllerName = CONTROLLERS.COMMON;
  const getPlatformData = <T>(data: { shopName: string }): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/data`, options);
  };

  const loadLocations = <T>(data: { shopName: string }): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/load_locations`, options);
  };

  const updateUser = <T>(data: TUpdateUserReq): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/update_user`, options);
  };

  const sendFeedback = <T>(data: TSendFeedbackReq): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/feedback`, options);
  };

  const setDefaultShop = <T>(data: { email: string, shopName: string }): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/set_default_shop`, options);
  };

  const getShop = <T>(data: { email: string, shopName: string }): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/get_shop`, options);
  };

  return {
    getPlatformData,
    loadLocations,
    updateUser,
    sendFeedback,
    setDefaultShop,
    getShop,
  };
}
