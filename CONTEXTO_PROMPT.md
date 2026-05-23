# Pelipecas — Contexto completo para prompts (diseño, funcionalidades, API)

Documento de referencia para armar prompts en ChatGPT u otras IAs. Describe la app **real** del repositorio (Next.js), no el archivo `DESIGN.md` raíz (ese contiene un análisis de Pinterest sin relación con Pelipecas).

---

## 1. Resumen del producto

**Pelipecas** es una PWA/web app personal para parejas (tono íntimo, español Argentina) que sirve como **cartelera de películas**:

- Anotar películas **para ver** y **ya vistas**.
- Buscar títulos en **The Movie Database (TMDB)** o agregar manualmente.
- **Sorteo animado** (“Hoy vemos”) para elegir la próxima función al azar.
- **Calificar** películas vistas en 5 categorías (1–5 estrellas cada una).
- **Exportar / importar** la lista por WhatsApp (texto + bloque Base64).
- Sin backend propio de usuarios: los datos viven en **localStorage** del navegador.

**URL de producción (referencia):** `https://pelipecas.vercel.app`  
**Start URL PWA:** `/para-ver`

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión (package.json) |
|------|------------|------------------------|
| Framework | **Next.js** (App Router) | ^15.3.2 |
| UI | **React** | ^19.1.0 |
| Estilos | **CSS Modules + SCSS** (`*.module.scss`) + variables CSS en `globals.css` | sass ^1.89.0 |
| Iconos | **lucide-react** | ^1.16.0 |
| Fuentes | **Geist Sans** y **Geist Mono** (`next/font/google`) | — |
| Datos locales | **localStorage** | clave `pelipecas_movies` |
| API externa | **TMDB API v3** (proxy server-side) | — |
| PWA | `manifest.js`, `public/sw.js`, `PwaProvider` | — |
| Deploy típico | Vercel | — |

**Scripts:** `npm run dev` (Turbopack), `npm run build`, `npm run start`, `npm run lint`.

**Variables de entorno requeridas:**

```env
TMDB_READ_ACCESS_TOKEN=<Bearer token de TMDB>
```

Sin este token, las rutas `/api/tmdb/*` responden **500** con `{ "error": "TMDB no está configurado." }`.

---

## 3. Rutas de la aplicación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | redirect | Redirige a `/para-ver` |
| `/para-ver` | `PendingPage` | Lista pendiente + formulario de alta |
| `/las-vimos` | `WatchedPage` | Películas vistas + ordenamiento |
| `/hoy-vemos` | `TodayPage` | Ruleta / reveal de sorteo |
| `/ajustes` | `ConfigPage` | Exportar, importar, instalar PWA |
| `/vistas` | (legacy) | Existe ruta en filesystem; navegación principal usa `/las-vimos` |

**Navegación:** barra inferior en móvil/tablet; sidebar izquierda en desktop (≥1024px). Ítems: Para ver, Las vimos, Hoy vemos, Ajustes.

---

## 4. Identidad visual y diseño

### 4.1 Concepto

Estética **cine noir / cartelera premium**: fondo casi negro, acentos **dorado** (`#d4af37`), tipografía clara, posters como protagonistas. Sensación de app de cine personal, no Material ni Pinterest.

### 4.2 Paleta de colores (CSS variables en `globals.css`)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#080808` | Fondo principal del shell |
| `--color-bg-deep` | `#050505` | HTML/body, fondos profundos |
| `--color-surface` | `#151515` | Tarjetas, inputs |
| `--color-surface-elevated` | `#202020` | Dropdowns, modales, menús |
| `--color-surface-muted` | `#111111` | Sidebar desktop, badges |
| `--color-gold` | `#d4af37` | CTA, acentos, estrellas, nav activo |
| `--color-gold-soft` | `#f3dfa2` | Texto dorado suave, hover |
| `--color-text` | `#fff9ea` | Texto principal (crema) |
| `--color-text-secondary` | `#b8b0a0` | Subtítulos, metadata |
| `--color-border-gold` | `rgba(212, 175, 55, 0.22)` | Bordes destacados |
| `--color-border-soft` | `rgba(255, 249, 234, 0.08)` | Bordes sutiles |
| `--color-danger` | `#b94747` | Eliminar, errores |
| `--shadow-soft` | `0 18px 50px rgba(0,0,0,0.45)` | Tarjetas, modales |
| `--shadow-gold-soft` | `0 0 28px rgba(212, 175, 55, 0.12)` | Focus inputs, hover cards |

