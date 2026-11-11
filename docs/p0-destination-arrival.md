# PR 1 P0 — llegada después de la carga dinámica

## Causa comprobada

Base: `fd02347` (main). Reproducción local nueva, no reutilización de la evidencia histórica del encargo. Chromium, viewports 1280 × 720 y 390 × 844. Desde portada, seis de ocho casos fallan: La UGD, Descentralización y Documentos quedan entre 3386 y 5133 px por debajo del borde superior visible. Cobertura pasa en ambos tamaños.

El salto nativo ocurre con el HTML inicial. `renderInstitutional()` sustituye Documentos; `renderObservatory()` y la apertura de `#explorer` añaden altura antes de los destinos. `startExplorer()` lanzaba `map()` sin devolver su promesa; el mapa municipal y su contexto nacional podían seguir trabajando tras la inicialización general. Por tanto, esperar solamente al fragmento, a DOMContentLoaded o al antiguo `init()` no asegura la posición final.

## Mecanismo y alcance

- `src/navigation.js`: un coordinador por documento; una intención vigente con identidad de objeto. `layoutReady()` señala que terminó la inicialización (incluido su estado de error); `trackLayout()` registra fuentes y promesas de cartografía. Solo cuando no queda trabajo registrado se programa un único frame para medir el destino y posicionarlo.
- `src/main.js`: informa la terminación del renderizado institucional, del Observatorio, del arte territorial y del explorador. `src/map/explorer.js` devuelve y registra la promesa completa de `map()`, incluido `contextMap()`, en la primera carga, cambios territoriales, historial y reintentos.
- No hay observadores, sondeo ni correcciones continuas. Un límite de 20 segundos **cancela** una llegada; nunca es la señal que dispara el salto. Cada nueva navegación cancela el frame y temporizador anteriores. Las descargas compartidas pueden terminar y actualizar los datos, pero sus resoluciones no conservan un destino ni un foco antiguos.
- Rueda, movimiento táctil, teclado de desplazamiento y arrastre iniciado en la barra de desplazamiento cancelan la llegada pendiente. Un evento `scroll` solo guarda posición; no se interpreta como intención humana, porque también puede proceder del navegador, anclaje de contenido o código.
- Los listeners se instalan una sola vez por documento. El foco explícito utiliza `tabindex="-1"` y `preventScroll`; la alineación usa `behavior: 'instant'`, sin añadir animación y compatible con movimiento reducido. No se modifican estilos ni distribución.

## Navegación, foco e historial

Los enlaces dentro del documento conservan la consulta territorial y crean una entrada solo si cambia la URL. La normalización sustituye la entrada y conserva su identificador. La llegada y el foco no escriben en el historial. No se cambia el fragmento para provocar un salto.

Las posiciones se guardan en memoria por identificador de entrada, con un máximo de 100. Al salir del documento se conservan en `sessionStorage` para retornos entre portada y portal. Se controla la restauración mediante `history.scrollRestoration='manual'`: Atrás/Adelante restaura las coordenadas si existen; en caso contrario alinea el fragmento después de la carga. El evento `hashchange` ya atendido no inicia una segunda corrección.

Una marca efímera de `sessionStorage` transmite la activación explícita de un enlace hacia `portal.html` entre documentos. Se consume una vez, exige URL exacta, navegación nueva y antigüedad inferior a 20 segundos. URL directa, recarga y retornos no solicitan foco. Sin almacenamiento disponible, la alineación funciona; el foco desde portada y la restauración entre documentos se degradan al comportamiento de entrada/fallback.

En historial no se enfoca el encabezado. Si un elemento retenido queda oculto (por ejemplo en el menú), se usa el botón visible de navegación con `preventScroll`. Un nodo retirado vuelve al foco del documento por comportamiento del navegador. La ficha territorial superpuesta sigue fuera de alcance.

El único cambio en `src/observatory/view.js` conserva `history.state` al reemplazar la URL. Evita perder el identificador de entrada; no cambia cálculos, selección, contenido ni comportamiento del comparador.

