// Validación simple de RUT chileno (sin DV avanzado) y DNI argentino.
// Puedes mejorar esta lógica después si quieres reglas más estrictas.

export function isValidRutOrDni(value: string) {
  const v = value.replace(/\./g, "").replace(/-/g, "").trim();

  // RUT: 7 a 9 dígitos + posible K (ej: 12345678K)
  const rutRegex = /^\d{7,9}[0-9kK]?$/;
  // DNI Arg: 7 a 9 dígitos
  const dniRegex = /^\d{7,9}$/;

  return rutRegex.test(v) || dniRegex.test(v);
}
