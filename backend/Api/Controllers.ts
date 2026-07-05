import { InstallationController } from './Installation/InstallationController';
import { LoginController } from './Login/LoginController';
import { CommonController } from './Common/CommonController';
import { SupportController } from './Support/SupportController';
import { SettingsController } from './Settings/SettingsController';
//import { AdminController } from './Admin/AdminController';

export function LoadPublicControllers(router: any) {
  SupportController(router); // TODO throttle / debounce
  InstallationController(router);
  LoginController(router);
}
export function LoadControllers(router: any) {
  CommonController(router);
  SettingsController(router);
}

export function LoadAdminControllers(router: any) {
  //AdminController(router);
}
