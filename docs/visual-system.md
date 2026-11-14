# Sistema visual del portal UGD · «Salud y territorio»

Estado: **dirección visual elegida por Carlos (opción 2, 14 nov. 2026) e implementada** en [index.html](../index.html) y [src/styles.css](../src/styles.css). Sustituye las reglas del prototipo anterior (atlas dominante, portada cartográfica, paleta turquesa, Segoe UI). La exploración previa está en [propuestas-visuales.md](propuestas-visuales.md). Este documento no aprueba identidad institucional, textos, cifras ni fotografías: eso sigue [PRODUCT.md](PRODUCT.md) y la [gobernanza](content-governance.md).

## 1. Principios

1. **Explicar antes que mostrar datos.** El recorrido es: qué es la UGD → cómo funciona → dónde trabaja y quién gestiona → población e inversión → equipos → contacto. Los accesos directos de la portada permiten saltarlo.
2. **Fotografía documental con función narrativa.** Cada imagen tiene un lugar y un propósito ([ficha de necesidades](fotografias-necesidades.md)). Sin fotografía, el lugar desaparece: no hay marcos vacíos ni degradados que imiten una foto.
3. **Pertenencia a SESAL** por paleta, franja «Gobierno de la República de Honduras · Secretaría de Salud» y, cuando esté autorizado, el logotipo oficial (`institution.json → brand`). No se reproduce el escudo ni el logotipo sin autorización.
4. **Datos con su contexto.** Toda cifra lleva período, fuente y estado de verificación junto a ella; «Sin dato» nunca se muestra como cero.
5. **Una sola composición para portada, territorio y gestor**: mismos títulos serif, mismas bandas azul noche, mismos rótulos de sección.

## 2. Color

Valores tomados del CSS vigente de salud.gob.hn el 14 nov. 2026 («Nuevos Colores Institucionales»). Son referencias de implementación, **no** un manual certificado; si SESAL entrega su manual, se ajustan las variables de `:root`.

| Variable | Valor | Uso | Contraste |
| --- | --- | --- | --- |
| `--navy-900` | `#13294F` | Cabecera, bandas oscuras (territorio, contacto), cabecera de ficha | Blanco 14,6:1 |
| `--navy-950` | `#0D1D3A` | Franja de gobierno, pie | — |
| `--navy-800` | `#183A78` | SESAL «azul-sesal-dark»: cifras destacadas | 10,96:1 sobre blanco |
| `--blue` | `#224F9D` | SESAL «azul-sesal»: enlaces y botones secundarios | 7,35:1 sobre papel |
| `--paper` / `--paper-2` | `#FAF7F1` / `#F3EEE3` | Fondo de lectura / bandas alternas | — |
| `--ink` / `--ink-3` | `#1B2433` / `#5A6272` | Texto / metadatos | 14,6:1 / 5,7:1 sobre papel |
| `--gold` | `#AD8411` | SESAL «dorado-sesal»: solo filetes, selección y bordes (3,45:1) | Decorativo |
| `--gold-text` | `#7D5F0A` | Rótulos dorados pequeños sobre claro | 5,98:1 |
| `--gold-light` | `#E9D59A` | Rótulos y botón principal sobre azul noche | 9,91:1 |
| `--on-dark` | `#C9D3E6` | Texto secundario sobre azul noche | 9,57:1 |
| `--map-*` | `#2F5E9E`, `#A9BFDF`, `#5F84BE`, `#E6E0D2`, `#13294F`, `#D9B65A` | Mapa: cobertura, escalas, sin cobertura, gestor resaltado, selección | Con leyenda textual |

Foco de teclado: contorno `#FFBF47` de 3 px en todos los fondos.

## 3. Tipografía

Fuentes OFL autoalojadas en `public/fonts/` (subconjunto latino, ~120 KB en total, `font-display: swap`, dos precargadas). Licencias junto a los archivos.

