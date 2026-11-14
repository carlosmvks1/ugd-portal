# Arquitectura e ingeniería del portal UGD

## 1. Alcance y evidencia

Arquitectura observada en main tras el PR #15, commit `a2156c2129f1aeff2a5e2080334d884a09c273be`. Auditoría de archivos, no certificación de seguridad ni ejecución de pruebas de aplicación.

[AGENTS.md](../AGENTS.md) establece el flujo de trabajo; [PRODUCT.md](PRODUCT.md), el alcance y las hipótesis; [sistema visual](visual-system.md), las reglas de interfaz y accesibilidad. El encargo es un portal institucional público con dominio propio. Funcionalidades específicas requieren validación; la administración privada, la biblioteca documental, los convenios y el observatorio están fuera de alcance aunque su código siga descrito aquí.

Este documento separa **implementado**, **reglas obligatorias**, **mejoras propuestas** y **decisiones pendientes**. Ninguna propuesta autoriza refactorizar, migrar, eliminar módulos o desplegar.

## 2. Arquitectura realmente implementada

### Stack y organización

| Área | Implementación y evidencia |
| --- | --- |
| Frontend | HTML, CSS y módulos ES nativos; entrada [index.html](../index.html), coordinación [main.js](../src/main.js), estilos [styles.css](../src/styles.css) y navegación [ui.js](../src/ui.js). |
| Herramientas | [package.json](../package.json): Node >=22.13, `type: module`, scripts propios; Playwright 1.64.1 como dependencia de desarrollo. No declara dependencias de producción. [lockfile](../package-lock.json) para instalación reproducible. |
| Presentación | [home.js](../src/home.js), [institutional.js](../src/institutional.js), [territorial-art.js](../src/territorial-art.js) y [observatorio](../src/observatory/view.js). El contenido institucional se genera en JavaScript. |
| Territorio | [explorer.js](../src/map/explorer.js) coordina DOM, eventos, estado, solicitudes y descargas; [model.js](../src/map/model.js), [geometry.js](../src/map/geometry.js), [snapshots.js](../src/map/snapshots.js) y [contract.js](../src/map/contract.js) separan responsabilidades específicas. |
| Datos | [catálogo](../data/catalog.json), esquemas en [data/schemas](../data/schemas), archivo territorial en [data/explorer](../data/explorer), cortes registrados y GeoJSON en [geography](../geography). No son un CMS. |
| Herramientas y pruebas | [scripts](../scripts) contiene validación, empaquetado, servidores y comprobaciones de navegador; [tests](../tests) contiene pruebas Node. |
| Experimento interno | [admin](../admin), [servidor](../scripts/admin-server.mjs) y [almacenamiento](../scripts/admin-store.mjs): sistema separado con usuarios, sesiones, roles y SQLite mediante `node:sqlite`. Su existencia no exige backend para el portal público. |

El stack reduce capas de compilación y permite alojamiento estático. Sus límites actuales son coordinación manual del DOM, contenido mezclado con plantillas JavaScript y crecimiento de módulos de interacción. No hay evidencia en esta auditoría que justifique sustituirlo por un framework.

### Carga y acoplamiento

[main.js](../src/main.js) inicializa navegación, carga configuración, catálogo y archivo indicado por `catalog.explorer`. Solo después llama a portada, contenido institucional y observatorio; inicia arte territorial y explorador mediante `Promise.all`. La ausencia del archivo produce retorno temprano; un error llega a un manejador general con reintento.

El contenido institucional editable vive en `data/content/*.json` con contrato en [src/content/contract.js](../src/content/contract.js), reglas entre archivos y consultas en [model.js](../src/content/model.js) y vistas en `src/content/*-view.js` (ver [guía](content-guide.md)). [main.js](../src/main.js) lo carga primero e independientemente del archivo territorial: un fallo de uno no impide mostrar el otro, y un archivo de contenido que falla solo afecta a su sección. Las fichas de gestor (`?gestor=<id>#ficha-gestor`) y el resaltado en el mapa comparten el parámetro `gestor`; los vínculos gestor–territorio se toman únicamente de `managers.json → assignments`. [institutional.js](../src/institutional.js) solo muestra las 39 etiquetas históricas del archivo, sin tratarlas como identidades confirmadas. La biblioteca y los convenios se retiraron del sitio público.

