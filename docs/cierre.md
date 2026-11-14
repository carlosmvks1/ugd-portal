# Registro de cierre del portal UGD

Fecha: 14 de noviembre de 2026. PR #25 fusionado en `main` (`2a702cc`) y publicado con autorización de Carlos (§2b). Nota de continuidad: [CONTINUIDAD.md](CONTINUIDAD.md).

## 1. Estado

**Cierre técnico declarado:** los tipos de contenido acordados (textos institucionales, dirección, autoridades, fundamento legal, gestores, vínculos territoriales, población, inversión, fotografías, contacto, mensaje de portada y logotipo) se incorporan editando `data/content/` y `public/media/`, sin desarrollo adicional. Lo que falta es **contenido oficial y decisiones externas** (§3–4). Las limitaciones técnicas que siguen se listan en §5.

| Ámbito | Estado | Evidencia |
| --- | --- | --- |
| Contenido editable con contrato y validación entre archivos | Completo | [contrato](../src/content/contract.js), `npm run validate` |
| Dirección visual «Salud y territorio» (opción 2, elegida por Carlos) | Implementada | [sistema visual](visual-system.md), `npm run review:visual` |
| Dirección de la UGD (retrato, nombre, cargo, responsabilidades, contacto) | Completo, pendiente de contenido | bloque `direccion-ugd`, [narrative.test.mjs](../tests/narrative.test.mjs), `synthetic-check` |
| Fotografías por lugar narrativo, sin repetición, encuadre adaptable, sin huecos si faltan | Completo | reglas en `contentErrors`, `browser-check` (público sin fotos) y `synthetic-check` (con fotos) |
| Directorio y ficha por gestor con enlace estable, atrás/adelante, enlace inválido, nombres largos, sin foto | Completo | `synthetic-check` |
| Mapa ↔ ficha por ID, período y nivel; departamento distinto de municipios; «sin vínculo confirmado» | Completo | `linksForTerritory`, `synthetic-check`, `journey-capture` |
| Recorrido territorio → gestor → regreso al mapa → atrás (escritorio y teléfono) | Completo | `scripts/journey-capture.mjs` (verifica además que la ficha no quede tapada en teléfono) |
| Inversión por nivel de gestión y de atención; estados completo/parcial/ausente | Completo | `investment-view.js`, `synthetic-check` |
| Público sin ejemplos ni contenido no aprobado (también artefacto y descargas) | Completo | build rechaza `synthetic`, `admin/`, `observatory/`, `work/`, `tests/`, `design/` |
| Convenios fuera del artefacto público y de las descargas | Completo | `siteArchive`, [site-scope.test.mjs](../tests/site-scope.test.mjs) |
| Recorrido «solo contenido» (agregar gestor → vincular → mapa → ficha → población/foto → volver) | Completo | `test:content-walkthrough` (dentro de `test:browser`) |
| Plantilla, guía y ficha de necesidades fotográficas | Completo | [plantilla](content-collection-template.md), [guía](content-guide.md), [fotografías](fotografias-necesidades.md) |

## 2. Comprobaciones ejecutadas (locales, 14 nov. 2026)

| Comando | Resultado |
| --- | --- |
| `npm test` | 57/57 |
| `npm run validate` | «Datos y contenido válidos» |
| `npm run build` | `dist/` generado; sin convenios, sin `design/`, fuentes y licencias OFL incluidas |
| `npm run test:browser` | OK: 7 secciones, menú y teclado, móvil, texto al 200 %, enlaces antiguos, lugares sin foto, dirección pendiente, descargas sin campos internos, recuperación; sintéticos (fichas, 320 px, atrás/adelante, inversión, fotografías, dirección, mensaje, errores); recorrido solo con contenido |
| `npm run test:admin-browser` | OK (administración experimental sin cambios de comportamiento) |
| `npm run review:visual` | 12 vistas × 1440/820/390 px del sitio público y de la vista sintética: sin desbordamiento, sin errores de página, sin fallos de contraste AA; recorrido y estado de error OK |
| Medición de la portada pública (390 px, movimiento reducido) | Primer pintado ~130 ms en local; 5 variantes tipográficas cargadas; sin errores de consola |

Revisión visual real hecha sobre las capturas; defectos encontrados y corregidos: guion en el título de portada, pie de foto tapado por el velo, hueco junto a «Funciones», métricas «No aplica» en municipios, selección poco visible en el mapa, hoja móvil que tapaba la ficha, hoja fija en tableta, crédito superpuesto al título de ficha móvil, contraste de notas y rótulos sobre azul, tabla de inversión desalineada, desbordamiento con texto ampliado, 404 del icono.

CI de GitHub (`ci.yml`) se ejecuta en cada push del PR; su resultado debe consultarse en el PR. CI no sustituye la revisión visual.

## 2b. Publicación (14 nov. 2026)

