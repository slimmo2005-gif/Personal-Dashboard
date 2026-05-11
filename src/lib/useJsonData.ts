import { useEffect, useState } from "react";
import { dataUrl } from "./dataPath";

type Status = "idle" | "loading" | "ok" | "error";

export function useJsonData<T>(file: string): { data: T | null; status: Status; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    fetch(dataUrl(file))
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json() as Promise<T>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setStatus("ok");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { data, status, error };
}