**Gradientes de fondo:** radial dorado muy suave en la parte superior del shell (`app.module.scss`).

**Posters sin imagen TMDB:** variantes CSS con gradientes (`posterNoir`, `posterCharcoal`, `posterGoldFrame`, `posterMuted`, `posterDeep`, `posterElegant`) + iniciales del título.

### 4.3 Tipografía

- **Familia:** Geist Sans (`--font-geist-sans`), fallback `"Geist", sans-serif`.
- **Body:** ~0.95rem, weight 400, line-height 1.45.
- **Logo / marca:** `.logo` — 1.75rem, weight 700, letter-spacing -0.04em.
- **Títulos de sección:** `.sectionTitle` — 1.625rem móvil, **2rem** desktop.
- **Labels de sección:** `.sectionLabel` — 0.72rem, uppercase, letter-spacing 0.12em, weight 600.
- **Nav móvil:** labels 0.62rem; desktop hereda tamaño normal.

### 4.4 Espaciado y radios

| Token | Valor |
|-------|-------|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 12px |
| `--spacing-lg` | 16px |
| `--spacing-xl` | 24px |
| `--spacing-xxl` | 32px |
| `--radius-sm` | 12px |
| `--radius-md` | 16px |
| `--radius-lg` | 20px |
| `--radius-xl` | 22px |
| `--radius-full` | 9999px |
| `--nav-height` | 72px (0 en desktop ≥1024px) |
| `--app-max-width` | 100% móvil; **1280px** desktop |
| `--content-max-width` | **1000px** desktop (contenido centrado) |
| `--sidebar-width` | **220px** desktop |

### 4.5 Layout responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| &lt; 768px | Nav inferior fija; cards de película en **fila** (poster 72px + contenido); menú swipe en card |
| 768px – 1023px | Grid 2 columnas en listas; cards en columna |
| ≥ 1024px | Grid sidebar + header; nav lateral; listas hasta **4 columnas** (≥1200px); sin bottom nav |

**Animaciones:** `appEnter`, `sectionFade`, `cardEnter`, modales con slide/fade; `prefers-reduced-motion` reduce duraciones.

**Focus:** outline dorado 2px (`:focus-visible`).

### 4.6 Componentes UI (estilos en `components.module.scss`)

| Componente | Descripción visual |
|------------|-------------------|
| `btnPrimary` | Gradiente dorado 135°, texto `#080808`, min-height 40px, radius md |
| `btnSecondary` | Transparente, borde dorado, texto gold-soft |
| `btnMuted` | Borde soft, texto secondary |
| `btnDanger` | Borde rojo translúcido, texto danger |
| `input` / `search-bar` | Height 52px, fondo surface, borde gold, focus con shadow gold |
| `movieCard` | Radius xl, borde gold 14%, shadow soft, hover glow gold |
| `filter-chip` / sort dropdown | Menú elevado, borde gold |
| `emptyState` | Borde dashed gold, icono circular |
| `modalBackdrop` | `rgba(5,5,5,0.72)` + blur 6px |
| `modalDialog` | max-width 340px (genérico), 420px detalle, fondo elevated |
| `revealViewport` | 40vh, min 220px, max 380px; strip horizontal de posters 2:3 |
| `revealPosterCardHighlighted` | Borde 2px gold + glow |
| `bottomNav` | Fijo abajo, blur, borde top gold |
| `copyToast` | Pill flotante sobre nav |
| `loveNoteModalDialog` | Fondo negro puro, borde gold más visible |

---

## 5. Assets e imágenes

| Archivo | Ruta | Uso |
|---------|------|-----|
| Logo | `/logo.webp` | Header (Next `Image`, 71×71, priority) |
| Favicon / PWA icons | `/favicon.png` | Manifest 192/512, apple-touch |
| Mascotas | `/pelipecas-mascots.webp` | Modal “Para Pecas” (love note); cache-bust `?v=` en prod |
| Posters TMDB | `https://image.tmdb.org/t/p/{size}{poster_path}` | Tamaño default `w185` vía `buildPosterUrl` |

**Next.js images:** `image.tmdb.org` permitido en `remotePatterns` (`next.config.mjs`).

---

## 6. Funcionalidades por sección

### 6.1 Para ver (`/para-ver`)

- **Buscar y agregar** película:
  - Input con búsqueda TMDB (debounce 350ms, mínimo 2 caracteres).
  - Dropdown con hasta **5 resultados** (poster, título, año, título original, overview truncado).
  - Enter con resultados → selecciona el primero.
  - Sin resultados → mensaje + enlace “agregar manualmente”.
  - Alta manual por título si no hay match TMDB.