El [explorador](../src/map/explorer.js) conserva estado en URL, carga geometría municipal por departamento, utiliza caché de promesas y un contador de generación para descartar respuestas obsoletas. Si falla la geometría, deja disponible la tabla y permite reintento. Esa tolerancia no resuelve el fallo previo del archivo común.

### Contratos y actualización

- [validate.mjs](../scripts/validate.mjs) valida catálogo, cortes, relaciones y consistencia de observaciones territoriales. El [validador de esquemas](../scripts/schema.mjs) es propio; no asumir soporte completo de JSON Schema.
- Hay dos contratos distintos: cortes generales de [data-model.md](data-model.md) y archivo `territorial-1` definido en [contract.js](../src/map/contract.js), con validación en [validate-explorer.mjs](../scripts/validate-explorer.mjs). No fabricar registros para adaptar el histórico al contrato general.
- El contrato territorial rechaza propiedades desconocidas; `publicArchive` proyecta campos permitidos para build y descargas. Es proyección, no aprobación editorial ni validación completa de una respuesta arbitraria.
- Fuentes, períodos, verificación y observaciones acompañan los datos. El proceso documentado de cortes exige revisión, incorporación al catálogo, validación y revisión del artefacto; no prueba por sí mismo que cada dato haya sido aprobado.
- La administración experimental prepara paquetes mediante su almacén; esto no implica despliegue ni elección de ese sistema como flujo editorial del portal.

### Build, configuración y despliegue

[build.mjs](../scripts/build.mjs) valida primero, recrea `dist/` y:

1. Copia `index.html` y `portal.html` (redirección de enlaces antiguos).
2. Copia recursivamente `src/`, excluyendo archivos `.md` y `src/observatory/`.
3. Copia `public/` a la raíz de salida salvo `public/media/`; de ahí copia solo las fotografías publicables.
4. Escribe `data/content/*.json` con la proyección pública (solo piezas `approved`, `published` u `outdated`).
5. Copia catálogo y cortes registrados; genera el archivo territorial público y sus observaciones mediante proyección.
6. Copia los `.geojson` de geography tras comprobar FeatureCollection e identificador territorial.
7. Crea `.nojekyll` y, si la salida es `dist/`, falla ante rutas internas (`admin`, `observatory`, `work`, `tests`) o marcas de contenido sintético.

Con `--preview`, `--content`, `--media` o `--archive-extra` la salida debe estar dentro de `work/` y nunca puede ser `dist/`.

No copia por esas rutas admin, scripts, tests o docs. **No es una lista exhaustiva de archivos autorizados:** nuevos archivos en src o public pueden entrar automáticamente. La comprobación GeoJSON no acredita topología, límites oficiales ni vigencia.

[config.js](../src/config.js) carga `config.json` relativo a la aplicación y restringe rutas locales/origen; [public/config.json](../public/config.json) contiene configuración publicable, nunca secretos. La portabilidad contempla subdirectorios; el artefacto no selecciona proveedor ni configura el dominio propio.

| Workflow | Eventos y efecto |
| --- | --- |
| [ci.yml](../.github/workflows/ci.yml) | `push`, `pull_request`, `workflow_dispatch`: instalación, pruebas, validación, build, Chromium, navegador público y administrativo; carga artefactos dist y capturas. No despliega. |
| [pages.yml](../.github/workflows/pages.yml) | Solo `workflow_dispatch`; build, pruebas y artefacto Pages. El job deploy exige `refs/heads/main`, usa entorno github-pages y permisos pages/id-token. Puede configurar Pages como fuente Actions. Fusionar no lo dispara. |

El workflow permite publicar en Pages con autorización, pero no decide el alojamiento definitivo. Dominio propio confirmado; nombre, DNS, proveedor y operación pendientes.

## 3. Contradicciones, limitaciones y riesgos

