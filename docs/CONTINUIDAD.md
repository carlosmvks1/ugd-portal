# Nota de continuidad

Para cualquier persona o modelo que retome el trabajo sin reconstruir el proyecto. Actualizar al final de cada sesión.

## Dónde está el trabajo

- Rama: `claude/gifted-noether-y0gcrh` (desde `main` en `ed8daca`). PR revisable abierto desde esta rama hacia `main`; **no fusionar ni desplegar** sin autorización de Carlos.
- Encargo vigente: «UGD: cierre funcional, exploración visual y entrega» (14 nov. 2026). Reglas de trabajo: [AGENTS.md](../AGENTS.md); alcance: [PRODUCT.md](PRODUCT.md).
- Registro de cierre con evidencias y pendientes exactos: [cierre.md](cierre.md).

## Hecho

1. PR #24 (ya en `main`): contenido editable con contrato y validación, directorio y fichas de gestores, mapa ↔ ficha por ID/período/nivel, inversión, fotografías, preview vs. público, ejemplos sintéticos aislados, plantilla y guía.
2. Esta rama:
   - `siteArchive` ([src/map/contract.js](../src/map/contract.js)) retira convenios del archivo público (`dist/data/explorer/`) y de las descargas; pruebas en [tests/site-scope.test.mjs](../tests/site-scope.test.mjs) y en `tests/audit.test.mjs`.
   - El build rechaza `design/` en `dist/`.
   - Tres propuestas visuales: [propuestas-visuales.md](propuestas-visuales.md) y prototipos en [design/propuestas/](../design/propuestas/README.md); página comparativa privada publicada para Carlos (enlace en la conversación de la sesión).

## Pendiente

1. **Esperar la elección de Carlos** (opción 1, 2 o 3). La falta de respuesta no es aprobación.
2. Tras la elección: implementar la opción completa sobre `index.html` + `src/styles.css` (y módulos de vista si hace falta) sin cambiar contratos de datos; autoalojar fuentes OFL en `public/fonts/`; reutilizar el mapa SVG existente; revisar móvil (320/390), tableta (768/1024) y escritorio (1440) con capturas; actualizar [visual-system.md](visual-system.md) con el sistema final; ajustar `scripts/browser-check.mjs` solo donde cambien selectores, sin debilitar aserciones.
3. Contenido institucional y decisiones externas: [cierre.md §3–4](cierre.md#3-contenido-pendiente-exacto).

## Comandos

```bash
npm ci
npm test                      # 51 pruebas
npm run validate
npm run build                 # dist/ público
npm run test:browser          # requiere Chromium; en la nube CHROME_PATH ya apunta a él
npm run test:admin-browser    # administración experimental (CI lo ejecuta)
node design/propuestas/capturas.mjs work/propuestas   # capturas de las propuestas
node design/propuestas/capturas.mjs --serve           # ver prototipos en http://127.0.0.1:4174/
```

Resultado de la última ejecución (14 nov. 2026, local): todos OK. Detalle en [cierre.md §2](cierre.md#2-comprobaciones-ejecutadas-en-esta-sesión-locales).

## Decisiones tomadas en esta sesión

- Las claves `agreements_*` del archivo se dejan en `null` en lugar de borrarse: el cliente valida la estructura y no dibuja el mapa si faltan.
- Los prototipos no reproducen el logotipo SESAL (contiene el escudo nacional) hasta tener autorización; usan un marcador.
- Colores SESAL verificados en el CSS vigente de salud.gob.hn el 14 nov. 2026; no se tratan como manual certificado.
- Dorado `#AD8411` solo decorativo (3,45:1); texto dorado pequeño con `#7D5F0A`.

## Siguiente paso

Leer la respuesta de Carlos sobre la opción visual e implementar esa opción en esta misma rama (o en una rama nueva desde `main` si este PR ya se fusionó), manteniendo un único PR para el rediseño.
