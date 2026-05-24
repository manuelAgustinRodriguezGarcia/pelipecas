# Pelipecas — Contexto del proyecto

Documento de referencia para asistentes de IA (ChatGPT, Cursor, etc.). Describe tecnologías, arquitectura, estilos y convenciones **tal como están implementadas** en el repositorio.

---

## Qué es Pelipecas

PWA personal para gestionar una cartelera de películas en pareja:

- **Para ver** (`/para-ver`): lista de pendientes, búsqueda TMDB, alta manual.
- **Las vimos** (`/las-vimos`): historial con valoraciones por categorías.
- **Hoy vemos** (`/hoy-vemos`): sorteo/reveal de la próxima película.
- **Ajustes** (`/ajustes`): configuración, PWA, compartir listas.

Idioma de la UI y mensajes al usuario: **español (Argentina)** — `es-AR` en TMDB, copy en voseo donde aplica.

---

## Stack tecnológico

| Área | Elección |
|------|----------|
| Framework | **Next.js 15** (App Router) |
| UI | **React 19** |
| Lenguaje | **JavaScript** (`.js` / `.jsx`) — sin TypeScript |
| Estilos | **CSS Modules + SCSS** (`*.module.scss`) + variables en `globals.css` |
| Iconos | **lucide-react** |
| Fuentes | **Geist** y **Geist Mono** (`next/font/google`) |
| Datos | **localStorage** del navegador (sin backend propio de películas) |
| Catálogo externo | **The Movie Database (TMDB)** vía Route Handlers en `/api/tmdb/*` |
| PWA | `manifest.js`, `public/sw.js`, `PwaProvider` |
| Lint | ESLint con `eslint-config-next` |
| Dev | `next dev --turbopack` (alternativa: `next dev` / `dev:webpack`) |

**No se usa:** Tailwind, shadcn, CSS-in-JS, Redux, Zustand, base de datos, autenticación.

---

## Estructura del repositorio

```
pelipecas/
├── public/                 # favicon, logo, sw.js, assets estáticos
├── src/
│   ├── app/                # App Router (layouts, pages, API routes)
│   │   ├── (main)/         # Rutas con shell (nav + header)
│   │   ├── api/tmdb/       # Proxy TMDB (search, movie)
│   │   ├── globals.css     # Design tokens (:root)
│   │   └── layout.js       # Root layout, metadata, fuentes
│   ├── components/         # Componentes React (.jsx)
│   ├── context/            # Providers (Movies, AppUI, SectionNavigation)
│   ├── hooks/              # Lógica reutilizable cliente
│   ├── helpers/            # Funciones puras (movies, TMDB, sort, reveal)
│   └── styles/
│       ├── app.module.scss       # Layout shell, secciones, animaciones
│       └── components.module.scss # UI compartida (nav, cards, modales…)
├── DESIGN.md               # Referencia Pinterest (NO es el tema activo de la app)
├── next.config.mjs
└── package.json
```

**Alias de importación:** `@/*` → `./src/*` (ver `jsconfig.json`).

---

## Arquitectura Next.js

### App Router

- **`src/app/layout.js`**: layout raíz, metadata, viewport, PWA provider.
- **`src/app/page.js`**: redirige a `/para-ver`.
- **`src/app/(main)/layout.js`**: envuelve rutas principales con `MoviesProvider` + `AppLayout`.
- **Páginas** en `(main)/`: son wrappers delgados que renderizan un componente de página (`PendingPage`, `WatchedPage`, etc.).

### Server vs Client

- **Route Handlers** (`app/api/tmdb/...`): solo servidor; leen `process.env.TMDB_READ_ACCESS_TOKEN`.
- **Casi toda la UI** lleva `"use client"` porque depende de estado, `localStorage`, gestos y modales.
- Las **pages** del grupo `(main)` pueden ser Server Components que importan un Client Component.

### Contextos (estado global cliente)

1. **`MoviesContext`** → `useMovies()`: lista de películas, CRUD, sorteo, persistencia en `localStorage` (`pelipecas_movies`).
2. **`AppUIContext`**: modales globales (detalle, marcar vista, confirmar borrado, éxito). Coordina overlays y `useLockBodyScroll`.
3. **`SectionNavigationContext`**: transición visual entre secciones al cambiar de tab.

### Hooks habituales

