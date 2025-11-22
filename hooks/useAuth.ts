"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("repto_token");
    if (!stored) {
      router.replace("/login");
      return;
    }
    setToken(stored);
    setLoading(false);
  }, [router]);

  async function apiClient() {
    const stored = localStorage.getItem("repto_token");
    const instance = axios.create();
    if (stored) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    }
    return instance;
  }

  function logout() {
    localStorage.removeItem("repto_token");
    router.replace("/login");
  }

  return { token, loading, apiClient, logout };
}
