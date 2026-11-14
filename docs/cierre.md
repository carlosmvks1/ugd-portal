# Registro de cierre del portal UGD

Fecha: 14 de noviembre de 2026. Rama `claude/gifted-noether-y0gcrh` sobre `main` en `ed8daca` (PR #24 fusionado). Nota de continuidad: [CONTINUIDAD.md](CONTINUIDAD.md).

## 1. Estado

| Ámbito | Estado | Evidencia |
| --- | --- | --- |
| Contenido editable separado de la presentación (institución, gestores, vínculos, población, inversión, fotografías, contacto, categorías, fuentes) | Completo (PR #24) | `data/content/*.json`, [contrato](../src/content/contract.js), `npm run validate` |
| Directorio y ficha por gestor con enlace estable `?gestor=<id>#ficha-gestor`, atrás/adelante, enlace inválido, sin foto, nombres largos | Completo (PR #24) | `scripts/synthetic-check.mjs` |
| Mapa ↔ ficha por ID, período y nivel; varios gestores por territorio; departamento con vínculo propio distinto de municipios; «sin vínculo confirmado» | Completo (PR #24) | `linksForTerritory` en [model.js](../src/content/model.js), escenarios sintéticos |
| Inversión por nivel de gestión y de atención, estados completo/parcial/ausente, tabla | Completo (PR #24) | `investment-view.js`, sintéticos |
| Publicable sin ejemplos ni contenido no aprobado (también en `dist/` y descargas) | Completo | build rechaza `synthetic`, `admin/`, `observatory/`, `work/`, `tests/`, `design/` |
| Convenios fuera del artefacto público y de las descargas | **Completado en esta rama** | `siteArchive` en [contract.js](../src/map/contract.js); [site-scope.test.mjs](../tests/site-scope.test.mjs); `browser-check` «Exportación sin convenios» |
| Recorrido «solo contenido» (agregar gestor → vincular → mapa → ficha → población/foto → volver) | Completo (PR #24) | `npm run test:content-walkthrough` (incluido en `test:browser`) |
| Plantilla de recopilación y guía | Completo (PR #24) | [plantilla](content-collection-template.md), [guía](content-guide.md) |
| Tres propuestas visuales | **Entregadas; esperando elección** | [propuestas-visuales.md](propuestas-visuales.md), [design/propuestas/](../design/propuestas/README.md) |
| Rediseño definitivo (§9 del encargo) | **Pendiente de la elección** | — |

Cierre técnico: **no declarado todavía**. La incorporación de contenido ya no requiere desarrollo, pero falta implementar la opción visual elegida y revisarla visualmente en móvil, tableta y escritorio.

## 2. Comprobaciones ejecutadas en esta sesión (locales)

| Comando | Resultado |
| --- | --- |
| `npm test` | 51/51 (antes 49; +2 de alcance público) |
| `npm run validate` | «Datos y contenido válidos» |
| `npm run build` | `dist/` generado; `grep convenio dist/data/explorer/*` → 0 |
| `npm run test:browser` | OK: página única, teclado, móvil, descargas, recuperación, sintéticos (320 px, atrás/adelante, subdirectorio `/ugd/`), recorrido solo contenido |
| `npm run test:admin-browser` | OK (la administración experimental sigue usando `publicArchive` sin cambios) |
| `node design/propuestas/capturas.mjs work/propuestas` | 24 capturas, sin desbordamiento horizontal |

El navegador funciona en este entorno (Chromium vía `CHROME_PATH`). CI no sustituye la revisión visual.

Hallazgo durante el trabajo: retirar las claves `agreements_*` del archivo rompía el renderizado del mapa porque el cliente valida la estructura (`assertArchiveStructure`). La proyección las deja en `null` («sin dato») y la prueba nueva cubre ese caso.

## 3. Contenido pendiente exacto

Todos los archivos están en `data/content/`. Validación común: `npm run validate:content` (contrato + reglas entre archivos) y vista previa con `npm run preview:content`; solo `status` `approved`, `published` u `outdated` llegan a `dist/`.

| Campo | Destino | Formato | Validación requerida |
| --- | --- | --- | --- |
| Presentación de la UGD | `institution.json → sections.ugd.blocks[block_id=presentacion].paragraphs` | lista de párrafos (texto) | Aprobación UGD → `status: approved` |
| Funciones | `…ugd.blocks[funciones].items[].title` (+ `text` opcional) | lista | Aprobación UGD; respaldo normativo en `source_ids` |
| Estructura | `…ugd.blocks[estructura].items[]` | `title`, `text` opcional | Aprobación UGD |
| Autoridades | `…ugd.blocks[autoridades].items[]` | `name`, `role` obligatorios; `unit`, `since` (`AAAA-MM-DD`) | Aprobación UGD; `reference_date` del bloque |
| Fundamento legal | `…ugd.blocks[fundamento-legal].items[]` | `title`, `issuer` obligatorios; `number`, `date`, `url` (https), `validity` (`current`/`historical`/`unknown`) | Vigencia confirmada por la UGD |
| Descentralización (4 pasos) | `institution.json → sections.decentralization.blocks[secretaria, gestores, servicios, papel-ugd].paragraphs` | párrafos | Aprobación UGD |
| Contacto institucional | `institution.json → sections.contact.blocks[direccion, telefono, correo].items[]` | `type` (`address`/`phone`/`email`/`website`/`hours`), `label`, `value` | Canal comprobado y autorizado |
| Gestores | `managers.json → managers[]` | `manager_id` estable, `name`, `status`, `verification_status`, `source_ids`; opcionales `short_name`, `entity_type`, `description`, `scope`, `archive_labels`, `contact`, `population`, `note` | Identidad jurídica confirmada por la UGD |
| Vínculos gestor–territorio | `managers.json → assignments[]` | `manager_id`, `territory_id` (código oficial de 2 o 4 dígitos), `snapshot_id`, `care_level`, `status`, `verification_status`, `source_id` | El validador rechaza gestores, territorios o períodos inexistentes |
| Población por gestor | `managers[].population[]` | `value` (entero o `null`), `period {start,end}`, `source_id`, `verification_status`; `definition`, `care_level` opcionales | Reportada por la fuente; nunca suma de municipios |
| Definición de población 2024 | `population.json → periods[2024-v1].definition` + `categories.population_definitions[]` | clave de categoría | Confirmación UGD |
| Tipos de entidad gestora | `categories.json → entity_types[]` | `key`, `label`, `description`, `status` | Definición UGD |
| Niveles de atención (rótulos oficiales) | `categories.json → care_levels[I, II]` | cambiar `label` y `status` | Confirmación UGD |
| Niveles de gestión | `categories.json → management_levels[]` | categorías | Definición UGD |
| Tipos de monto | `categories.json → amount_types[]` | categorías | Definición UGD |
| Inversión | `investment.json → datasets[]` | `dimension` (`management_level`/`care_level`), `period`, `currency` ISO (p. ej. `HNL`), `amount_type`, `definition`, `scope {national/department/manager, id}`, `rows[{category, amount}]`, `reported_total` opcional | Categorías existentes; sin repartir agregados |
| Fotografías | `photos.json → photos[]` + archivo en `public/media/` | `src` `media/…jpg|png|webp` optimizado, `width`, `height`, `alt`, `description`, `credit`, `authorization.status: granted`, `identifiable_people` `none`/`consented`; `place`, `date`, `territory_ids`, `manager_ids`, `placements` opcionales | Autorización de uso y consentimiento documentados fuera del repositorio |
| Fuentes | `sources.json → sources[]` | `source_id`, `title`, `publisher`; `date`, `period`, `url` opcionales | Referencia verificable |
| Datos territoriales actualizados | `data/explorer/archive.json` | contrato de [src/map/contract.js](../src/map/contract.js) | Sustituye el corte 2024 provisional ([explorador](territorial-explorer.md)) |
| Logotipo e identidad SESAL | futura carpeta `public/brand/` (tras la elección visual) | SVG/PNG oficiales con variantes | Autorización y manual vigente de SESAL |
| Fotografías mínimas para la opción 2 (si se elige) | `photos.json` con `placements` `home`/`teams` y `manager_ids` | ≈ 6 imágenes ≥ 1600 px de ancho | Como «Fotografías» |

## 4. Decisiones externas pendientes

Las 12 preguntas de [content-pending.md §2](content-pending.md#2-preguntas-institucionales-exactas), más:

13. **Dirección visual**: elección entre las opciones 1, 2 y 3 (Carlos).
14. **Identidad SESAL**: autorización para usar el logotipo oficial y, si existe, el manual vigente; los colores usados provienen de la web actual, no de un manual.
15. **Fotografías**: compromiso de entrega del conjunto mínimo si se elige la opción 2.
16. **Dominio y alojamiento**: confirmados como decisión, pendientes en nombre y servicio ([PRODUCT.md §1](PRODUCT.md)).
