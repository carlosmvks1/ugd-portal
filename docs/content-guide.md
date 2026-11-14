# Guía para incorporar contenido

Cómo incorporar, validar, previsualizar y actualizar el contenido institucional del portal **sin modificar componentes** (`index.html`, `src/`). Plantilla de recolección: [content-collection-template.md](content-collection-template.md). Pendientes institucionales y dónde se cargan: [content-pending.md](content-pending.md). Reglas de procedencia y estados: [gobernanza de contenidos](content-governance.md).

## 1. Dónde vive cada contenido

| Archivo | Contenido | Se muestra en |
| --- | --- | --- |
| `data/content/institution.json` | Presentación, funciones, estructura, autoridades, fundamento legal; pasos de la descentralización; canales de contacto | La UGD · Descentralización · Contacto |
| `data/content/managers.json` | Directorio de gestores (`managers`) y vínculos gestor–territorio (`assignments`) | Directorio y fichas (`?gestor=<id>#ficha-gestor`), detalle territorial, filtro «Gestor» del mapa, tabla |
| `data/content/population.json` | Definición y unidad de la población por período territorial | Detalle territorial (métrica «Población») |
| `data/content/investment.json` | Conjuntos de inversión por nivel de gestión o de atención, de alcance nacional, departamental o de un gestor | Inversión · detalle de un departamento · ficha del gestor |
| `data/content/photos.json` + `public/media/` | Fotografías con descripción, texto alternativo, crédito, autorización y contexto | Portada · Trabajo de los equipos · detalle territorial · ficha del gestor |
| `data/content/categories.json` | Categorías institucionales: tipos de entidad, niveles de atención, niveles de gestión, tipos de monto, definiciones de población | Etiquetas en todas las vistas |
| `data/content/sources.json` | Fuentes citadas por el contenido (no es un repositorio documental) | Línea «Fuente:» junto a cada pieza |

La población por territorio sigue viniendo del archivo territorial (`data/explorer/archive.json`, ver [explorador](territorial-explorer.md)); `population.json` solo documenta su definición. La población **de un gestor** se registra en su ficha (`managers[].population`) tal como la reporta la fuente: el portal nunca la calcula sumando territorios.

Los contratos (campos admitidos y obligatorios) están en [src/content/contract.js](../src/content/contract.js); las reglas entre archivos, en `contentErrors` de [src/content/model.js](../src/content/model.js).

## 2. Estados editoriales

Cada pieza (bloque, gestor, vínculo, conjunto, fotografía, fuente, categoría) lleva `status`:

`proposed` · `collecting` · `pending_verification` · `verified` · `approved` · `published` · `outdated` · `withdrawn`

- Solo `approved`, `published` y `outdated` llegan al artefacto público (`dist/`). El resto se retira en el build; los bloques institucionales pendientes conservan solo su título y el rótulo «En preparación».
- `outdated` se publica con el aviso «Información desactualizada».
- `verification_status` (`official_verified`, `official_unverified`, `pending_UGD`) es el estado **del dato**; no autoriza publicar.
- Una fotografía requiere además `authorization.status: "granted"` e `identifiable_people` `none` o `consented`. Sin eso no se publica ni aparece en la vista previa.

## 3. Procedimiento

1. **Recopilar** con la [plantilla](content-collection-template.md). Revisar autorización y privacidad fuera del repositorio: es público y conserva el historial.
2. **Editar** el JSON correspondiente en una rama. Identificadores estables (letras, números, `-` o `_`; se recomiendan minúsculas), nunca derivados del nombre. Fechas `AAAA-MM-DD`. `null` significa «sin dato»; `0` solo si la fuente reporta cero.
3. **Fotografías**: copiar el archivo a `public/media/<carpeta>/<nombre>.jpg|png|webp` (minúsculas) y registrar `src: "media/<carpeta>/<nombre>.jpg"` con `width` y `height` reales.
4. **Validar**:
   ```bash
   npm run validate:content
   ```
   ```bash
   npm run validate
   ```
   Los mensajes indican archivo, pieza y campo (p. ej. `managers.assignments[3]: territorio desconocido 9999`).
