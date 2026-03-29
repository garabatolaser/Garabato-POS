# Garabato POS v9 - Instrucciones de despliegue

## Requisitos
- Node.js LTS (descargar de nodejs.org)
- Cuenta en GitHub (github.com)
- Cuenta en Vercel (vercel.com)

## Pasos para publicar

### 1. Instalar dependencias (una sola vez)
```
npm install
```

### 2. Probar en local
```
npm run dev
```
Abrir http://localhost:5173 en el navegador.

### 3. Publicar en Vercel
1. Subir esta carpeta a GitHub
2. Conectar el repo en vercel.com
3. Vercel despliega automatico en cada push

## Para actualizar el sistema
1. Reemplazar src/App.jsx con la nueva version
2. Commit + push a GitHub
3. Vercel redespliega en 2 minutos

## Usuarios demo
- Admin: Carlos (1234)
- Tienda: Tienda (5678)
- Promotora 1: Maria (1111)
- Promotora 2: Laura (2222)

## Notas tecnicas
- Base de datos: IndexedDB (local en cada dispositivo)
- Funciona offline 100%
- Se instala como app en Android (Chrome > Agregar a pantalla de inicio)
- Se instala en iPhone (Safari > Compartir > Agregar a pantalla de inicio)
