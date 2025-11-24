"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface Delivery {
  _id: string;
  trackingCode: string;
  customerName: string;
  address: string;
  status: string;
}

interface StatusOption {
  _id: string;
  name: string;
  description?: string;
}

export default function DeliveriesPage() {
  const { loading, apiClient, logout } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [statusesError, setStatusesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const client = await apiClient();
        const res = await client.get("/api/statuses");
        setStatuses(res.data.statuses || []);
      } catch (err: any) {
        setStatusesError(err?.response?.data?.message || "No se pudieron cargar los estados.");
      }
    })();
  }, [loading, apiClient]);

  const statusOptions = useMemo(() => {
    if (statuses.length > 0) {
      return statuses.map((s) => s.name);
    }
    return Array.from(new Set(deliveries.map((d) => d.status)));
  }, [statuses, deliveries]);

  const filteredDeliveries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return deliveries.filter((d) => {
      const matchesSearch =
        !term ||
        d.trackingCode.toLowerCase().includes(term) ||
        d.customerName.toLowerCase().includes(term) ||
        d.address.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  if (loading) {
    return <div className="text-center">Verificando sesion...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Panel de entregas
          </p>
          <h1 className="text-xl font-semibold leading-tight">Mis entregas</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Revisa y gestiona las ordenes asignadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/deliveries"
            className="hidden md:inline text-xs border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Inicio
          </Link>
          <button
            onClick={logout}
            className="hidden md:inline text-xs text-red-500 hover:underline"
          >
            Cerrar sesion
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 px-2 py-2 text-sm"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border border-slate-200 dark:border-slate-700 rounded-md divide-y divide-slate-200 dark:divide-slate-700 overflow-hidden">
          <Link
            href="/deliveries"
            className="block px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Cerrar sesion
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por tracking, cliente o direccion"
          className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-40 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
        >
          <option value="all">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {statusesError && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-md px-2 py-1">
          {statusesError}
        </p>
      )}

      {fetching && <p>Cargando entregas...</p>}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1">
          {error}
        </p>
      )}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filteredDeliveries.map((d) => (
          <Link
            key={d._id}
            href={`/deliveries/${d._id}`}
            className="block border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <div className="font-medium">
              {d.trackingCode} - {d.customerName}
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
        {!fetching && filteredDeliveries.length === 0 && (
          <p className="text-sm text-slate-500">No hay entregas que coincidan con el filtro.</p>
        )}
      </div>
    </div>
  );
}