| Rol | Familia | Uso |
| --- | --- | --- |
| Títulos | Source Serif 4 600/700 | `h1`–`h3`, nombres de territorio y gestor, cifras destacadas |
| Texto y funcional | Source Sans 3 400/600/700 | Párrafos, navegación, controles, tablas, metadatos |

Escala: `h1` `clamp(2.5rem, 5.6vw, 4.9rem)` · `h2` `clamp(2rem, 3.6vw, 3.1rem)` · `h3` 1,4rem · cuerpo 18 px (17 px en tableta, 16,5 px en teléfono). Rótulos de sección en mayúsculas con espaciado 0,12em. Cifras con numerales tabulares. Comprobado sin desbordamiento: texto al 200 % con espaciado ampliado en la página pública a 390 px (WCAG 1.4.4/1.4.12, `test:browser`) y nombres de gestor de más de 150 caracteres en las fichas sintéticas a 320 px (`synthetic-check`).

## 4. Composición

| Zona | Con contenido completo | Con contenido parcial |
| --- | --- | --- |
| Portada (`#inicio`) | Fotografía a sangre, velo azul en la mitad inferior, título, mensaje, dos acciones, crédito en la esquina | Fondo azul noche con la silueta de Honduras en dorado tenue; mismo texto y acciones |
| Banda de datos | Tres cifras clave + «Ir directamente a» | Cifras ausentes como «Sin dato» con su fuente |
| Capítulos 01–02 | Texto + fotografía en dos columnas | Una columna; sin hueco |
| La UGD | Filas «título \| contenido»; presentación en serif grande; dirección con retrato | Filas «En preparación» con su descripción; dirección sin retrato en las mismas columnas |
| Territorio (03) | Banda azul con texto y foto → filtros → mapa + ficha del territorio → lista → fuentes → directorio y ficha de gestor | Sin foto, banda solo con texto; si falla la cartografía, aviso y tabla; si falla el archivo, aviso con reintento y el resto del portal disponible |
| Inversión (04) | Dos columnas: por nivel de gestión y por nivel de atención, cada una con tabla y barras | «En preparación» en cada dimensión |
| Equipos (05) | Galería: primera foto grande, resto en cuadrícula; 1 y 2 fotos tienen composición propia | Nota «En preparación» |
| Contacto (06) | Banda azul con canales | Canales «En preparación» legibles sobre azul |

Anchura máxima 1240 px; márgenes laterales de 32 px (20 px en tableta, 16 px en teléfono). Separación vertical de capítulos 6rem (4,2rem en tableta y teléfono). Sin tarjetas con sombra: la jerarquía se marca con filetes, bandas y tipografía.

## 5. Componentes clave

- **Ficha del territorio:** nombre → estado y verificación → **gestores vinculados** (enlace a su ficha) → población → procedencia → detalle. Los municipios no muestran métricas que no aplican. En teléfono (≤ 700 px) es una hoja inferior fija; al abrir la ficha de un gestor se pliega a una barra con el nombre y se despliega al tocarla.
- **Ficha del gestor:** cabecera azul (con la primera fotografía del gestor de fondo, si existe) con tipo, nombre, territorios y población más reciente; columna principal con territorios por período y nivel, población, inversión atribuida y galería; columna lateral con descripción, ámbito, contacto y fuentes; acciones «Ver sus territorios en el mapa», «Copiar enlace» y «Volver al directorio».
- **Dirección de la UGD:** retrato 4:5 de hasta 220 px, rótulo, nombre en serif, cargo en azul, responsabilidades y contacto. Presencia sobria, sin biografía ni mensaje.
- **Cajones** («Ver como lista», «Fuentes, observaciones y descargas»): título serif con signo «+/–» dorado.

## 6. Movimiento y rendimiento

