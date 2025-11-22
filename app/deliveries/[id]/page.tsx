"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { isValidRutOrDni } from "@/lib/validators";

interface Delivery {
  _id: string;
  trackingCode: string;
  customerName: string;
  customerDocument: string;
  address: string;
  products: string[];
  status: string;
}

export default function DeliveryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, apiClient, logout } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [receiverName, setReceiverName] = useState("");
  const [receiverDoc, setReceiverDoc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const client = await apiClient();
        const res = await client.get(`/api/deliveries/${params.id}`);
        setDelivery(res.data.delivery);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Error al cargar entrega");
      } finally {
        setFetching(false);
      }
    })();
  }, [loading, apiClient, params.id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!delivery) return;
    if (!receiverName.trim() || !receiverDoc.trim()) {
      setError("Debes ingresar nombre y documento de quien recibe.");
      return;
    }
    if (!isValidRutOrDni(receiverDoc)) {
      setError("El RUT/DNI ingresado no tiene un formato válido.");
      return;
    }
    if (!file) {
      setError("Debes subir una foto como evidencia de la entrega.");
      return;
    }

    setSaving(true);
    try {
      const client = await apiClient();
      const formData = new FormData();
      formData.append("receiverName", receiverName);
      formData.append("receiverDocument", receiverDoc);
      formData.append("file", file);
      const res = await client.post(`/api/deliveries/${delivery._id}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.ok) {
        router.replace("/deliveries");
      } else {
        setError("No se pudo registrar la entrega, intenta nuevamente.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar la entrega");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Verificando sesión...</div>;

  if (fetching) return <div>Cargando entrega...</div>;

  if (!delivery) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
        <p className="mb-3 text-sm text-red-500">{error || "Entrega no encontrada."}</p>
        <button
          onClick={() => router.push("/deliveries")}
          className="text-sm text-sky-600 hover:underline"
        >
          Volver a mis entregas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Entrega #{delivery.trackingCode}</h1>
        <button
          onClick={logout}
          className="text-xs text-red-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="text-sm space-y-1">
        <p>
          <span className="font-medium">Cliente:</span> {delivery.customerName}
        </p>
        <p className="text-xs text-slate-500">
          Documento esperado: {delivery.customerDocument}
        </p>
        <p>
          <span className="font-medium">Dirección:</span> {delivery.address}
        </p>
        <p>
          <span className="font-medium">Productos:</span>{" "}
          {delivery.products.join(", ") || "Sin detalle"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Nombre de quien recibe</label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">RUT / DNI de quien recibe</label>
          <input
            type="text"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
            value={receiverDoc}
            onChange={(e) => setReceiverDoc(e.target.value)}
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Se valida formato básico de RUT chileno o DNI argentino.
          </p>
        </div>
        <div>
          <label className="block text-sm mb-1">Foto de evidencia</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {preview && (
            <div className="mt-2">
              <p className="text-xs mb-1">Previsualización:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-md border border-slate-300 dark:border-slate-700 object-cover"
              />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Confirmar entrega"}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          className="w-full mt-2 rounded-md border border-slate-300 dark:border-slate-700 text-sm py-2"
        >
          Volver
        </button>
      </form>
    </div>
  );
}
