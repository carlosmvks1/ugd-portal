# Nota de continuidad

Para cualquier persona o modelo que retome el trabajo sin reconstruir el proyecto. Actualizar al final de cada sesión.

## Dónde está el trabajo

- PR #25 fusionado en `main` (`2a702cc`) y **publicado** en <https://carlosmvks1.github.io/ugd-portal/> el 14 nov. 2026, con autorización de Carlos. Verificación: [cierre.md §2b](cierre.md#2b-publicación-14-nov-2026).
- Encargo: «UGD: cierre funcional, exploración visual y entrega» + instrucción del 14 nov. 2026 que elige la **opción 2 «Salud y territorio»** y añade el bloque de la directora.
- Reglas: [AGENTS.md](../AGENTS.md). Alcance: [PRODUCT.md](PRODUCT.md). Estado y pendientes exactos: [cierre.md](cierre.md).

## Hecho

1. Contenido editable, fichas de gestores y vínculos con el mapa (PR #24, ya en `main`).
2. Convenios fuera del artefacto público y de las descargas (`siteArchive`).
3. Tres propuestas visuales ([propuestas-visuales.md](propuestas-visuales.md), `design/propuestas/`); elegida la 2.
4. Implementación de la opción 2: `index.html`, `src/styles.css` reescritos; fuentes OFL en `public/fonts/`; portada con o sin foto; capítulos; explorador con gestores primero; ficha de gestor con cabecera; hoja móvil que se pliega al abrir una ficha.
5. Contenido nuevo: bloque `direccion-ugd` (tipo `profile`), `sections.home` (mensaje), `brand` (logotipo), lugares de fotografía `home/ugd/decentralization/territory/teams` con `focus`; reglas «una foto, un lugar».
6. Pruebas nuevas (`tests/narrative.test.mjs`, aserciones en `browser-check` y `synthetic-check`), revisión visual reproducible (`npm run review:visual`) y documentación: [sistema visual](visual-system.md), [ficha de fotografías](fotografias-necesidades.md), plantilla, guía y pendientes.

## Pendiente

- Solo contenido oficial y decisiones externas: [cierre.md §3–4](cierre.md#3-contenido-pendiente-exacto) y [content-pending.md §2](content-pending.md#2-preguntas-institucionales-exactas).
- Cuando lleguen las fotografías: cargarlas según la ficha, ejecutar `npm run review:visual` y revisar a ojo el texto sobre la foto de portada (el control de contraste no cubre texto sobre imágenes).
- Limitaciones técnicas aceptadas: [cierre.md §5](cierre.md#5-limitaciones-técnicas-conocidas).

## Comandos

```bash
npm ci
npm test                      # 57 pruebas
npm run validate
npm run build                 # dist/ público
npm run test:browser          # requiere Chromium; en la nube CHROME_PATH ya apunta a él
npm run test:admin-browser    # administración experimental (CI lo ejecuta)
npm run review:visual         # capturas, contraste y recorrido en work/revision/
npm run preview:synthetic     # ver el portal con fotografías y datos ficticios
```

Última ejecución (14 nov. 2026, local): todas OK ([cierre.md §2](cierre.md#2-comprobaciones-ejecutadas-locales-14-nov-2026)).

## Decisiones tomadas (y por qué)

- `agreements_*` en `null` en el archivo público (el cliente valida la estructura) y claves omitidas en descargas.
- Logotipo SESAL no reproducido sin autorización; cabecera con nombre en texto y franja de gobierno.
- Colores de la web vigente de SESAL como referencia, no como manual.
- Dorado `#AD8411` solo decorativo; `#7D5F0A` y `#E9D59A` para texto dorado.
- La primera foto de un gestor encabeza su ficha y no se repite en su galería.
- Retrato de la dirección sin `placements`, para que no cuente entre las fotos de equipos.
- Bloque de dirección con `block_id` `direccion-ugd` (el contacto ya usa `direccion` para el domicilio).
- Hoja inferior del territorio solo en teléfono (≤ 700 px); en tableta, el detalle va debajo del mapa.
- Mensaje de portada en `sections.home` como propuesta (`proposed`) hasta su aprobación.

## Siguiente paso

Esperar el material de la UGD ([cierre.md §3](cierre.md#3-contenido-pendiente-exacto), [ficha de fotografías](fotografias-necesidades.md)). Al recibirlo: cargarlo según la [guía](content-guide.md) sin tocar `src/` ni `index.html`, ejecutar `npm run validate:content`, `npm run preview:content` y `npm run review:visual`, revisar textos, encuadres, contraste y cifras con el contenido definitivo, abrir PR y publicar solo con autorización (`pages.yml` desde `main`). No abrir otra ronda de diseño.
