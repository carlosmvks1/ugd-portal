# Explorador territorial: actualización y migración

## Evidencia recuperada

Se recuperó el artefacto anterior `ugd/dist`, generado el 29 de octubre de 2026. Se conserva su archivo anual 2024 sin reinterpretar las cifras como datos actuales. La Memoria SESAL 2024, páginas impresas 90–93, respalda los registros; no existe fecha exacta de cierre territorial ni fecha de publicación confirmada. Ambas permanecen nulas. Las fuentes originales, páginas, códigos, etiquetas originales de gestores, equivalencias y observaciones están en `data/explorer/archive.json`.

El catálogo registra este archivo mediante `explorer`. Los snapshots contractuales del contrato 1.0.0 permanecen separados: ese contrato exige fechas y contratos individuales que esta evidencia no proporciona. No se crean fechas o contratos ficticios para hacerlo encajar. `scripts/validate-explorer.mjs` valida el archivo territorial, sus relaciones, estados, referencias y duplicados; el validador y build existentes lo ejecutan. La migración es aditiva al catálogo original.

El archivo contiene 18 departamentos, 298 municipios, 93 registros municipales reportados y 205 sin dato. Los agregados departamentales son una tabla independiente. La discrepancia 89/93, las diferencias por sexo, las equivalencias provisionales y las limitaciones cartográficas permanecen en `data_quality_issues`, también publicado como JSON separado y verificado contra el archivo. Una ausencia de registro no equivale a cero.

## Contrato público y versiones

`src/map/contract.js` define el contrato territorial estricto: campos permitidos y obligatorios, fechas de calendario, enteros no negativos, estados de cobertura/verificación y estructura de gestores/convenios. El validador rechaza campos inesperados también dentro de objetos anidados. Los registros explícitos requieren página de fuente; las ausencias históricas pueden omitir metadatos de transcripción. Se comprueban las relaciones de territorio, fuente, período, nivel y gestor de los convenios. Añadir un campo o estado requiere revisar este contrato y su publicabilidad; no introducir datos internos en campos de texto permitidos.

El build proyecta el archivo sobre ese mismo contrato antes de escribir los JSON públicos. CSV y JSON de descarga también seleccionan únicamente campos permitidos, incluidos los metadatos de período, fuente y calidad. Esta defensa no sustituye la aprobación humana del contenido de los campos admitidos.

Portada y explorador usan `latestSnapshot` de `src/map/snapshots.js`. El orden descendente es año, fin de período, `revision` numérica opcional, fecha de publicación, fecha de importación e identificador con comparación numérica (v10 sucede a v9). Para nuevos cortes del mismo período se recomienda declarar una `revision` entera positiva consistente en todas sus versiones. Un enlace con versión explícita válida la conserva; un año sin evidencia nunca cae al histórico. El orden físico del array no selecciona el período.

La portada, el estado de consulta y la ficha muestran el estado provisional/aprobado/archivado y la verificación según sus metadatos. La nota del KPI explica las dos cifras 89/93 sin reemplazar ninguna.

## Geografía y carga

`geography/departamentos.geojson` y `municipios-XX.geojson` contienen exclusivamente geometría e identificadores geográficos. Los códigos se mantienen como texto; `territorio_id` enlaza con `official_code`. La cartografía recuperada es SINIT/SEPLAN distribuida por HDX, con validez histórica declarada 2016-10-05 y licencia CC BY-IGO. No certifica límites vigentes. La simplificación heredada no garantiza topología catastral.

La primera vista solicita solo departamentos. Cada departamento carga su GeoJSON municipal al entrar y lo conserva en memoria. Un contador de generación evita que una respuesta tardía sobrescriba la selección posterior. Al iniciar una carga se eliminan la geometría anterior, sus eventos y el mapa de contexto; si falla, permanecen vacíos hasta reintentar, sin bloquear la tabla.

Para repetir la recuperación, desde la raíz:

```sh
node scripts/migrate-territorial.mjs /ruta/al/artefacto/ugd/dist
npm test
npm run validate
npm run build
```

Este importador es exclusivo del artefacto histórico. No usarlo para un consolidado nuevo ni para sobrescribir una revisión aprobada. Los ficheros originales del entorno anterior no son dependencia de ejecución.