5. **Previsualizar** con las piezas no aprobadas rotuladas «Vista previa · … · no se publica»:
   ```bash
   npm run preview:content
   ```
   Abrir http://127.0.0.1:4173. La vista previa se construye en `work/preview/` y nunca en `dist/`.
6. **Construir el artefacto público** (solo contenido aprobado) y revisarlo:
   ```bash
   npm run build
   ```
   ```bash
   npm run preview
   ```
7. **Comprobar** antes del PR: `npm test`, `npm run test:browser`. Registrar en el PR la evidencia de autorización (sin exponer datos personales ni comunicaciones internas).

## 4. Recorridos frecuentes

**Agregar un gestor y vincularlo a un territorio.**
1. En `sources.json`, registrar la fuente (`status: "approved"` cuando esté autorizada).
2. En `managers.json → managers`, agregar `manager_id`, `name`, `status`, `verification_status` y `source_ids`. Opcionales: `short_name`, `entity_type` (clave de `categories.entity_types`), `description`, `scope`, `contact`, `population`, `archive_labels`, `note`.
3. En `managers.json → assignments`, agregar un vínculo por territorio, período y nivel: `manager_id`, `territory_id` (código oficial del archivo territorial, departamento o municipio), `snapshot_id`, `care_level` (opcional), `status`, `verification_status`, `source_id`.
4. Validar y previsualizar: el gestor aparece en el directorio, en el detalle del territorio («Gestores vinculados»), en el filtro «Gestor» del mapa y en la tabla. Su ficha enlaza al mapa.

**Equivalencia con una etiqueta histórica.** Si la UGD confirma que una de las 39 etiquetas del archivo 2024 corresponde a un gestor, declararlo en `archive_labels: ["label-0NN"]`. Solo produce el aviso de equivalencia; los vínculos territoriales siguen requiriendo `assignments`.

**Agregar inversión.** Configurar primero las categorías (`management_levels` o `care_levels`) y el tipo de monto (`amount_types`) en `categories.json`. Luego un conjunto en `investment.json` con `dimension`, `period`, `currency` (ISO 4217), `amount_type`, `definition`, `source_ids`, `scope` (`national`, `department` con código, o `manager` con identificador) y `rows`. `reported_total` solo si la fuente lo reporta: el portal no suma categorías ni reparte montos entre territorios.

**Nuevo período territorial.** Seguir [territorial-explorer.md](territorial-explorer.md) para incorporar el corte; después agregar en `population.json` su definición y, en `managers.json`, los vínculos con el nuevo `snapshot_id`. Los vínculos de períodos distintos nunca se combinan.

## 5. Actualizar, corregir y retirar

- Corrección: editar la pieza; si cambia su significado, volver a `pending_verification` hasta nueva autorización.
- Pérdida de vigencia: `status: "outdated"` (se muestra con aviso) o `withdrawn` (se retira del artefacto).
- Retirar no borra el historial de Git; ante exposición sensible seguir [gobernanza §7](content-governance.md).

## 6. Ejemplos sintéticos y demostración

`tests/fixtures/synthetic/` contiene ejemplos **ficticios** rotulados «[SINTÉTICO]» (nombres largos, varios gestores por territorio, un período ficticio 2025, datos parciales, 36 gestores, fotografías de prueba). No forman parte del contenido: `data/content` los rechaza y el build público falla si encuentra la marca.

- `npm run preview:synthetic`: genera y sirve una vista previa con esos ejemplos en `work/synthetic-preview/`.
- `npm run test:content-walkthrough`: en una copia temporal, agrega un gestor → lo vincula a Gracias (1301) → lo ve en el mapa → abre su ficha → agrega población y una fotografía, y comprueba que `src/` e `index.html` no cambiaron. También se ejecuta dentro de `npm run test:browser`.