Combinación aprobada (14 nov. 2026): A «sutil» + C «territorial» + de B solo la entrada de portada y la aparición de fotografías. Implementación en `src/motion.js` (Web Animations API, sin dependencias) y transiciones de estado en la sección «Movimiento» de `src/styles.css`.

| Elemento | Efecto | Duración |
|---|---|---|
| Enlaces, botones, territorios del mapa | Cambio de color o relleno al pasar el puntero o enfocar | 110–160 ms |
| Ficha del territorio al cambiar de selección | Sus bloques suben 6 px desde opacidad 0,4 (escalonado máx. 60 ms) | 200 ms |
| Hoja de detalle en móvil (primera selección) | Desplazamiento de 16 px | 240 ms |
| Mapa al bajar o subir de nivel | Acercamiento o alejamiento desde el territorio pulsado | 320 ms |
| Territorio seleccionado | El contorno pasa de la línea blanca al dorado y crece de grosor | 480 ms |
| Municipios de un gestor | Relleno desde el tono vacío; escalonado total ≤ 240 ms y simultáneo con más de 24 municipios (total ≤ 600 ms) | 360 ms |
| Cabecera de la ficha del gestor | Entrada desde opacidad 0,4 | 240 ms |
| Portada (solo si se carga arriba) | Hasta cuatro elementos suben desde opacidad 0,4, escalonado 60 ms | 360 ms |
| Fotografías y retrato bajo el pliegue | Revelado vertical de la imagen al llegar; el pie de foto nunca se oculta | 520 ms |

Reglas:
- Ningún texto ni control espera a una animación: las entradas parten de opacidad ≥ 0,4, nada bloquea el puntero y se puede pulsar durante cualquier efecto. No hay efectos encadenados (el acercamiento sustituye al fundido genérico del mapa) ni animaciones permanentes: en reposo no queda ninguna en curso.
- Sin JavaScript o si `motion.js` falla, no se aplica ningún estado inicial: todo el contenido es visible. Con `prefers-reduced-motion: reduce` el módulo no añade `html.has-motion`, no registra observadores y la regla global anula transiciones y animaciones.
- Sin desplazamiento secuestrado, parallax, contadores, carruseles ni vídeo. La selección rápida reinicia el efecto en curso; atrás/adelante y foco no cambian.
- Descartado tras medirlo: atenuar el resto del mapa al seleccionar (cambiar la opacidad de cientos de trazados añadía ~25 ms a la selección en escritorio) y la transición de vista nombre del gestor → ficha (bloquea la interacción mientras dura y el navegador la cancela al cambiar el tamaño de la ventana en móvil).
- Comprobación: `node scripts/motion-check.mjs <url>` sobre `preview:synthetic` (legibilidad inmediata, fotografías, resaltado acotado, atrás/adelante, selección rápida, teclado, reposo y movimiento reducido) y `node scripts/motion-perf.mjs <repeticiones> antes=<url> despues=<url>` para comparar rendimiento alternando las versiones.

Imágenes con `width`/`height` reservados, `loading="lazy"` salvo la de portada (`fetchpriority="high"`), máximo 1 MB por foto (validado). Hoja de estilos ~41 KB sin dependencias.

## 7. Verificación y mantenimiento

- `npm run test:browser`: estructura, teclado, menú, móvil, enlaces directos y atrás/adelante, lugares sin foto, dirección, estados de error.
- `npm run review:visual`: capturas por sección en 1440, 820 y 390 px del sitio público y de la vista sintética con fotografías, comprobación de desbordamiento y de contraste WCAG AA, y recorrido territorio → ficha → mapa → atrás (en `work/revision/`, no versionado).
- Para cambiar color o tipografía, editar solo las variables de `:root` en `src/styles.css` y volver a ejecutar `review:visual`.
- Las clases que emite JavaScript (`info-card`, `detail-*`, `profile-*`, `dataset*`, `content-*`) son parte del contrato entre vistas y estilos: renombrarlas exige actualizar ambos.
