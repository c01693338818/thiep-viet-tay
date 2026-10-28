"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// true sau khi render ở client; dùng để tránh lệch HTML với state đọc từ localStorage.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