| Hook | Uso |
|------|-----|
| `useMovies` | Estado y acciones de películas |
| `useMoviesContext` | Acceso al contexto (lanza error fuera del provider) |
| `useModalCloseAnimation` | Cierre animado de modales (~520 ms) |
| `useLockBodyScroll` | Bloquea scroll del body con overlay abierto |
| `useTmdbSearch` | Debounce + fetch a `/api/tmdb/search` |
| `useCardSwipeOpen` | Menú de acciones por swipe en cards |

---

## Modelo de datos (película)

Definido y normalizado en `src/helpers/movieHelpers.js`:

- **Estados:** `pending` | `watched`
- **Campos TMDB opcionales:** `tmdbId`, `posterPath`, `posterUrl`, `overview`, `year`, `voteAverage`, etc.
- **Valoraciones** (solo vistas): 5 categorías de 1–5 estrellas — efectos, música, actuación, personajes, historia (`RATING_CATEGORIES`).
- **IDs:** generados en cliente; películas manuales sin TMDB usan título + variantes de póster CSS (`POSTER_VARIANTS`).

Persistencia: `JSON.stringify` en `localStorage` tras cada cambio cuando `isLoaded === true`.

---

## API TMDB

- Variable de entorno: **`TMDB_READ_ACCESS_TOKEN`** (Bearer).
- **`GET /api/tmdb/search?query=`**: mínimo 2 caracteres; `language=es-AR`, `region=AR`; máx. 5 resultados; `revalidate: 3600`.
- **`GET /api/tmdb/movie`**: detalle de película (mismo patrón de auth).
- Posters: `image.tmdb.org` permitido en `next.config.mjs` → `images.remotePatterns`.
- Helpers: `tmdbHelpers.js` (`mapTmdbMovie`, `buildPosterUrl`, etc.).

---

## Sistema visual (implementado)

La app usa un tema **cine nocturno con acento dorado**, no el Pinterest de `DESIGN.md`. Ese archivo es documentación de referencia externa; **no aplicar sus colores/tipografía a Pelipecas** salvo que se pida explícitamente.

### Tokens (`src/app/globals.css`)

```css
/* Superficies */
--color-bg: #080808;
--color-bg-deep: #050505;
--color-surface: #151515;
--color-surface-elevated: #202020;

/* Acento y texto */
--color-gold: #d4af37;
--color-gold-soft: #f3dfa2;
--color-text: #fff9ea;
--color-text-secondary: #b8b0a0;
--color-danger: #b94747;

/* Bordes y sombras */
--color-border-gold: rgba(212, 175, 55, 0.22);
--color-border-soft: rgba(255, 249, 234, 0.08);
--shadow-soft, --shadow-gold-soft

/* Radios */
--radius-sm: 12px; --radius-md: 16px; --radius-lg: 20px;
--radius-xl: 22px; --radius-full: 9999px;

/* Espaciado */
--spacing-xs … --spacing-xxl (4px–32px)
```

Fondo con **gradientes radiales dorados sutiles** en `app.module.scss` (`.desktopBackdrop`, `.appShell`).

### Tipografía

- Familia: **Geist** (`--font-geist-sans`).
- Clases utilitarias globales: `.logo`, `.sectionLabel` (uppercase, letter-spacing), `.bodyText`.
- Títulos de sección en SCSS: `.sectionTitle` (~1.625rem, bold, tracking negativo).

### SCSS

- **`app.module.scss`**: shell, main, secciones, keyframes (`appEnter`, `sectionFade`), breakpoints.
- **`components.module.scss`**: componentes (header, bottom nav, cards, modales, formularios, ratings). Archivo grande (~2500 líneas); reutilizar clases existentes antes de duplicar.
- Mixins: p. ej. `@mixin hideScrollbar`.
- Iconos compartidos: `.iconSm`, `.iconMd`, `.iconLg`, `.iconGold`, `.iconMuted`.

### Responsive

- **Mobile-first** con bottom nav fija (`--nav-height: 72px`).
- **`@media (min-width: 1024px)`**: `max-width` del shell 1280px, contenido ~1000px, nav inferior oculta (`--nav-height: 0`), layout más “desktop”.
- **`prefers-reduced-motion`**: desactiva animaciones de entrada en `.mainContent`.

### Accesibilidad y foco

- `:focus-visible` con outline dorado.
- Modales: `role="dialog"`, `aria-modal`, Escape para cerrar, foco en el diálogo.
- Navegación: `aria-label`, `aria-current="page"` en tabs activos.

