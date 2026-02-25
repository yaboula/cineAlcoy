# Product Requirements Document (PRD) - Cinema App

## 1. Visión del Producto

Desarrollar una plataforma web de streaming de alta calidad técnica y visual. La aplicación permitirá a los usuarios descubrir, buscar y reproducir películas y series integrando el catálogo completo de **TMDB** (para metadatos) y **VidSrc** (para la reproducción de video). El enfoque principal es un rendimiento excepcional (sub-segundo), diseño UI/UX premium y una arquitectura robusta basada en las mejores prácticas de **Next.js App Router (React Server Components)**.

## 2. Objetivos Principales (Goals)

1. **Rendimiento Extremo:** Cargas casi instantáneas mediante renderizado en el servidor (RSC) y caché agresiva de peticiones a TMDB.
2. **Seguridad Total:** Ninguna clave de API debe exponerse al lado del cliente. Los iframes de terceros deben estar _sandboxeados_ y restringidos.
3. **Experiencia Premium:** Interfaz de usuario "Vibe-coded", usando Tailwind CSS para un diseño inmersivo (Dark mode, Skeletons de carga, sin destellos de UI).
4. **Persistencia Ligera:** Funcionalidad de "Continuar Viendo" utilizando el almacenamiento local del navegador (`localStorage`) sin la necesidad de requerir un backend con base de datos propia para usuarios en esta etapa (MVP).

## 3. Historias de Usuario (User Stories)

### 3.1. Descubrimiento y Navegación

- **Como** usuario entusiasta de cine, **quiero** ver una página de inicio con los títulos más populares, estrenos y mejor valorados, **para** poder decidir fácilmente qué ver hoy.
- **Como** usuario, **quiero** una barra de búsqueda rápida, **para** encontrar una película o serie específica por su título.

### 3.2. Visualización de Detalles

- **Como** usuario, **quiero** acceder a una página de detalle del título (película o serie), **para** leer la sinopsis, ver el póster, la valoración y las etiquetas de género antes de reproducirla.
- **Como** usuario viendo una serie, **quiero** un selector desplegable o lista de episodios debajo del reproductor, **para** poder cambiar de capítulo rápidamente sin volver a la página de inicio.

### 3.3. Reproducción (Iframe)

- **Como** espectador, **quiero** reproducir el contenido directamente en la página de detalle, **para** no tener que abandonar la aplicación.
- **Como** espectador, **quiero** que el entorno del reproductor fuerce un modo oscuro y minimice las distracciones visuales (`theater mode` implícito), **para** tener una experiencia inmersiva.

### 3.4. Continuar Viendo / Historial

- **Como** usuario frecuente, **quiero** que la aplicación recuerde las películas/series a las que he accedido recientemente, **para** poder retomarlas desde un panel de "Historial" o "Continuar Viendo" en la página principal.

## 4. Requisitos Funcionales (Functional Requirements)

### 4.1. Integración con TMDB (Catálogo)

- **Peticiones Server-Side:** Todas las llamadas a `api.themoviedb.org` deben ejecutarse en Server Components o Server Actions.
- **Caché y Revalidación:** Se debe implementar `fetch(url, { next: { revalidate: 3600 } })` (caché de 1 hora) para portadas/catálogo para evitar cuellos de botella y límites de Rate Limit de la API.
- **Búsqueda:** Búsqueda asíncrona (debounce idealmente) a través del endpoint `/search/multi`.
- **Carga progresiva:** La página principal o los resultados de búsqueda implementarán un botón de 'Cargar más' (Paginación tradicional) o un 'Infinite Scroll' utilizando un Server Action o Route Handler para obtener la página siguiente de la API de TMDB.

### 4.2. Reproductor de Video (VidSrc)

- **Ruta Dinámica:** El reproductor debe montar en `/movie/[id]` o `/tv/[id]/[season]/[episode]`.
- **Aislamiento (Isolation):** El iframe debe aislarse sin interactuar con nuestro DOM (`sandbox="allow-scripts allow-same-origin allow-presentation"`). Prohibido interceptar postMessages a menos que esté documentado en la API pública segura.
- **Selector de Episodios (TV Shows):** Implementar un componente UI de cliente que haga _fetch_ a la API `/tv/{id}/season/{season_number}` de TMDB para obtener y mostrar la lista de episodios de la temporada actual.

### 4.3. Persistencia de Historial (Client-Side)

- **Estructura de Datos:** Un hook personalizado (`useWatchHistory`) que guarde en `localStorage` un array de objetos:
  ```javascript
  {
     tmdb_id: string | number,
     title: string,
     poster_path: string,
     type: 'movie' | 'tv',
     timestamp: number (UNIX epoch)
  }
  ```
- **Límite de Historial:** Limitar el almacenamiento a los últimos 20-50 elementos para no exceder la cuota local.

## 5. Requisitos No Funcionales (Non-Functional Requirements)

- **Framework:** Next.js (App Router) version >= 14.
- **Lenguaje:** TypeScript estricto (Strict mode activado). No se permitirán `any`.
- **Estilos:** Tailwind CSS sin CSS en línea (excepto variables dinámicas absolutas). Interfaz adaptativa (Mobile First).
- **SEO:** Utilizar la API `generateMetadata` de Next.js para inyectar títulos y meta-etiquetas descriptivas por cada página de película.

## 6. Edge Cases y Manejo de Errores

1.  **Imágenes Rotas o Faltantes:** Si TMDB no provee `poster_path` o `backdrop_path`, o la imagen devuelve 404, el componente `<Image>` de Next.js debe renderizar un _Fallback_ visual estilizado con el título o un ícono genérico.
2.  **TMDB Caído o Error 500:** Atrapar excepciones en la petición fetch. Utilizar `error.tsx` en el layout para mostrar una "Pantalla de Error Temporal" amigable de Tailwind.
3.  **Tiempos de Carga (Loading States):** Cada segmento de UI que dependa de red (Server Components asíncronos) debe estar envuelto en `Suspense` y proveer un archivo `loading.tsx` con barras/cuadrículas en Skeleton (pulso animado de Tailwind `animate-pulse`).
4.  **CORS de VidSrc y Política de Sandbox Flexible:** No intentar leer o manipular el DOM interno del iframe de VidSrc. Se probará el nivel de restricción del iframe. Si la restricción estricta rompe la reproducción (ya que reproductores como VidSrc suelen requerir `allow-popups` para funcionar), se relajará el sandbox y se añadirá un Disclaimer de UI amigable avisando al usuario que el reproductor externo podría contener ventanas emergentes, recomendando el uso de ad-blockers.
5.  **Navegación Offline / Sin Storage:** Si `localStorage` está deshabilitado por el navegador (ej. modo incógnito estricto), la aplicación debe atrapar la excepción (try/catch) y seguir funcionando degradando la característica del historial silenciosamente.
6.  **Empty States:** Si la búsqueda no arroja resultados, o si el historial de 'Continuar Viendo' está vacío, se mostrará un componente de ilustración estilizada (Tailwind) invitando al usuario a explorar el catálogo.

## 7. Fases de Etapas de Entrega (Milestones)

- **M4: Interactividad Cliente:** Búsqueda dinámica y panel de "Continuar Viendo" con `localStorage`.
- **M5: Varnish / Polish:** Transiciones, accesibilidad (a11y), validación SEO y auditoría final.