- **Validación:** duplicados por `tmdbId` o título normalizado; mensaje *"Esta película ya está en tu lista."*
- **Ordenar** lista: año asc/desc, A-Z, Z-A (default: año más recientes).
- **Contador** con badge dorado.
- **Tarjetas:** click abre detalle; menú (móvil swipe) → marcar vista / eliminar; botón “La vimos” en desktop footer.
- **Empty state:** “Tu cartelera está vacía” + CTA agregar.

### 6.2 Las vimos (`/las-vimos`)

- Lista de `status: "watched"`.
- **Ordenamiento extra:** calificación más alta / más baja (promedio usuario).
- Muestra **panel de rating** en cards (promedio + detalle colapsable en desktop).
- Acciones: ver detalle, **volver a pendiente**, eliminar (con confirmación si tiene ratings).
- Empty state propio.

### 6.3 Hoy vemos (`/hoy-vemos`)

- **Ruleta horizontal** (`MovieRevealStrip`):
  - Preview idle con posters mezclados cuando no hay sorteo activo.
  - Botón “Elegir película” → animación de scroll con 4 patrones de movimiento (`revealHelpers.js`).
  - Mínimo ~28 ítems en el strip; película ganadora en índice aleatorio central.
  - Duraciones ~2.2s – 4.8s según patrón.
- Al terminar → modal reveal (`MovieRevealModal`) con poster, título, CTA marcar vista.
- Incrementa `timesPicked` en la película elegida.
- Si la película sale de pendientes → reset del reveal.
- Empty → redirige foco a agregar en Para ver.

### 6.4 Ajustes (`/ajustes`)

- **Instalar app:** `beforeinstallprompt` (Android/Chrome) o instrucciones iOS; detecta standalone.
- **Copiar lista:** genera texto WhatsApp + bloque datos Base64.
- **Importar lista:** pega mensaje; parsea bloque entre marcadores; deduplica.
- **CopyToast** feedback.

### 6.5 Header global

- Logo + título “Pelipecas” + subtítulo (oculto en móvil).
- Botón corazón **“Te amo”** → `LoveNoteModal` (mensaje personal + mascotas).

### 6.6 Modales globales (`AppUIContext`)

| Modal | Trigger | Acciones |
|-------|---------|----------|
| `MovieDetailModal` | Click en card | Sinopsis TMDB lazy, rating TMDB, user ratings si vista, marcar vista, mover a pendiente, eliminar |
| `MarkWatchedModal` | “La vimos” | 5 categorías × 5 estrellas; obligatorio completar todas; cita “¿La vimos?” |
| `MarkWatchedSuccessModal` | Tras confirmar | Poster, título, promedio calculado |
| `DeleteConfirmModal` | Eliminar | Confirmar / cancelar |
| `DetailActionConfirmModal` | Mover a pendiente o borrar desde detalle | Advierte si hay ratings |
| `MovieRevealModal` | Post-ruleta | Marcar vista / cerrar |

**Transiciones:** swap animado entre MarkWatched → Success (300ms); cierre con animación 520ms; Escape y click fuera cierran.

### 6.7 Transición entre secciones

`SectionNavigationContext` + overlay con logo al cambiar de ruta en la nav.

### 6.8 Loader inicial

`AppInitialLoader` mientras se hidrata `localStorage` (logo 220px + texto).

---

## 7. Modelo de datos (cliente)

### 7.1 Almacenamiento

- **Clave:** `pelipecas_movies` → array JSON de películas.
- **Migración:** `pelipecas_seed_removed_v1` elimina películas seed legacy sin TMDB (títulos como “Interestelar”, “La La Land”, etc.).

### 7.2 Objeto `Movie`

```typescript
{
  id: string;              // UUID
  title: string;
  status: "pending" | "watched";
  createdAt: string;       // ISO
  watchedAt: string | null;
  timesPicked: number;
  // TMDB (opcional)
  tmdbId: number | null;
  originalTitle: string | null;
  overview: string | null;
  releaseDate: string | null;  // YYYY-MM-DD
  year: number | null;
  posterPath: string | null;
  posterUrl: string | null;    // derivado w185
  voteAverage: number | null;  // TMDB 0-10
  ratings: {
    specialEffects: number | null;  // 1-5
    music: number | null;
    acting: number | null;
    characters: number | null;
    story: number | null;
  }
}
```

### 7.3 Categorías de rating (labels UI)

