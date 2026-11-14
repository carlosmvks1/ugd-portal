# Pendientes institucionales y decisiones técnicas

Estado tras completar la estructura técnica de contenidos. Todo lo de §1 se incorpora editando `data/content/` según la [guía](content-guide.md), sin cambiar componentes. §2 son preguntas cuya respuesta solo puede dar la UGD; mientras tanto la estructura acepta cualquier respuesta. §3 registra decisiones técnicas reversibles tomadas para no bloquear el trabajo.

## 1. Información institucional pendiente y dónde se carga

| Información | Archivo y lugar | Estado actual |
| --- | --- | --- |
| Presentación de la UGD | `institution.json → sections.ugd.blocks[presentacion]` | `collecting`, marcador |
| Funciones | `… ugd.blocks[funciones]` (lista) | `collecting` |
| Estructura | `… ugd.blocks[estructura]` (lista) | `collecting` |
| Autoridades (nombre, cargo, fecha de referencia) | `… ugd.blocks[autoridades]` (personas) | `collecting` |
| Fundamento legal (norma, emisor, número, fecha, vigencia) | `… ugd.blocks[fundamento-legal]` (normas) | `collecting` |
| Explicación de la descentralización (4 pasos) | `… sections.decentralization.blocks[secretaria, gestores, servicios, papel-ugd]` | `collecting` |
| Contacto institucional (dirección, teléfono, correo) | `… sections.contact.blocks[direccion, telefono, correo]` | `collecting` |
| Directorio de gestores | `managers.json → managers` | vacío |
| Vínculos gestor–territorio por período y nivel | `managers.json → assignments` | vacío |
| Población reportada por gestor | `managers.json → managers[].population` | vacío |
| Definición de la población 2024 | `population.json → periods[2024-v1].definition` + `categories.population_definitions` | `null` |
| Inversión por nivel de gestión | `investment.json` (dimensión `management_level`) + `categories.management_levels` | vacío |
| Inversión por nivel de atención | `investment.json` (dimensión `care_level`) | vacío |
| Tipos de monto y moneda | `categories.amount_types`; `currency` en cada conjunto | vacío |
| Tipos de entidad gestora | `categories.entity_types` | vacío |
| Nombres oficiales de los niveles de atención | `categories.care_levels` (I y II, `pending_verification`) | rótulos provisionales, sin publicar |
| Fotografías autorizadas con contexto | `photos.json` + `public/media/` | vacío |
| Fuentes citadas | `sources.json` | vacío |
| Datos territoriales actualizados | `data/explorer/archive.json` ([explorador](territorial-explorer.md)) | corte 2024 provisional |

## 2. Preguntas institucionales exactas

1. **Tipos de entidad gestora.** ¿Qué tipos reconoce la UGD (p. ej. mancomunidad, asociación, ONG, municipalidad) y con qué nombre oficial? → `categories.entity_types`.
2. **Etiquetas históricas.** ¿Cuáles de las 39 etiquetas del archivo 2024 corresponden a qué entidad gestora vigente, si alguna? Sin respuesta se muestran como «nombres en el archivo histórico», sin identidad confirmada. → `managers[].archive_labels`.
3. **Vínculos territoriales.** Para cada gestor: ¿qué municipios (o departamentos) atiende, en qué período y en qué nivel de atención? ¿Un vínculo departamental implica todos sus municipios? (El portal hoy **no** lo supone.) → `assignments`.
4. **Población.** ¿La cifra 2024 es población asignada, atendida, estimada u otra? ¿De qué fuente y fecha? ¿La población de un gestor se reporta por la fuente o debe obtenerse de otra manera? → `population.json`, `managers[].population`.
5. **Niveles de gestión.** ¿Qué categorías componen «inversión por nivel de gestión» (nombres, orden, definición)? → `categories.management_levels`.
6. **Niveles de atención.** ¿Nombres oficiales de I y II y si existen otros? → `categories.care_levels`.
7. **Montos.** ¿Presupuestado, transferido o ejecutado? ¿Moneda y si es nominal? ¿Período fiscal o calendario? ¿Existe atribución verificable por departamento o por gestor? → `categories.amount_types`, `investment.json`.
8. **Períodos.** ¿Qué período representa cada entrega de datos y cuál es la fecha de corte? → corte territorial y `period` de cada conjunto.
9. **Aprobación.** ¿Quién aprueba cada categoría de contenido y qué evidencia se registra? (Ver [gobernanza §5](content-governance.md).) → cambio de `status` a `approved`.
10. **Fotografías.** ¿Quién otorga la autorización de uso, con qué alcance, y cómo se documenta el consentimiento de personas identificables? → `photos[].authorization`, `identifiable_people`.
11. **Contacto.** ¿Qué canales institucionales están autorizados y funcionan (dirección, teléfono, correo, horario, sitio)? ¿Los gestores tienen contacto institucional publicable? → `sections.contact`, `managers[].contact`.
12. **Fundamento legal.** ¿Qué normas aplican y cuál es su vigencia confirmada? → `blocks[fundamento-legal]`.

