import { useState } from "react";
import { unmarshalBody } from "../utils";

const successStatusCodes = [200, 201, 202, 203, 204, 205, 206];

export function useLoad(defaultdata = {}) {
  const [loadStatus, setLoadStatus] = useState({
    data: defaultdata,
    httpStatus: undefined,
    loading: false,
    loaded: false,
    loadError: false,
  });

  function setLoading(): void {
    setLoadStatus({
      data: loadStatus.data,
      httpStatus: undefined,
      loading: true,
      loaded: false,
      loadError: false,
    });
  }

  function setDone(data: any, httpStatus: any): void {
    setLoadStatus({
      data,
      httpStatus,
      loading: false,
      loaded: true,
      loadError: false,
    });
  }

  function setFailed(httpStatus: any, errorData: any = defaultdata): void {
    setLoadStatus({
      data: errorData,
      httpStatus,
      loading: false,
      loadError: true,
      loaded: false,
    });
  }

  async function fetchData(loader: any, ...rest: any): Promise<void> {
    setLoading();

    try {
      const response = await loader(...rest);
      const httpStatusCode = (await response.status) || 500;
      const data = await response.json();
      const formattedData = unmarshalBody(data);

      if (!formattedData) {
        setFailed(httpStatusCode);
      } else if (!successStatusCodes.includes(httpStatusCode)) {
        setFailed(httpStatusCode, formattedData);
      } else {
        setDone(formattedData, httpStatusCode);
      }
    } catch (e) {
      setFailed(500);
    }
  }

  async function fetchPostData(loader: any, ...rest: any): Promise<void> {
    setLoading();

    try {
      const data = await loader(...rest);
      const httpStatusCode = (await data.status) || 500;

      if (!data) {
        setFailed(httpStatusCode);
      } else if (!successStatusCodes.includes(httpStatusCode)) {
        setFailed(httpStatusCode, data);
      } else {
        setDone(data, httpStatusCode);
      }
    } catch (e) {
      setFailed(500);
    }
  }

  return { ...loadStatus, fetchData, fetchPostData };
}
