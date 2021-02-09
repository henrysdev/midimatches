import { useState } from "react";

export function useLoad(defaultdata = {}) {
  const [loadStatus, setLoadStatus] = useState({
    data: defaultdata,
    loading: false,
    loaded: false,
    loadError: false,
  });

  function setLoading(): void {
    setLoadStatus({
      data: loadStatus.data,
      loading: true,
      loaded: false,
      loadError: false,
    });
  }

  function setDone(data: any): void {
    setLoadStatus({ data, loading: false, loaded: true, loadError: false });
  }

  function setFailed(): void {
    setLoadStatus({
      data: defaultdata,
      loading: false,
      loadError: true,
      loaded: false,
    });
  }

  async function fetchData(loader: any, ...rest: any): Promise<void> {
    setLoading();

    try {
      const data = await loader(...rest);

      if (!data) {
        setFailed();
      } else {
        setDone(data);
      }
    } catch (e) {
      setFailed();
    }
  }

  async function fetchPostData(loader: any, ...rest: any): Promise<void> {
    setLoading();

    console.log("loader: ", loader);
    console.log("rest: ", ...rest);

    try {
      const data = await loader(...rest);

      if (!data) {
        setFailed();
      } else {
        setDone(data);
      }
    } catch (e) {
      setFailed();
    }
  }

  return { ...loadStatus, fetchData, fetchPostData };
}