| Hallazgo | Evidencia y consecuencia |
| --- | --- |
| “Sin dependencias externas” era demasiado amplio | package.json incluye Playwright para desarrollo; distinguir dependencias del navegador de herramientas. |
| “Node 22+” era impreciso | package.json exige >=22.13. |
| “No hay autenticación ni backend” no describe el repositorio | admin-store y admin-server contienen sistema interno; el portal generado sigue siendo estático. |
| “Lista explícita de archivos” sobreestimaba aislamiento | build copia src/public recursivamente. Revisar cada incorporación y el artefacto completo. |
| Contenido institucional depende del territorio | main retorna si falta explorer; institutional consume su estructura. Riesgo de indisponibilidad y dificultad editorial, contrario al objetivo de contenido esencial independiente. |
| Biblioteca no es inventario institucional completo | institutionalRecords deriva documentos de sources y usa una clasificación heurística. No garantiza categorías, vigencia ni versiones oficiales. |
| Acoplamiento de interacción y presentación | explorer reúne eventos, DOM, carga y render; institutional mezcla contenido y plantillas. Riesgo de cambios transversales y errores de reintento; no afirma un defecto explotado. |
| Protección estructural insuficiente para privacidad | contract permite textos; un campo permitido puede contener información sensible. Esquema/proyección no sustituyen revisión humana. |
| Pruebas fijan decisiones del prototipo | browser-check exige cifras históricas, firma cartográfica y conteos de nodos. Protegen la versión actual, pero no convierten ese diseño en requisito futuro. |
| Cobertura de accesibilidad/compatibilidad limitada | browser-check usa Chromium, algunos recorridos de teclado y un ancho móvil; no demuestra WCAG AA ni compatibilidad universal. |

La ausencia de publicación automática se conserva como hecho vigente. No se atribuye carácter privado al sitio por la privacidad del código; todo recurso servido o incluido en un artefacto descargable debe tratarse como expuesto.

## 4. Principios técnicos obligatorios

### Modularidad y errores

- Mantener el stack mientras cubra necesidades comprobadas. Separar transformación/validación de datos, acceso a recursos y presentación; evitar dependencias de modelos puros hacia DOM.
- Seguir convenciones locales: módulos .js en src, herramientas .mjs, pruebas .test.mjs; nombres que expresen responsabilidad. No introducir una renombración masiva.
- Reutilizar funciones cuando exista comportamiento común real; no crear capas genéricas para casos hipotéticos. Dependencias explícitas, sin estado global oculto ni ciclos nuevos.
- Gestionar fallos por recurso: mensaje útil, alternativa y reintento cuando corresponda. No ocultar errores con valores cero o éxito ficticio; impedir respuestas obsoletas y duplicación de listeners al reintentar.
- Cambios de contratos requieren consumidores identificados, compatibilidad/migración documentada y pruebas. Mantener IDs estables, períodos y trazabilidad.

### Contenido y seguridad

- Todo recurso de src/public, datos exportados y artefactos de CI requiere revisión de publicación; nunca credenciales, información de pacientes o documentos internos. `.gitignore` no es barrera de publicación.
- Mantener el experimento administrativo fuera del artefacto y del flujo público. No ampliar, integrar ni eliminar ese sistema sin un encargo separado.
- Tratar contenido y URL como entradas no confiables. Preferir APIs de texto; si se generan plantillas HTML, escapar según contexto y restringir protocolos/destinos. Las funciones de escape y safeUrl existentes en institutional/explorer son defensas locales, no prueba de ausencia de XSS.
- Validar en las fronteras de entrada y antes de publicar. No introducir HTML arbitrario desde fuentes ni secretos en configuración del navegador.
- Revisar nuevas dependencias, lockfile, procedencia, mantenimiento, licencia y vulnerabilidades; instalar reproduciblemente. Los workflows usan `npm ci --no-audit`: CI exitoso no equivale a auditoría de dependencias.
- Privilegios mínimos para automatizaciones; cambios de permisos, publicación y hosting requieren revisión explícita. Definir HTTPS y cabeceras de seguridad con el alojamiento seleccionado, sin afirmar que ya estén configurados.

### Rendimiento y crecimiento

- Mantener contenido esencial independiente de visualizaciones opcionales como criterio de futuras implementaciones; el acoplamiento actual está registrado como deuda, no como cumplimiento.
- Conservar carga municipal bajo demanda, caché y rutas portables cuando correspondan. Medir antes de añadir índices, servicios, bundlers o infraestructura.
- Evaluar peso, solicitudes, respuesta y estabilidad con condiciones registradas conforme al sistema visual. No deducir capacidad o necesidad de base de datos solo del número de módulos.

## 5. Calidad y pruebas

### Existentes, comprobadas por lectura