1. Efectos Especiales (`specialEffects`)
2. Música (`music`)
3. Actuación (`acting`)
4. Personajes (`characters`)
5. Historia (`story`)

**Promedio usuario:** suma / 5 (solo si las 5 están completas).  
**Estrellas display:** redondeo a medios (`Math.round(avg * 2) / 2`).

### 7.4 Operaciones (`useMovies`)

| Función | Efecto |
|---------|--------|
| `addMovieFromTmdb` | Crea pending; error duplicate/invalid |
| `addMovieManually` | Crea pending sin TMDB |
| `markAsWatched(id, ratings)` | status watched + watchedAt + ratings |
| `moveToPending(id)` | Limpia watchedAt y ratings |
| `deleteMovie(id)` | Elimina; limpia picked |
| `pickRandomMovie(movieId?)` | Random o id fijo; ++timesPicked |
| `importMoviesFromShare(movies)` | Merge sin duplicar |

---

## 8. API interna (Next.js Route Handlers)

Todas las llamadas del cliente van a rutas **relativas** del mismo origen (no exponen el token TMDB al browser).

### 8.1 `GET /api/tmdb/search`

**Query params:**

| Param | Requerido | Descripción |
|-------|-----------|-------------|
| `query` | sí | Texto de búsqueda (trim). Si &lt; 2 chars → `{ "results": [] }` |

**Proxy TMDB:** `GET https://api.themoviedb.org/3/search/movie`

Parámetros enviados a TMDB: `query`, `language=es-AR`, `page=1`, `include_adult=false`, `region=AR`.

**Headers servidor → TMDB:** `Authorization: Bearer {TMDB_READ_ACCESS_TOKEN}`, `Accept: application/json`.

**Cache Next:** `revalidate: 3600` (1 hora).

**Respuesta exitosa (200):**

```json
{
  "results": [
    {
      "tmdbId": 123,
      "title": "Título",
      "originalTitle": "Original",
      "overview": "Sinopsis...",
      "releaseDate": "2024-01-01",
      "year": 2024,
      "posterPath": "/abc.jpg",
      "posterUrl": "https://image.tmdb.org/t/p/w185/abc.jpg",
      "voteAverage": 7.5
    }
  ]
}
```

Máximo **5** resultados (`slice(0, 5)`).

**Errores:**

| Status | Body |
|--------|------|
| 500 | `{ "error": "TMDB no está configurado." }` |
| 4xx/5xx TMDB | `{ "error": "No pudimos buscar películas en este momento." }` |
| 500 catch | mismo mensaje genérico |

**Cliente:** `useTmdbSearch` → `fetch('/api/tmdb/search?query=...')` con AbortController.

---

### 8.2 `GET /api/tmdb/movie`

**Query params:**

| Param | Requerido | Descripción |
|-------|-----------|-------------|
| `movieId` | sí | ID numérico TMDB |

**Proxy TMDB:** `GET https://api.themoviedb.org/3/movie/{movieId}?language=es-AR`

**Respuesta exitosa (200):**

```json
{
  "movie": { /* mismo shape que mapTmdbMovie */ }
}
```

**Errores:**

| Status | Body |
|--------|------|
| 400 | `{ "error": "Película no encontrada." }` (id inválido) |
| 500 | TMDB no configurado / error genérico carga |

**Quién lo consume:**

- `MovieDetailModal` — si falta `overview` o `voteAverage`.
- `MarkWatchedModal` — si falta `voteAverage`.
- `MovieRevealModal` — detalle al revelar.

---

## 9. API externa TMDB (referencia)

| Concepto | Valor |
|----------|-------|
| Base API | `https://api.themoviedb.org/3` |
| Auth | Bearer token (`TMDB_READ_ACCESS_TOKEN`) |
| Idioma | `es-AR` |
| Imágenes | `https://image.tmdb.org/t/p/{size}{poster_path}` |
| Tamaño poster default | `w185` |

**Mapper** (`mapTmdbMovie` en `tmdbHelpers.js`): normaliza `id` → `tmdbId`, títulos, año desde `release_date`, poster URL.

---

## 10. Exportación / importación (WhatsApp)

**Marcadores en el mensaje:**

```
-----PELISPECAS_DATA-----
<base64 UTF-8 de JSON>
-----END_PELISPECAS-----
```

**Payload JSON (v1):**

```json
{
  "v": 1,
  "pending": [ /* movies */ ],
  "watched": [ /* movies */ ]
}
```

**Texto humano:** emojis 🎬 🍿 📋 🎞️ ✅ ⭐ y link `https://pelipecas.vercel.app/para-ver`.