## Verificación

El índice [antes](evidence/p0-arrival/before/index.md) contiene ocho capturas en la base. El índice [después](evidence/p0-arrival/after/index.md) contiene cada URL, tamaño, destino, recorrido, resultado y posición del encabezado frente al encabezado fijo. Los JSON adyacentes permiten revisar las métricas sin redondear y el foco.

- **40 casos básicos: pasa.** Cuatro destinos × dos tamaños × portada, URL directa, recarga normalizada, Atrás y Adelante.
- **40 comprobaciones adicionales: pasa.** Secuencia de secciones en ambos sentidos; repetición sin entradas duplicadas comprobada por los retornos y las URLs; selección territorial activa y enlace compartido con regreso y avance; cargas retenidas; navegación rápida; teclado/menú y movimiento reducido.
- Las cargas controladas retienen `archive.json`, `departamentos.geojson` o `municipios-13.geojson`. La respuesta solo se libera después de la interacción. Después de completarla se comprueban URL, foco y posición; en cancelación se comprueba además que no se haya llamado a `scrollTo`, distinguiéndolo del desplazamiento/anclaje nativo. El registro incluye el recurso y las coordenadas/foco anteriores a liberarlo.
- `scripts/arrival-check.mjs` usa resultados observables y se ejecuta desde `npm run test:browser`. No basta con que el destino exista o que la URL cambie. La base falla las comprobaciones de posición en seis de las ocho capturas desde portada; también carece del foco explícito requerido.
- Revisión manual mediante navegador integrado: cuatro destinos en escritorio; La UGD desde portada móvil; menú móvil, activación con Enter hacia Descentralización, cierre y encabezado enfocado; Documentos y Cobertura móviles. Encabezados e inicio de contenido visibles. La vista móvil es **viewport emulado**, no dispositivo físico.

Resultados locales (Windows, Node 24.22.1, Chromium de Playwright 1.64.1):

| Comprobación | Resultado |
|---|---|
| `npm test` | 39 pasa, 1 falla por entorno: `EPERM` al crear el enlace simbólico de `tests/admin.test.mjs:103`. No se altera ni omite la prueba. |
| `npm run validate` | pasa, invariantes de datos conservadas |
| `npm run build` | pasa |
| `npm run test:browser` | pasa, suite previa más 80 comprobaciones de llegada |
| `git diff --check` | pasa |

La primera ejecución en sandbox también bloqueó conexiones localhost y una descarga de navegador. Se repitieron fuera del sandbox: conexiones y descargas pasan; el privilegio de enlaces simbólicos sigue ausente en Windows. Los resultados de CI Linux se reportan por separado en el PR, con enlace a la ejecución; no se deducen de estas pruebas locales.

## Limitaciones, riesgos y reversión

- Falla conocida fuera de alcance: la ficha territorial móvil permanece superpuesta al salir de Cobertura con selección activa. Las capturas `selection-forward` y `shared-forward` la muestran. Los resultados de esas regresiones describen conservación de selección, URL e historial, no una corrección del ciclo de vida de la ficha.
- Pendiente: dispositivo móvil físico y otros motores (Firefox/WebKit). Esta ejecución verifica Chromium y navegador integrado.
- Cargas de más de 20 segundos dejan de corregirse automáticamente. Una nueva activación del destino inicia otra intención. Si se añaden nuevos productores asíncronos de altura, deben registrar su promesa; no se intenta detectar cualquier mutación futura.
- La caché de posiciones conserva las 100 entradas más recientes del documento. Sin una posición disponible, se alinea el destino. No se persisten datos territoriales nuevos ni información personal.
- Revertir el commit del PR restaura la navegación anterior; no requiere migraciones de datos, configuración ni despliegue. El pequeño estado de sesión sobrante no es usado por la versión anterior.

No se fusiona ni despliega. El siguiente PR sigue pendiente de decisión posterior.
