import { useRequest } from "@/lib/hooks/useRequest";
import { CONTROLLERS } from "@/lib/utils/enums";
import {  TLoginRequest, TRegisterRequest, TResetPass } from '../types/requests';
import { TAxiosError } from '../types/responses';


export function LoginController(){
    const controllerName = CONTROLLERS.LOGIN;

    const {
        axiosRequest,
        initRequestOptions,
    } = useRequest();

    const login = <T>(data: TLoginRequest): Promise<T | { success: boolean; error: TAxiosError }> => {
    const requestOptions = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/authenticate`, requestOptions);
  };

  const forgotPass = <T>(data: { email: string }): Promise<T | { success: boolean; error: TAxiosError }> => {
    const requestOptions = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/reset`, requestOptions);
  };

  const resetPass = <T>(data: TResetPass): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/set_password`, options);
  };

  const register = <T>(data: TRegisterRequest): Promise<T | { success: boolean; error: TAxiosError }> => {
    const options = initRequestOptions(data, { method: 'POST' });

    return axiosRequest(`${controllerName}/register`, options);
  };

  return {
    register,
    login,
    forgotPass,
    resetPass,
  };
}