# Repto - Módulo de repartidores (Next.js + MongoDB + Cloudinary)

Este proyecto es una PWA sencilla para repartidores, conectada a MongoDB y lista para desplegar en Vercel.

## Instalación

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env.local` y completa:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Scripts

- `npm run dev` – entorno de desarrollo
- `npm run build` – build de producción
- `npm run start` – servidor de producción

## Flujo básico

- Login de repartidor: `/login`
- Listado de entregas asignadas: `/deliveries`
- Detalle y registro de entrega con foto y RUT/DNI: `/deliveries/[id]`

La ruta `POST /api/deliveries/[id]/complete` sube la foto a Cloudinary, marca la entrega como completada y deja un `TODO` para que conectes con tu backend de seguimiento.
