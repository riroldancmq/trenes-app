# Trenes App — Registro de demoras lavado de formaciones

Webapp móvil (PWA) para registrar demoras de lavado de formaciones. React + Vite + Tailwind, backend en Supabase (PostgreSQL + Auth + Realtime), desplegado en Vercel.

- **Admin**: edita fechas y estado de las formaciones. Login con **usuario + contraseña** (no hay registro público).
- **Visitante**: acceso en solo lectura, sin login; los cambios del admin se ven en vivo.

## Puesta en marcha

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan gratuito). Anotá la **Project URL** y la **anon key** (Dashboard → Settings → Data API).
2. En el **SQL Editor**, ejecutá `supabase/migrations/0001_init.sql` (tablas `formaciones`, `roles`, `historial`, RLS, Realtime y seed de 23 formaciones). Si la base ya existe, corré también `0003_descripcion.sql` para agregar el campo `descripcion`.
3. **Login de admin**: es con **usuario + contraseña** (p. ej. `admin`). La app resuelve el usuario a un email interno (`admin` → `admin@trenes.local`) y la contraseña vive únicamente hasheada en Supabase Auth:
   - La cuenta se crea con la service role (`auth.admin.createUser`), normalmente vía script de Node con `SUPABASE_SERVICE_ROLE_KEY`.
   - Después se asigna el rol (SQL Editor):
     ```sql
     insert into public.roles (user_id, rol)
     select id, 'admin' from auth.users where email = 'admin@trenes.local'
     on conflict (user_id) do update set rol = 'admin';
     ```
4. **Importante**: desactivá el alta pública de usuarios — Dashboard → **Authentication → Sign In / Providers → Email** → apagá *Allow new users to sign up*. El registro está quitado de la UI; este ajuste lo bloquea también por API.

### 2. Configuración local

```bash
npm install
cp .env.example .env   # completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev            # http://localhost:5173
```

Variables de entorno:

| Variable                    | Dónde      | Uso                                   |
| --------------------------- | ---------- | ------------------------------------- |
| `VITE_SUPABASE_URL`         | `.env`     | Cliente de la app                     |
| `VITE_SUPABASE_ANON_KEY`    | `.env`     | Cliente de la app (lectura + auth)    |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Solo para scripts (nunca en el front ni en git) |

`.env*` están en `.gitignore`; nunca se commitean.

### 3. Vercel

