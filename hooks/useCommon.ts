import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment-timezone';
import * as Sentry from '@sentry/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import ReactGA from 'react-ga4';
import { useQueryClient } from '@tanstack/react-query';
import { Crisp } from 'crisp-sdk-web';
import { AVATAR_FOLDER, COLORS } from '../data';
import {
  convertToCamelCase,
  getDatesRange,
  getIdToken,
  getShortMemberName,
} from '../utils/helpers';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { getAuthenticateUser, getTokenDetails } from '../store/authenticate/selectors';
import { PERMISSIONS } from '../utils/enums';
import { getMembers } from '../store/team/selectors';
import { TAxiosError } from '../types/responses';
import { persistor } from '../store';
import { commonActions } from '../store/common/slice';
import {
  getCategories, getProductTypes, getTags, getVendors,
} from '../store/inventory/selector';

export function useAvatarFile(avatarFile: string | null | undefined) {
  const avatarSrc = useMemo(() => {
    if (avatarFile?.length) {
      return `${AVATAR_FOLDER}${avatarFile}`;
    }
    return '';
  }, [avatarFile]);

  return { avatarSrc };
}

export function useShortName(name: string) {
  const shortName = useMemo(() => {
    if (name?.length) return getShortMemberName(name);
    return '';
  }, [name]);

  return {
    shortName,
  };
}

export function useUserLocations() {
  const { shop } = useAppSelector(getAuthenticateUser);

  const userLocations = useMemo(() => shop?.locationsData || [], [shop?.locationsData]);

  return {
    userLocations,
  };
}

export function useMembersData() {
  const members = useAppSelector(getMembers);

  const membersData = useMemo(() => {
    const membersDepartments = [...new Set(members.map((member) => member.department))];

    const membersPositions = [...new Set(members.map((member) => member.position))];

    return {
      membersDepartments,
      membersPositions,
    };
  }, [members]);

  return {
    membersData,
  };
}

export function useInventoryData() {
  const inventoryCategoriesList = useAppSelector(getCategories);
  const vendorsList = useAppSelector(getVendors);
  const productTypelist = useAppSelector(getProductTypes);
  const tagsList = useAppSelector(getTags);

  const inventoryData = useMemo(() => {
    const inventoryCategory = inventoryCategoriesList;
    const inventoryVendors = vendorsList;
    const inventoryProductTypes = productTypelist;
    const inventoryTags = tagsList;

    return {
      inventoryCategory,
      inventoryVendors,
      inventoryProductTypes,
      inventoryTags,
    };
  }, [inventoryCategoriesList, vendorsList, productTypelist, tagsList]);

  return {
    inventoryData,
  };
}

export function useQueryParams() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export function usePermissions() {
  const tokenDetails = useAppSelector(getTokenDetails);

  const permissions = useMemo(() => ({
    isAdmin: tokenDetails.permissions?.permissionLevel === PERMISSIONS.ADMIN,
    isManager: tokenDetails.permissions?.permissionLevel === PERMISSIONS.MANAGER,
    isEmployee: tokenDetails.permissions?.permissionLevel === PERMISSIONS.EMPLOYEE,
  }), [tokenDetails.permissions]);

  return {
    permissions,
  };
}

export function useRangePicker(isWeek = false) {
  const { fromDate, toDate } = getDatesRange({} as [Moment, Moment], isWeek);
  const dispatch = useAppDispatch();

  const [chosenDates, setChosenDate] = useState<[Moment, Moment]>([
    moment(fromDate),
    moment(toDate),
  ]);

  const [isBtnDisabled, setIsBtnDisabled] = useState(true);
  const handleSetDates = (dates: [Moment, Moment]) => {
    if (!dates[0]?.isValid() || !dates[1]?.isValid()) {
      console.error('Invalid date(s) provided');
      setIsBtnDisabled(true); // Disable button if dates are invalid
      return;
    }

    const prevEndDate = chosenDates[1]?.format();
    const newEndDate = dates[1]?.endOf('day').format();
    const prevStartDate = chosenDates[0]?.format();
    const newStartDate = dates[0]?.startOf('day').format();

    if (prevStartDate !== newStartDate || prevEndDate !== newEndDate) {
      setIsBtnDisabled(false);
      setChosenDate(dates);
    } else {
      setIsBtnDisabled(true);
    }
  };

  const closePicker = () => {
    dispatch(commonActions.toggleRangePicker(false));
  };

  return {
    handleSetDates,
    isBtnDisabled,
    chosenDates,
    setChosenDate,
    closePicker,
    setIsBtnDisabled,
  };
}

