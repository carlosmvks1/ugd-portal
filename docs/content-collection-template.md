# Plantilla de recolección de contenido

Para solicitar y registrar la información institucional antes de cargarla en `data/content/` ([guía](content-guide.md)). **O** = obligatorio para publicar; **op** = opcional (si falta, la vista lo omite sin dejar tarjetas vacías). Toda pieza necesita además: estado editorial, estado de verificación (cuando es un dato) y evidencia de autorización registrada fuera del repositorio.

No enviar por este medio datos de pacientes, contactos personales no autorizados, firmas ni documentos internos.

## Fuente (`sources.json`)

| Campo | | Descripción |
| --- | --- | --- |
| Identificador | O | Estable, p. ej. `informe-ugd-2025` |
| Título | O | Nombre del documento o registro |
| Emisor | O | Institución que lo emite |
| Fecha | op | `AAAA-MM-DD` |
| Período | op | Texto, p. ej. «Enero–diciembre 2025» |
| Enlace público | op | Solo si es público y autorizado |
| Nota | op | Limitaciones conocidas |

## Bloques institucionales (`institution.json`)

Secciones y bloques ya preparados: **La UGD** (presentación, funciones, estructura, autoridades, fundamento legal), **Descentralización** (Secretaría de Salud, gestores, servicios en el territorio, papel de la UGD), **Contacto** (dirección, teléfono, correo).

| Campo | | Descripción |
| --- | --- | --- |
| Texto | O* | Párrafos (bloques de tipo texto) |
| Elementos | O* | Funciones / estructura: título y descripción. Autoridades: nombre, cargo, unidad (op), desde (op). Normas: título, emisor, número (op), fecha (op), enlace (op), vigencia (`current`, `historical`, `unknown`). Canales: tipo (`address`, `phone`, `email`, `website`, `hours`, `other`), etiqueta, valor, nota (op) |
| Fuentes | op | Identificadores de fuente |
| Fecha de referencia | op | A qué fecha corresponde (p. ej. autoridades vigentes al…) |
| Nota | op | Aclaración visible |

\* Según el tipo de bloque. Para un nuevo bloque también: identificador, título y texto de marcador mientras está en preparación.

## Gestor (`managers.json → managers`)

«Gestor» es la **entidad gestora**, no una persona.

| Campo | | Descripción |
| --- | --- | --- |
| Identificador | O | Estable, p. ej. `gestor-asociacion-x` |
| Nombre | O | Nombre oficial completo |
| Fuentes | O | Al menos una fuente aprobada |
| Estado de verificación | O | `official_verified`, `official_unverified` o `pending_UGD` |
| Nombre corto o sigla | op | |
| Tipo de entidad | op | Clave de una categoría configurada (`categories.entity_types`) |
| Descripción | op | Qué es la entidad |
| Ámbito de trabajo | op | Qué servicios o nivel gestiona, en términos aprobados |
| Contacto institucional | op | Canales autorizados (tipo, etiqueta, valor) |
| Población reportada | op | Por registro: valor (o «sin dato»), período (inicio, fin), período territorial (op), nivel de atención (op), definición (op), fuente, verificación, nota (op) |
| Etiquetas históricas equivalentes | op | Solo si la UGD confirma la correspondencia con `label-0NN` del archivo 2024 |
| Nota | op | Advertencia visible (p. ej. identidad jurídica pendiente) |

## Vínculo gestor–territorio (`managers.json → assignments`)

Una fila por gestor × territorio × período × nivel.

| Campo | | Descripción |
| --- | --- | --- |
| Gestor | O | Identificador del gestor |
| Territorio | O | Código oficial (departamento `13` o municipio `1301`) |
| Período territorial | O | `snapshot_id` del archivo territorial (p. ej. `2024-v1`) |
| Fuente | O | Identificador de fuente |
| Estado de verificación | O | |
| Nivel de atención | op | `I`, `II` u otra clave configurada; vacío = no especificado |
| Nota | op | P. ej. «vínculo de alcance departamental» |

## Población por período (`population.json`)

| Campo | | Descripción |
| --- | --- | --- |
| Período territorial | O | `snapshot_id` |
| Definición | op | Clave de `categories.population_definitions` (p. ej. asignada, atendida, estimada) |
| Unidad | op | P. ej. «personas» |
| Nota | op | Limitaciones, superposiciones |

## Conjunto de inversión (`investment.json`)

| Campo | | Descripción |
| --- | --- | --- |
| Identificador y título | O | |
| Dimensión | O | `management_level` (nivel de gestión) o `care_level` (nivel de atención) |
| Período | O | Inicio y fin |
| Moneda | O | Código ISO 4217 (p. ej. `HNL`) |
| Tipo de monto | O | Clave de `categories.amount_types` (p. ej. presupuestado, transferido, ejecutado) |
| Definición | O | Qué incluye el monto |
| Fuentes | O | |
| Alcance | O | Nacional; un departamento (código) o un gestor (identificador) solo si la atribución consta en la fuente |
| Filas | O | Categoría (clave configurada) y monto, o «sin dato» con nota |
| Total reportado | op | Solo si la fuente lo reporta |
| Notas | op | |

## Fotografía (`photos.json` + archivo en `public/media/`)

| Campo | | Descripción |
| --- | --- | --- |
| Archivo | O | JPG, PNG o WebP; ancho y alto en píxeles |
| Descripción | O | Qué muestra y en qué contexto (visible) |
| Texto alternativo | O | Distinto de la descripción; describe la imagen para lectores de pantalla |
| Crédito | O | Autoría o institución |
| Autorización de uso | O | Concedida / pendiente / denegada, y alcance |
| Personas identificables | O | Ninguna / con consentimiento documentado / desconocido |
| Lugar | op | |
| Fecha | op | `AAAA-MM-DD` o texto («Marzo de 2025») |
| Territorios / gestores relacionados | op | Códigos e identificadores |
| Ubicación en el portal | op | Portada (`home`) y/o Trabajo de los equipos (`teams`) |

## Categorías (`categories.json`)

Para cada lista (tipos de entidad, niveles de atención, niveles de gestión, tipos de monto, definiciones de población): clave estable (O), nombre visible (O), descripción (op), estado editorial (O).
