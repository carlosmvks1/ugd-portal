# Sistema visual UGD

## Dirección

El portal adopta una estética de **atlas institucional de gestión sanitaria**: sobria, territorial, orientada a datos y reconocible por su relación con la geografía hondureña.

La complejidad visual debe surgir de relaciones reales —territorio, cobertura, convenios, gestores, fuentes y seguimiento— y no de decoración.

Principios:
- confianza institucional antes que espectáculo;
- Honduras como firma gráfica recurrente;
- mapa y territorio como protagonistas;
- jerarquía tipográfica clara, no estridente;
- controles progresivos: primero lo esencial, después lo avanzado;
- procedencia del dato integrada en las fichas;
- color como apoyo, nunca como única señal;
- movimiento corto y funcional para comunicar profundidad territorial;
- componentes reutilizables y accesibles;
- diseño móvil con navegación completa.

## Firma cartográfica

La geometría oficial cargada por el portal se reutiliza en tres niveles:
1. **Hero territorial**: mapa de Honduras como firma visual de baja opacidad.
2. **Atlas principal**: exploración nacional, departamental y municipal.
3. **Mapa de contexto**: miniatura nacional al profundizar en un departamento.

No mantener SVG decorativos independientes cuando la cartografía del propio sistema puede generar la identidad.

## Tipografía

El portal utiliza **Source Sans 3** como familia principal, con pila de sistema como respaldo.

Reglas:
- texto base cercano a 16–17 px;
- títulos de sección contenidos;
- pesos 600–700 para jerarquía;
- mayúsculas solo en metadatos breves;
- cifras y códigos con numerales tabulares;
- producción final: evaluar autoalojamiento o tipografía oficial SESAL.

## Atlas territorial

El mapa principal se presenta como una pieza editorial completa:
- título territorial dinámico;
- subtítulo estadístico;
- período y fuente;
- leyenda compacta;
- cartografía central;
- mapa nacional de contexto al entrar a nivel municipal;
- ficha territorial integrada;
- tabla equivalente para accesibilidad;
- exportaciones contextuales.

La transición nacional → departamento comunica profundidad de navegación; no debe sentirse como una animación ornamental.

## Ficha territorial

La ficha funciona como expediente institucional:
- identidad territorial y código;
- cobertura y población;
- barra de proporción cuando aplica;
- procedencia del dato: período, fuente y página;
- alcance;
- municipios y relaciones asociadas cuando existan.

## Ecosistema UGD

El modelo de gestión se representa como una red:
**SESAL → convenios / gestores / financiamiento → redes / territorio / población → monitoreo → retroalimentación**.

El diagrama debe conservar una lectura textual completa y usar SVG solo como capa de conexión decorativa.

## Movimiento

Permitido:
- entrada de mapa 300–450 ms;
- detalle 180–250 ms;
- nodos del ecosistema al entrar en viewport;
- hover de territorio 120–160 ms.

No usar:
- parallax pronunciado;
- partículas;
- glow persistente;
- animación continua;
- desplazamientos que no representen una relación de información.

Todo movimiento respeta `prefers-reduced-motion`.

## Tokens principales

- `--deep`: identidad institucional oscura.
- `--brand`: navegación, territorio activo y acciones.
- `--brand-soft`: fondos de apoyo.
- `--surface`: fondo general.
- `--paper`: paneles y contenido.
- `--warning`: avisos de calidad cuando realmente correspondan.

## Estructura

1. Franja institucional.
2. Navegación principal.
3. Hero cartográfico con indicadores.
4. Divisor territorial.
5. Atlas UGD.
6. Tabla y fuentes.
7. Ecosistema de gestión.
8. Arquitectura de información institucional.
9. Footer.

## Criterio de evolución

Cada nueva visualización debe responder al menos una pregunta institucional concreta. Si un efecto no mejora comprensión, jerarquía, navegación o identidad territorial, no pertenece al sistema.