## Añadir un período

1. Conservar el archivo recibido y registrar hash, emisor, permiso de publicación, fecha efectiva, páginas/hojas y responsable. Revisar que solo contenga información territorial publicable.
2. Crear una versión nueva en `snapshots` del archivo territorial; no sobrescribir la anterior. Declarar año, período, corte exacto nullable, publicación nullable, estado y fuente. Un reporte anual no acredita un día exacto de cierre.
3. Añadir cobertura con clave única versión + código municipal + nivel. Población desconocida: `null`; ausencia documental: `unknown`; ausencia explícita de cobertura: `not_covered`. `reported` significa presencia en la fuente. `official_unverified` conserva el estado pendiente; solo evidencia de validación permite `official_verified`.
4. Registrar agregados en `departments` sin distribuirlos entre municipios. Las capas de proporción solo usan el agregado publicado sin filtros de entidades/nivel; los filtros eliminan ese agregado porque no acredita ese subconjunto. La población solo se muestra para un registro municipal no superpuesto; no se suman niveles o convenios.
5. Los gestores confirmados y sus vínculos con territorios se registran en `data/content/managers.json` (`managers` y `assignments`, por período y nivel), no en el archivo territorial ([guía](content-guide.md)). Las etiquetas transcritas del archivo no constituyen gestores confirmados. El contrato territorial conserva los campos de convenios por compatibilidad, pero los convenios están fuera de alcance y no se muestran ni se exportan.
6. Registrar discrepancias en `data_quality_issues` con ID estable, fuente, estado, severidad, detalle y territorio/página cuando corresponda. Sincronizar el JSON separado. Resolver únicamente con evidencia; conservar la explicación. Añadir comprobaciones específicas para nuevas reglas.
7. Ejecutar las pruebas, validación y build; revisar desktop, móvil, teclado y descargas. Obtener validación institucional antes de marcar un período como verificado o publicar.

Los filtros se derivan de registros y relaciones disponibles. Los filtros sin datos permanecen deshabilitados. Un enlace que solicita un año ausente muestra “sin datos” y no reutiliza 2024. Parámetros inválidos se normalizan; los enlaces preservan territorio, año, versión, filtros y capa. La navegación atrás/adelante restaura la consulta.

## Interacciones y exportación

Hover de ratón y foco muestran un tooltip anclado al territorio, sin seguimiento del cursor. Click, Enter o espacio seleccionan; las flechas recorren las geometrías. Escape sube un nivel. Breadcrumbs y “Volver a Honduras” permiten salir. La búsqueda admite nombres sin acentos y códigos; los resultados, la tabla y los enlaces municipales del panel actualizan el mismo estado.

La ficha es lateral en escritorio y un panel inferior persistente, ampliable por botón, en móvil. Las animaciones son mínimas y se eliminan con preferencia de movimiento reducido. La tabla conserva todos los territorios visibles incluso cuando no tienen dato.

CSV y JSON descargan los registros municipales explícitos del territorio, versión y filtros activos. Los botones se deshabilitan si no existen registros suficientes. Son exportaciones municipales: no sustituyen los agregados departamentales publicados. Cada fila conserva fuente, página, nivel, alcance y verificación; JSON incorpora período, fuentes y observaciones. CSV escapa celdas y protege fórmulas. Una población nula se exporta vacía, nunca como cero.

## Verificación y despliegue

`npm test`: contratos originales, relaciones del archivo, estados, períodos, filtros, enlaces, exportaciones, geometría y ausencia de doble suma. `npm run validate` y `npm run build`: validación previa a cualquier artefacto.

La comprobación adicional de navegador está en `scripts/browser-check.mjs`; requiere Playwright disponible en el entorno, sin añadirlo al frontend. Ejecutar con `PLAYWRIGHT_MODULE` apuntando al módulo y, opcionalmente, `CHROME_PATH` al navegador. Sirve los ficheros compilados por interceptación local de peticiones para verificar el artefacto sin servicios externos.

Se conserva el alojamiento relativo mediante config.json; no hay teselas, claves, CDN ni dependencia cartográfica externa. El build copia únicamente el archivo registrado, calidad y GeoJSON. La rama/PR no publica ni cambia la visibilidad del repositorio.
