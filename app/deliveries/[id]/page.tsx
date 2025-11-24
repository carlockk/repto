"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
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
  const [observation, setObservation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setFile(null);
      setPreview(null);
    }
  }

  function triggerCapture() {
    fileInputRef.current?.click();
  }

  function clearPhoto() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
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
      setError("El RUT/DNI ingresado no tiene un formato valido.");
      return;
    }
    if (!file) {
      setError("Debes subir una foto o dejar una observación para completar.");
      return;
    }

    setSaving(true);
    try {
      const client = await apiClient();
      const formData = new FormData();
      formData.append("receiverName", receiverName);
      formData.append("receiverDocument", receiverDoc);
      if (file) {
        formData.append("file", file);
      }
      if (observation.trim()) {
        formData.append("observation", observation.trim());
      }
      // Dejamos que el browser setee el boundary del multipart
      const res = await client.post(
        `/api/deliveries/${delivery._id}/complete`,
        formData
      );
      if (res.data?.ok) {
        setSuccess(true);
        setTimeout(() => router.replace("/deliveries"), 800);
      } else {
        setError("No se pudo registrar la entrega, intenta nuevamente.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al registrar la entrega");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Verificando sesion...</div>;

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
          Cerrar sesion
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
          <span className="font-medium">Direccion:</span> {delivery.address}
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
            Se valida formato basico de RUT chileno o DNI argentino.
          </p>
        </div>
        <div>
          <label className="block text-sm mb-1">Foto de evidencia</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={triggerCapture}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
            >
              Tomar o subir foto
            </button>
            {file && (
              <button
                type="button"
                onClick={clearPhoto}
                className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
              >
                Cambiar foto
              </button>
            )}
          </div>
          {preview && (
            <div className="mt-2">
              <p className="text-xs mb-1">Previsualizacion:</p>
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
        {success && (
          <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-md px-2 py-1">
            Entrega registrada con éxito.
          </p>
        )}

        <div>
          <label className="block text-sm mb-1">Observación (opcional)</label>
          <textarea
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900"
            rows={3}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ej: Cliente no estaba, se reagenda / se dejó con conserje / domicilio cerrado..."
          />
        </div>
        <button
          type="submit"
          disabled={saving || success}
          className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : success ? "Listo" : "Confirmar entrega"}
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

