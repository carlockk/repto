"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Delivery {
  _id: string;
  trackingCode: string;
  customerName: string;
  address: string;
  status: string;
}

export default function DeliveriesPage() {
  const { loading, apiClient, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const client = await apiClient();
        const res = await client.get("/api/deliveries");
        setDeliveries(res.data.deliveries || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Error al cargar entregas");
      } finally {
        setFetching(false);
      }
    })();
  }, [loading, apiClient]);

  if (loading) {
    return <div className="text-center">Verificando sesión...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">Mis entregas</h1>
        <button
          onClick={logout}
          className="text-xs text-red-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
      {fetching && <p>Cargando entregas...</p>}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1">
          {error}
        </p>
      )}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {deliveries.map((d) => (
          <Link
            key={d._id}
            href={`/deliveries/${d._id}`}
            className="block border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <div className="font-medium">
              {d.trackingCode} — {d.customerName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {d.address}
            </div>
            <div className="text-xs mt-1">
              Estado:{" "}
              <span className="font-semibold capitalize">
                {d.status.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
        {!fetching && deliveries.length === 0 && (
          <p className="text-sm text-slate-500">No tienes entregas asignadas.</p>
        )}
      </div>
    </div>
  );
}
