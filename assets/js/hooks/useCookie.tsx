import { useMemo } from "react";
import Cookies from "universal-cookie";

type CookieTuple = [
  (cookieName: string) => boolean,
  (cookieName: string) => any,
  (cookieName: string, cookieVal: any, extraOptions?: Object) => void
];

export function useCookie(): CookieTuple {
  const cookies = useMemo(() => new Cookies(), []);

  const hasCookie = (cookieName: string): boolean => {
    return cookies.get(cookieName) === undefined;
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
      maxAge: 86400,
      secure: true,
      ...extraOptions,
    });
  };

  return [hasCookie, getCookie, setCookie];
}