export function useCommon() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const { userLocations } = useUserLocations();
  const { personnel } = useAppSelector(getAuthenticateUser);

  const locationsByPermissions = permissions.isAdmin ? userLocations : personnel?.locations;

  const locationColorMap = new Map();

  const locationsWithColors = useMemo(() => locationsByPermissions?.map((location) => {
    const uniqueIdentifier = location.id || location.name || JSON.stringify(location);

    // Check if the location already has a color assigned
    if (!locationColorMap.has(uniqueIdentifier)) {
      // Assign a new color based on current map size
      const color = COLORS[locationColorMap.size % COLORS.length];
      locationColorMap.set(uniqueIdentifier, color);
    }

    // Retrieve the color for this location
    return {
      ...location,
      color: locationColorMap.get(uniqueIdentifier),
    };
  }), [locationsByPermissions]);

  const handleLogout = async () => {
    ReactGA.event(
      'Logout',
      {
        eventName: 'home_action_logout',
      },
    );
    await persistor.purge();
    queryClient.removeQueries();
    sessionStorage.removeItem('MM_AUTH');
    localStorage.clear();
    Crisp.setTokenId('');
    navigate('/');
  };

  return {
    locationsByPermissions,
    locationsWithColors,
    handleLogout,
  };
}

export function useError() {
  const tokenDetails = useAppSelector(getTokenDetails);
  const { personnel } = useAppSelector(getAuthenticateUser);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['warning', 'common']);
  const { handleLogout } = useCommon();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleReqError = (error: TAxiosError, data?: any) => {
    const token = getIdToken();

    const shopName = data?.shopName || personnel?.shopName;

    const apiCallName = error.request?.responseURL ? new URL(error.request.responseURL).pathname : '';

    if (shopName) {
      Sentry.setContext('SHOP_NAME', { shopName: personnel?.shopName });
    }

    if (apiCallName) {
      Sentry.setContext('API_CALL', { name: apiCallName });
    }

    if (location.pathname === '/team' && error?.response?.status === 402) {
      return dispatch(commonActions.setIsOpenPricingDialog(true));
    }

    if (data?.email) {
      Sentry.setUser({ email: data.email });
    }

    if ((error?.response?.status === 500 || error?.response?.status === 404) && data?.route !== 'forgot') {
      window.location.href = '/error';
    }

    const message: { url: string, msg: string, token: string, data?: any } = {
      url: error.request.responseURL,
      msg: error.response?.data?.msg,
      token,
    };

    if (data?.route === 'forgot') {
      enqueueSnackbar(`${t('forgotPasswordWrongEmail', { ns: 'warning', email: data.email })}`, {
        variant: 'warning',
        autoHideDuration: 10000,
      });
    }

    if (data) {
      message.data = data;
    }
    console.error(`${error.request.responseURL}: ${error.response?.data?.msg}`);

    if (error?.response?.status === 406) {
      const msgKey = convertToCamelCase(error.response?.data?.msg)?.replace('.', '');
      enqueueSnackbar(t(`${msgKey}`), {
        variant: 'warning',
      });
    }

    if (error?.response?.status === 400) {
      enqueueSnackbar(`${t('requestFailed', { ns: 'common' })}`, {
        variant: 'error',
      });
    }

    if (error?.response?.status === 401 || error.code === 'ERR_NETWORK') {
      handleLogout();
    }

    Sentry.setTag('locale', tokenDetails?.settings?.locale);

    Sentry.setContext('REQ_DATA', { ...message, MGM_AUTH: message.token?.replaceAll('.', ',') });

    Sentry.captureException(new Error(error.response?.data?.msg));

    return false;
  };

  return {
    handleReqError,
  };
}
