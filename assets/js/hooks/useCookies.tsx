import { useMemo } from "react";
import Cookies from "universal-cookie";

type CookieMethods = {
  hasCookie: (cookieName: string) => boolean;
  getCookie: (cookieName: string) => any;
  setCookie: (
    cookieName: string,
    cookieVal: any,
    extraOptions?: Object
  ) => void;
};

export function useCookies(): CookieMethods {
  const cookies = useMemo(() => new Cookies(), []);

  const hasCookie = (cookieName: string): boolean => {
    return cookies.get(cookieName) !== undefined;
  };

  const getCookie = (cookieName: string): any => {
    return cookies.get(cookieName);
  };

  const setCookie = (
    cookieName: string,
    cookieVal: any,
    extraOptions: Object = {}
  ): void => {
    cookies.set(cookieName, cookieVal, {
      path: "/",
      // 1000 year session cookie
      maxAge: 24 * 60 * 60 * 365 * 1000,
      ...extraOptions,
    });
  };

  return { hasCookie, getCookie, setCookie };
}