---

## Patrones de componentes

### Convenciones generales

- Un componente por archivo en `src/components/`, **PascalCase**, export **default**.
- Estilos: `import styles from "@/styles/components.module.scss"` (o `app.module.scss` para layout).
- Props en español en copy/UI; nombres de props/código en **inglés** (`onClose`, `markWatchedTarget`).
- Iconos: `<Icon size={20} strokeWidth={…} />` de lucide-react.

### Modales

- Cierre animado vía **`useModalCloseAnimation`** (`MODAL_CLOSE_MS = 520`).
- Modales “globales” viven en **`AppUIContext`**; algunos soportan modo **`embedded`** (p. ej. `MarkWatchedModal` dentro del detalle).
- Backdrop + panel; clases tipo `modalOverlay`, `modalPanel`, estados `data-closing` / clases `.closing`.
- **`useLockBodyScroll`** cuando hay overlay.

### Tarjetas de película

- `MovieCard`, `MoviePoster`, acciones con swipe (`useCardSwipeOpen`) y menú `MovieCardActionMenu`.
- Posters TMDB con `next/image` cuando hay URL; placeholders CSS para entradas manuales.

### Formularios y búsqueda

- `AddMovieForm` + `useTmdbSearch` → resultados en `MovieSearchResults`.
- Mensajes de error en español, tono directo y amable.

---

## Rutas

| Ruta | Componente principal |
|------|----------------------|
| `/` | redirect → `/para-ver` |
| `/para-ver` | `PendingPage` |
| `/las-vimos` | `WatchedPage` |
| `/hoy-vemos` | `TodayPage` / `TodayWeWatch` |
| `/ajustes` | `ConfigPage` |
| `/vistas` | (ruta auxiliar si existe) |
| `/config` | alias/config legacy |

---

## Scripts npm

```bash
npm run dev          # turbopack
npm run dev:webpack  # webpack clásico
npm run dev:clean    # borra .next y arranca dev
npm run build
npm run start
npm run lint
```

En **Windows**, `next.config.mjs` desactiva caché webpack en dev para evitar chunks huérfanos.

---

## Variables de entorno

```env
TMDB_READ_ACCESS_TOKEN=   # obligatorio para búsqueda/detalle TMDB
```

Archivo local: `.env.local` (no commitear).

---

## Prácticas al contribuir código

### Hacer

- Mantener imports al **inicio del archivo** (sin imports dinámicos inline salvo necesidad extrema).
- Reutilizar **helpers** para lógica de películas/TMDB/sort/reveal; no duplicar en componentes.
- Usar **variables CSS** existentes; no hardcodear hex nuevos sin motivo.
- Respetar el flujo de modales y animaciones existente al añadir overlays.
- Escribir UI y comentarios relevantes en **español**.
- Probar en móvil (PWA, bottom nav, safe areas) y en desktop ≥1024px.

### Evitar

- Introducir Tailwind, styled-components o librerías de UI pesadas sin acuerdo.
- Migrar a TypeScript en un solo PR grande (el proyecto es JS a propósito por ahora).
- Guardar estado de películas en servidor sin diseño explícito.
- Aplicar el sistema Pinterest de `DESIGN.md` como si fuera el tema de Pelipecas.
- Modales sin animación de cierre ni bloqueo de scroll si el resto de overlays lo usan.
- Commits o cambios en `git config` salvo que el usuario lo pida.

---

## Archivos clave para empezar

| Archivo | Por qué leerlo |
|---------|----------------|
| `src/app/globals.css` | Tokens de diseño |
| `src/styles/components.module.scss` | Estilos de UI |
| `src/helpers/movieHelpers.js` | Modelo y reglas de negocio |
| `src/hooks/useMovies.js` | Estado y persistencia |
| `src/context/AppUIContext.jsx` | Orquestación de modales |
| `src/components/AppLayout.jsx` | Shell de la app |
| `next.config.mjs` | Imágenes TMDB, dev Windows |

---

## Resumen en una frase

**Pelipecas** es una PWA Next.js 15 + React 19 en JavaScript, con tema oscuro/dorado, estilos en SCSS modules, estado en Context + localStorage, catálogo vía TMDB en Route Handlers, y UX mobile-first con navegación inferior y modales animados en español argentino.