- URL pública: <https://carlosmvks1.github.io/ugd-portal/>. Commit desplegado: `2a702cc` (fusión del PR #25), mediante `pages.yml` (`workflow_dispatch` sobre `main`, ejecución n.º 6, correcta: pruebas, validación, build y `test:browser` incluidos).
- Verificación sobre la URL pública (navegador automatizado, 1440 y 390 px): portada y navegación por los 7 destinos (menú móvil incluido); mapa Lempira → Gracias con su ficha territorial; atrás/adelante y «Volver a Honduras»; enlace directo a un territorio; ficha de gestor inexistente con aviso; anclas internas sin destinos rotos; sin contenido sintético ni fotografías de prueba en el texto, el HTML ni los datos; `admin/`, `observatory/`, `work/`, `tests/` y `design/` responden 404; fuentes y licencias servidas; sin errores de página ni de consola.
- Enlaces y recursos comprobados: 62. Único fallo: el enlace a la fuente en `portalunico.iaip.gob.hn` responde 403 a solicitudes automatizadas desde la red de verificación (también su página raíz); no es un fallo del portal y debe comprobarse a mano desde un navegador en Honduras.
- Hoy no hay gestores publicados, así que no existen fichas de gestor que recorrer en producción; el recorrido territorio → ficha → mapa está verificado con la vista sintética (`journey-capture`).
- Mientras no haya contenido aprobado, las secciones institucionales muestran su descripción con el rótulo «En preparación», tal como se implementó; no hay huecos ni fotografías vacías.

## 3. Contenido pendiente exacto

Validación común: `npm run validate:content`, `npm run preview:content` y, si cambian fotos o textos largos, `npm run review:visual`. Solo `approved`, `published` u `outdated` llegan a `dist/`.

| Campo | Destino | Formato | Validación requerida |
| --- | --- | --- | --- |
| Mensaje de portada | `institution.json → sections.home.blocks[mensaje].paragraphs` | 1–2 frases | Aprobación UGD (hoy `proposed`) |
| Presentación de la UGD | `sections.ugd.blocks[presentacion].paragraphs` | párrafos | Aprobación UGD |
| Funciones | `sections.ugd.blocks[funciones].items[]` | `title`, `text` op. | Aprobación UGD; respaldo en `source_ids` |
| Dirección de la UGD | `sections.ugd.blocks[direccion-ugd].items[0]` | `name`, `role` obligatorios; `text`, `photo_id`, `contact` op.; `reference_date` | Cargo y responsabilidades validados; canal autorizado |
| Retrato de la dirección | `photos.json` (sin `placements`) + `public/media/` | 4:5, ~1200×1500, < 1 MB, `alt`, `credit`, autorización, `identifiable_people: consented` | Autorización y consentimiento |
| Estructura | `sections.ugd.blocks[estructura].items[]` | `title`, `text` op. | Aprobación UGD |
| Autoridades | `sections.ugd.blocks[autoridades].items[]` | `name`, `role`; `unit`, `since` op. | Aprobación UGD |
| Fundamento legal | `sections.ugd.blocks[fundamento-legal].items[]` | `title`, `issuer`; `number`, `date`, `url`, `validity` | Vigencia confirmada |
| Descentralización (4 pasos) | `sections.decentralization.blocks[...].paragraphs` | párrafos | Aprobación UGD |
| Contacto | `sections.contact.blocks[direccion, telefono, correo].items[]` | `type`, `label`, `value` | Canal comprobado y autorizado |
| Logotipo | `institution.json → brand` + `public/media/` | SVG/PNG/WebP, `logo_alt`, tamaño | Autorización `granted` y aprobación |
| Gestores | `managers.json → managers[]` | `manager_id`, `name`, `status`, `verification_status`, `source_ids`; resto op. | Identidad confirmada |
| Vínculos gestor–territorio | `managers.json → assignments[]` | `manager_id`, `territory_id`, `snapshot_id`, `care_level`, `status`, `verification_status`, `source_id` | El validador rechaza referencias inexistentes |
| Población por gestor | `managers[].population[]` | `value`, `period`, `source_id`, `verification_status` | Reportada por la fuente |
| Definición de población 2024 | `population.json` + `categories.population_definitions` | clave | Confirmación UGD |
| Categorías (entidad, niveles de atención y gestión, tipos de monto) | `categories.json` | `key`, `label`, `status` | Definición UGD |
| Inversión | `investment.json → datasets[]` | dimensión, período, moneda ISO, tipo de monto, alcance, filas | Categorías existentes; sin repartir agregados |
| Seis fotografías de equipos | `photos.json` + `public/media/` | lugares `home`, `ugd`, `decentralization`, `territory`, `teams`×2; < 1 MB; `focus` | Autorización; consentimiento si hay personas identificables |
| Fuentes | `sources.json` | `source_id`, `title`, `publisher` | Referencia verificable |
| Datos territoriales actualizados | `data/explorer/archive.json` | [contrato del mapa](../src/map/contract.js) | Sustituye el corte 2024 provisional |

## 4. Decisiones externas pendientes

Las 15 preguntas de [content-pending.md §2](content-pending.md#2-preguntas-institucionales-exactas) (incluidas dirección, mensaje de portada e identidad gráfica), y además:

- **Publicaciones siguientes**: cada carga de contenido requiere PR, fusión autorizada y ejecución manual de `pages.yml` desde `main`.
- **Dominio y alojamiento**: decididos en principio, pendientes en nombre y servicio ([PRODUCT.md §1](PRODUCT.md)).

## 5. Limitaciones técnicas conocidas

- Las fotografías no se redimensionan automáticamente ni se generan variantes `srcset`: se cargan ya optimizadas (el validador rechaza más de 1 MB).
- El archivo territorial y la geometría pesan ~1 MB en la primera consulta del mapa (heredado; la página institucional se muestra antes).
- La ficha del gestor y el directorio viven en la misma página (`?gestor=<id>#ficha-gestor`), por decisión de mantener una sola página.
- El control de contraste automático omite el texto sobre fotografías; ese caso se revisa a ojo con las fotos reales.
- No se ha probado con lectores de pantalla reales ni con visitantes; solo con navegador automatizado y revisión de capturas.