1. Subí el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project**, importá el repo.
3. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
4. En **Environment Variables** agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` y hacé **Deploy**.

## Funcionalidades

- **Login solo admin** (usuario/contraseña) y **"Ver como visitante"** en solo lectura.
- El modo visitante **persiste al recargar** (se guarda en `localStorage`) y tiene su botón **Salir**.
- **Edición del admin con botones**: la card tiene modo edición (fechas, estado y **descripción**) con botones **Editar / Guardar / Eliminar**. Los cambios se persisten solo al tocar **Guardar** (optimista → IndexedDB → Sync a Supabase). Sin conexión queda encolado y sincroniza al reconectar.
- **Eliminar** limpia el contenido de la formación (fechas, estado a `fuera-servicio` y descripción); no borra la fila.
- **Descripción/detalle** editable por admin; el **visitante** la ve (solo lectura) arriba de la línea de situación.
- **Realtime**: visitantes y admin ven los cambios en vivo entre dispositivos.
- **Orden por criticidad**: más días de demora arriba; las "fuera de servicio" (sin datos) abajo, separadas en su grupo.
- Vista por **tarjetas** (móvil) o **tabla** (toggle).
- Semáforo: verde 0-10 días, amarillo 11-20, rojo 21+ (los días y el semáforo se **calculan en el cliente** a partir de `ultima`).
- Informe TXT descargable/compartible.
- PWA instalable con **icono propio**, scroll oculto, header con efecto **glass**, fondo fijo con foto `trenes.jpg` (implementado con `body::before` para evitar la franja azul al scrollear).

## Scripts

| Comando         | Acción                                      |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                      |
| `npm run build` | Compila TS + Vite (genera PWA)              |
| `npm run lint`  | Lint con oxlint                             |
| `npm run preview` | Previsualiza el build                     |
| `npm run sync`  | Upsert de `formaciones` desde `backuotrenes.json` usando la service role (ver `scripts/sync-backup.mjs`) |

## Estructura del proyecto

```
src/
  main.tsx                  Punto de entrada (React + index.css + App)
  App.tsx                   Pantalla principal: gate de login/visitante,
                            header, stats, vista tarjetas/tabla, informe
  index.css                 Tokens @theme, fondo (imagen fija via
                            body::before), scroll oculto
  hooks/
    useAuth.ts              Sesión, rol, signIn/signOut (signIn resuelve
                            usuario → email con usuarioAEmail)
    useFormaciones.ts       Carga, orden por criticidad, suscripción
                            Realtime, cola de pendientes y sync
  lib/
    supabase.ts             Cliente Supabase, DOMINIO_ADMIN, usuarioAEmail,
                            fetchRol
    types.ts                Tipos: Estado, FormacionDB, Formacion,
                            CamposEditables, ESTADOS/ESTADO_LABEL
    dates.ts                parse/fmt de fechas, calcularDias, semaforo,
                            ordenarPorCriticidad
    offline.ts              Cola de operaciones pendientes en IndexedDB
    report.ts               generaInforme() y compartirInforme() (TXT)
  components/
    AuthView.tsx            Login usuario/contraseña, "Ver como visitante",
                            LoadingScreen
    FormationCard.tsx       Tarjeta de formación (gris claro translúcido),
                            modo edición, descripción y botones Editar/
                            Eliminar/Guardar
    FormationTable.tsx      Vista tabla
    StatsCards.tsx          Contadores verdes/amarillos/rojos y por estado
    InfoModal.tsx           Listado de formaciones en Limpieza/Reparación
    SyncBadge.tsx           Indicador online / pendientes / sincronizando
public/
  trenes.jpg                Imagen de fondo (redimensionada desde
                            San-Martin-Trenes.jpg)
  icons/                    Iconos de la PWA (generados desde icon.png)
scripts/
  sync-backup.mjs           Sincroniza formaciones desde backuotrenes.json
                            (usa SUPABASE_SERVICE_ROLE_KEY)
supabase/migrations/
  0001_init.sql             Esquema + RLS + realtime + seed inicial
  0002_actualizar_datos.sql Snapshot de datos (hoy el sync se hace por
                            script; no volver a aplicar por SQL)
  0003_descripcion.sql      Agrega columna `descripcion` a formaciones
                            y audita ese campo en `historial`
```

### Flujo de datos

1. **Admin edita** una tarjeta → entra en modo edición y toca **Guardar** → `FormationCard.guardar` → `onCambio` → `aplicarCambio` (`useFormaciones.ts`). **Eliminar** llama a `aplicarCambio` con fechas/estado/descripción en blanco.
2. `aplicarCambio` actualiza el estado al instante, lo encola en **IndexedDB** (`offline.ts`) y, si hay red, hace `.update()` a Supabase.
3. Supabase dispara **Realtime** → todos los clientes suscritos (admin y visitantes) reciben el payload y rederivan `dias`/semáforo.
4. **Visita como visitante**: el `select` está abierto a todos (`RLS using(true)`); el `update/insert/delete` requiere rol `admin`/`editor` (`public.es_editor()`). El trigger `log_cambio` audita los cambios en `historial`.

### Base de datos

- `public.formaciones`: `id`, `formacion` (único), `anteultima` (date), `ultima` (date), `estado` (`activa | limpieza | reparacion | fuera-servicio`), `descripcion` (text), `updated_at`. `dias` y `sem` NO se guardan: se calculan en el cliente.
- `public.roles`: `user_id` → `rol` (`admin` | `editor`).
- `public.historial`: auditoría de cambios (`campo`, valor anterior/nuevo, actor).

### Notas / pendientes

- `dias`/semáforo se recalculan al cargar, con cada evento Realtime y al editar; no hay aún un reloj que los actualice solo al pasar la medianoche (pendiente).
- Al regenerar la base, `0002_actualizar_datos.sql` quedó como respaldo: el camino actual es `npm run sync` con `backuotrenes.json`.