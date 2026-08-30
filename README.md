# Trenes App — Registro de demoras lavado de formaciones

Webapp móvil (PWA) para registrar demoras de lavado de formaciones. React + Vite + Tailwind, backend en Supabase (PostgreSQL + Auth + Realtime), desplegado en Vercel.

## Puesta en marcha

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan gratuito). Anotá la **Project URL** y la **anon key** (Dashboard → Project Settings → API).
2. En el **SQL Editor**, pegá y ejecutá el contenido de `supabase/migrations/0001_init.sql`. Crea las tablas `formaciones`, `roles` e `historial`, las políticas RLS, Realtime y siembra las 23 formaciones.
3. Habilitá tu usuario como **admin** (corré en el SQL Editor, reemplazando el email):
   ```sql
   insert into public.roles (user_id, rol)
   select id, 'admin' from auth.users where email = 'TU_EMAIL'
   on conflict (user_id) do update set rol = 'admin';
   ```
   Para otros editores, usá `'editor'`.

### 2. Configuración local

```bash
npm install
cp .env.example .env   # completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

### 3. Vercel

1. Subí el repo a GitHub (ver abajo).
2. En [vercel.com](https://vercel.com) → **Add New → Project**, importá el repo.
3. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
4. En **Environment Variables** agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` y hacé **Deploy**.

## Funcionalidades

- **Visitante**: ve en solo lectura sin login. **Editor**: edita fechas y estado.
- Edición offline: los cambios se guardan en IndexedDB y sincronizan al reconectar (botón "Sincronizar" aparecerá con pendientes).
- Sincronización en tiempo real entre dispositivos (Supabase Realtime).
- Tarjetas por formación (móvil) o tabla (toggle).
- Semáforo: verde 0-10 días, amarillo 11-20, rojo 21+.
- Informe TXT descargable/compartible.
- PWA instalable al teléfono.

## Scripts

| Comando         | Acción                          |
| --------------- | ------------------------------- |
| `npm run dev`   | Servidor de desarrollo          |
| `npm run build` | Compila TS + Vite (genera PWA)  |
| `npm run lint`  | Lint con oxlint                 |
| `npm run preview` | Previsualiza el build         |