"use client";

import { useMusicStore } from "@/lib/store";

export function MusicStoreDebug() {
  const store = useMusicStore();
  
  return (
    <div className="fixed top-0 right-0 m-4 p-4 bg-black/80 text-white rounded">
      <pre>{JSON.stringify(store, null, 2)}</pre>
    </div>
  );
} 