| Tipo | Evidencia |
| --- | --- |
| Unitarias/contratos | [contracts.test.mjs](../tests/contracts.test.mjs), [explorer.test.mjs](../tests/explorer.test.mjs), [institutional.test.mjs](../tests/institutional.test.mjs), [observatory.test.mjs](../tests/observatory.test.mjs); ejecutadas por `node --test`. |
| Integración de publicación | [audit.test.mjs](../tests/audit.test.mjs): campos inesperados, proyección, fechas/relaciones y build en copia temporal. |
| Navegador público | [browser-check.mjs](../scripts/browser-check.mjs): dist bajo prefijo /ugd/, solicitudes interceptadas, navegación territorial, URLs, descargas, datos ausentes, fallos de geometría, teclado y móvil. No prueba un proveedor real. |
| Experimento interno | [admin.test.mjs](../tests/admin.test.mjs) y [admin-browser-check.mjs](../scripts/admin-browser-check.mjs), conservados en CI; no amplían el alcance del producto. |

### Reglas para modificaciones futuras

Aplicar comandos pertinentes de AGENTS.md; probar comportamiento observable y regresiones, no replicar la implementación. Un fallo corregido requiere un caso que reproduzca el problema cuando sea razonable. No alterar datos para satisfacer expectativas antiguas.

Revisar diff, contratos, sensibilidad del artefacto, errores y compatibilidad de rutas en cada PR. Registrar pruebas ejecutadas, condiciones, resultados y límites; separar resultado local de CI. Cambios documentales solo requieren exactitud, enlaces y alcance.

**Cobertura por incorporar o ampliar cuando se implemente la mejora:** fallo de configuración/catálogo/archivo sin perder contenido institucional, reintento idempotente, biblioteca independiente, inventario de salida contra archivos imprevistos, entradas maliciosas por contexto y pruebas con otros navegadores. Añadir revisión manual de lector de pantalla, foco, zoom y contraste según el sistema visual. No declarar estas pruebas existentes ni conformidad AA.

## 6. Mejoras propuestas, sin implementación

1. **Prioridad alta:** desacoplar carga y contenido institucional del archivo territorial; definir primero contenido mínimo, contrato editorial y comportamiento ante fallos. Evitar introducir un backend para lograr esa separación.
2. **Prioridad alta:** reforzar comprobación del inventario público del build, manteniendo proyección y revisión humana; evaluar una lista de recursos permitidos frente al costo de mantenerla.
3. **Según cambios reales:** extraer responsabilidades de módulos grandes y utilidades compartidas de escape/URLs/normalización con pruebas de regresión. No realizar una reorganización completa preventiva.
4. **Antes de aceptar un rediseño:** distinguir pruebas de invariantes de datos de expectativas visuales antiguas y actualizar solo estas últimas según decisiones aprobadas.
5. **Según necesidades editoriales:** comparar edición versionada en archivos, generación estática y CMS. Primero investigar quién edita, frecuencia, volumen, revisión, archivos, permisos, recuperación y costo operativo. No elegir CMS ni base de datos en esta fase.

## 7. Decisiones pendientes y aceptación de cambios de stack

Pendientes: responsables y flujo editorial; contrato institucional independiente; funcionalidad validada; proveedor, dominio/DNS, HTTPS y cabeceras; presupuestos de rendimiento y matriz de navegadores. El mantenimiento externo no constituye un compromiso institucional.

Toda tecnología adicional requiere un registro en PR con:

- Problema y evidencia, vinculado al alcance de PRODUCT.md.
- Alternativa con el stack actual y opción más simple.
- Beneficio medible frente a costos de carga, mantenimiento, seguridad y operación.
- Efectos en datos, accesibilidad, portabilidad, build, pruebas y recuperación.
- Plan acotado de adopción, validación y reversión; aprobación del cambio antes de migrar.

La popularidad no justifica React, Next.js, TypeScript, CMS o bases de datos. Escalar cuando una limitación medida lo requiera, preservando contratos y decisiones de producto.

Este documento conserva simplicidad, portabilidad, validación, trazabilidad y separación de recursos. Sustituye las afirmaciones imprecisas identificadas arriba. Las descripciones históricas de arquitectura en AGENTS.md y README quedan para reconciliación posterior; esta fase modifica solo este archivo.