## 3. Decisiones técnicas reversibles tomadas

| Decisión | Motivo | Cómo revertir o cambiar |
| --- | --- | --- |
| Contenido en JSON versionado (`data/content/`) con validador propio; sin CMS ni backend | El sitio es estático, el volumen es pequeño y el validador ya existía; un CMS añadiría infraestructura sin necesidad demostrada | Los contratos de `src/content/contract.js` pueden alimentarse desde otra herramienta que produzca los mismos JSON |
| El directorio de gestores vive en `managers.json`, separado de las 39 etiquetas del archivo | Las etiquetas no son identidades jurídicas confirmadas; mezclarlas fabricaría atribuciones | `archive_labels` declara equivalencias cuando la UGD las confirme |
| Las relaciones se toman solo de `assignments` por identificador | Evitar inferencias por nombre | — |
| Un vínculo departamental no se propaga a sus municipios | No hay definición institucional (pregunta 3) | Cambiar `linksForTerritory` cuando se defina |
| La ficha usa `?gestor=<id>#ficha-gestor` dentro de la misma página | Conserva la estructura de una página, enlaces compartibles y atrás/adelante; funciona bajo cualquier subdirectorio | — |
| El parámetro `gestor` también resalta sus territorios en mapa y tabla | Un solo estado compartible para «ver en el mapa» | — |
| Filtros retirados `manager` y `agreement`: se ignoran y se eliminan de la URL | Convenios fuera de alcance; las etiquetas no son gestores | — |
| Los convenios del corte no llegan al artefacto público: `siteArchive` (src/map/contract.js) deja `agreements_*` en `null`, `agreements` y `agreement_ids` vacíos y retira las observaciones sobre convenios de `dist/data/explorer/`; la descarga omite además esas claves | Fuera de alcance según PRODUCT.md; el archivo fuente conserva los campos por contrato y la administración experimental usa `publicArchive` sin cambios | Ajustar `siteArchive` |
| Solo `approved`, `published` y `outdated` llegan a `dist/`; la vista previa se construye en `work/` | Proyección en el build en vez de ocultar en la interfaz | `publishableStates` en `src/content/contract.js` |
| Ni la vista previa muestra fotografías sin autorización o con personas identificables sin consentimiento | Es una condición legal, no editorial | — |
| La inversión nacional se muestra en la sección Inversión; la departamental en el detalle del departamento; la de gestor en su ficha | No repartir montos agregados entre territorios | — |
| Sin totales calculados: solo `reported_total` si la fuente lo da | Evitar sumas de categorías posiblemente superpuestas | — |
| Niveles de atención I y II con rótulos provisionales `pending_verification` | El archivo 2024 usa «I»; el rótulo largo no está confirmado | Cambiar `label` y `status` en `categories.json` |
| Ejemplos sintéticos en `tests/fixtures/synthetic/` con marca `synthetic: true` | Probar todos los estados sin contaminar el contenido real; el build público falla si aparece la marca | — |

## 4. Limitaciones técnicas conocidas

- El directorio aparece en la sección Presencia territorial y la ficha se muestra encima del directorio; no hay una página independiente por gestor (decisión de mantener una página).
- Un gestor con más de 24 territorios en un grupo muestra la lista plegada; el filtro del directorio aparece a partir de 9 gestores.
- El validador de esquemas es un subconjunto de JSON Schema ([schema.mjs](../scripts/schema.mjs)).
- Las fotografías no se redimensionan automáticamente: deben cargarse ya optimizadas.
