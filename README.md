# Repto - Módulo de repartidores (Next.js + MongoDB + Cloudinary)

Este proyecto es una PWA sencilla para repartidores que saca los datos de un programa de seguimiento de pedidos con numero de orden, esas órdenes asocian estados, productos o servicios y todo lo referido al cliente con su número de rut Chileno o dni Argentino, está pensado para ambos paises.

## Instalación

```bash
npm install
npm run dev
```

## Flujo básico

- Login de repartidor: `/login`
- Listado de entregas asignadas: `/deliveries`
- Detalle y registro de entrega con foto y RUT/DNI: `/deliveries/[id]`

La ruta `POST /api/deliveries/[id]/complete` sube la foto a Cloudinary, marca la entrega como completada y deja un `TODO` para que conectes con tu backend de seguimiento.