**Import errors:** `empty`, `no_data_block`, `invalid_data` con mensajes en español (`IMPORT_ERROR_MESSAGES`).

También existe `downloadExportMessage` (archivo `.txt`) pero la UI principal usa **copiar al portapapeles**.

---

## 11. Mapa de componentes (árbol lógico)

```
RootLayout (Geist, PwaProvider, globals.css)
└── (main)/layout → MoviesProvider → AppLayout
    ├── AppInitialLoader (hasta isLoaded)
    ├── Header (+ LoveNoteModal)
    ├── BottomNav (4 links)
    ├── SectionTransitionOverlay
    ├── {page}
    └── AppUIProvider
        ├── DeleteConfirmModal
        ├── DetailActionConfirmModal
        └── modal host (Detail | MarkWatched | Success)

Páginas:
- PendingPage → AddMovieForm, MovieSortDropdown, MovieList
- WatchedPage → MovieSortDropdown, MovieList (variant watched)
- TodayPage → TodayWeWatch → MovieRevealStrip, MovieRevealModal
- ConfigPage → InstallAppSection, export/import, CopyToast
```

**Componentes clave:** `MovieCard`, `MoviePoster`, `UserRatingPanel`, `StarRatingRow`, `StarDisplay`, `CinemaBadge`, `CollapsibleSection`, `MovieCardActionMenu` (swipe móvil).

---

## 12. PWA y metadata

**manifest.js:** nombre “Pelipecas — Tu cartelera personal”, `display: standalone`, `orientation: portrait`, `theme_color: #080808`, `background_color: #050505`, icons desde favicon.png.

**Service worker (`sw.js`):** cache name `pelipecas-v1`; fetch network-first con fallback cache en GET.

**metadata (layout.js):** título “Pelipecas”, description cartelera personal, `appleWebApp` capable, `themeColor` #080808, viewport sin zoom usuario.

---

## 13. Textos y tono (copy)

- Idioma: **español Argentina** (`es-AR` en TMDB y fechas `toLocaleDateString`).
- Tono: cercano, cinematográfico, ocasionalmente romántico (love note).
- Ejemplos:
  - Subtítulo header: *"Tu cartelera personal de películas."*
  - Hoy vemos: *"Dejá que Pelipecas elija la próxima función."*
  - Mark watched: *"¿La vimos?"* (con icono copa `Wine`)

---

## 14. Consumo de endpoints — resumen rápido

| Acción usuario | Endpoint | Cuándo |
|----------------|----------|--------|
| Escribir en buscador (≥2 chars) | `GET /api/tmdb/search?query=` | Debounced 350ms |
| Abrir detalle sin sinopsis/nota TMDB | `GET /api/tmdb/movie?movieId=` | Lazy en modal |
| Abrir “La vimos” sin voteAverage | `GET /api/tmdb/movie?movieId=` | Lazy |
| Reveal post-ruleta | `GET /api/tmdb/movie?movieId=` | Si aplica |
| CRUD películas | — | Solo localStorage |
| Export/import | — | Clipboard / parse local |

---

## 15. Notas para prompts de diseño o desarrollo

1. **No usar** la paleta Pinterest de `DESIGN.md` para Pelipecas; usar la sección 4 de este documento.
2. Cualquier feature nueva de películas debe persistir en el shape de `normalizeMovie` y considerar export/import.
3. Nuevas llamadas TMDB deben pasar por **Route Handlers** en `src/app/api/tmdb/` para no filtrar el token.
4. Mantener contraste dorado sobre fondos oscuros y touch targets ≥44px en botones principales.
5. La app es **mobile-first** con mejoras desktop en grid y sidebar.

---

## 16. Estructura de carpetas relevante

```
src/
  app/
    api/tmdb/search/route.js
    api/tmdb/movie/route.js
    (main)/para-ver|las-vimos|hoy-vemos|ajustes/page.js
    globals.css, layout.js, manifest.js
  components/     # UI React
  context/        # MoviesContext, AppUIContext, SectionNavigationContext
  helpers/        # movieHelpers, tmdbHelpers, listShareHelpers, revealHelpers, movieSortHelpers
  hooks/          # useMovies, useTmdbSearch, useModalCloseAnimation, etc.
  styles/         # app.module.scss, components.module.scss
public/
  logo.webp, favicon.png, pelipecas-mascots.webp, sw.js
```

---

*Generado desde el código fuente del repositorio Pelipecas. Actualizar este archivo si cambian rutas API, tokens de diseño o funcionalidades.*
