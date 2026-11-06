# Sistema de diseño y experiencia de usuario UGD

## 1. Alcance y estado de las reglas

Este documento orienta futuras interfaces del portal institucional público. [AGENTS.md](../AGENTS.md) rige el trabajo y [PRODUCT.md](PRODUCT.md) define alcance, hipótesis y validación. El dominio propio está confirmado; su nombre, alojamiento y configuración están pendientes. El sistema privado de empleados queda excluido.

- **Reglas obligatorias:** criterios de proyecto establecidos aquí para revisar futuras implementaciones; no constituyen aprobación institucional de identidad, contenido ni funcionalidades.
- **Propuestas de diseño:** alternativas para explorar y validar, no compromisos de implementación.
- **Decisiones pendientes:** requieren evidencia, selección del equipo o consulta institucional según corresponda.

La incorporación del documento no aprueba los wireframes ni demuestra accesibilidad del prototipo. Los contenidos y funcionalidades específicos siguen sujetos a validación con la coordinadora. Los pendientes pueden representarse explícitamente en el prototipo; su publicación se rige por PRODUCT.md y AGENTS.md.

## 2. Auditoría y sustitución de reglas anteriores

Inspección documental y de código: [portada](../index.html), [estilos](../src/styles.css) y [navegación](../src/ui.js). Se observan portada cartográfica, indicadores, variables de color, fuentes del sistema y menú móvil. Su existencia no acredita aprobación ni cumplimiento en ejecución.

| Regla anterior | Tratamiento y motivo |
| --- | --- |
| Confianza, jerarquía, controles progresivos, fuentes, alternativas al color y navegación móvil completa | Conservar; traducir a comprobaciones en las secciones siguientes. |
| Atlas como estética dominante, Honduras como firma y portada cartográfica obligatoria | Sustituir por prioridad institucional y tareas; el atlas es complementario si se valida su utilidad. |
| Secuencia fija de portada, indicadores, atlas, ecosistema y pie | Retirar como obligación: PRODUCT.md mantiene arquitectura y wireframes preliminares. |
| Modelo de relaciones SESAL, convenios, financiamiento y monitoreo | No tratarlo como explicación oficial aprobada; requiere respaldo y validación institucional. |
| “Geometría oficial” como identidad reutilizable | No presumir oficialidad ni vigencia: README describe cartografía histórica. Identificar fuente, período, permisos y limitaciones. |
| Segoe UI, tamaños, pesos, colores/tokens y duraciones concretas | Registrar como elecciones del prototipo, no identidad definitiva. Sustituir por roles y criterios de legibilidad, contraste y utilidad. |
| “Sobrio”, “no estridente” o “profundidad territorial” | Insuficientes como aceptación: comprobar jerarquía, tarea, comprensión y efectos observables. |

Faltaban convenciones completas de componentes y estados, orientación entre páginas, responsive por contenido, requisitos medibles de accesibilidad y evidencia de revisión. Esta actualización cubre esos vacíos sin ordenar cambios al código existente.

## 3. Principios obligatorios y comprobación

| Principio | Criterio de revisión |
| --- | --- |
| Claridad institucional | Cada entrada permite identificar UGD y el tema; siglas se explican y afirmaciones tienen respaldo o estado pendiente explícito. |
| Jerarquía | Título, explicación y acción pertinente se distinguen; avisos sobre vigencia acompañan al contenido afectado. |
| Consistencia | La misma función conserva nombre, aspecto y comportamiento entre vistas y estados. |
| Simplicidad funcional | Cada control responde a una tarea identificada; no se añade por existir en el prototipo. Lo avanzado no oculta información esencial. |
| Accesibilidad | Aplicar la sección 8 y registrar resultados automáticos y manuales; ninguna tarea depende solo de color, mapa, ratón o animación. |
| Orientación a tareas | Cada sección o acción indica qué puede obtener el visitante; vincularla a evidencia o hipótesis de PRODUCT.md y plan de validación. |
| Rendimiento y compatibilidad | Contenido institucional esencial disponible aunque falle una visualización; medir carga y estabilidad bajo condiciones documentadas. |
| Mantenibilidad | Reutilizar patrones y roles visuales; justificar excepciones y evitar variantes locales sin función distinta. |

## 4. Identidad visual

**Reglas obligatorias:**

- Usar logotipos, símbolos y fotografías institucionales con autorización y procedencia identificadas; respetar proporciones, área de reserva y variantes del manual que facilite SESAL. No inventar escudos ni presentar marcas del prototipo como oficiales.
- Separar roles de color: principal para orientación/acciones, secundarios para apoyo y semánticos para información, éxito, advertencia y error. Documentar combinaciones permitidas y contraste por estado; acompañar estados de texto o símbolo comprensible.
- Definir una escala tipográfica coherente por función: título de página, sección, cuerpo, etiquetas y metadatos. Mantener unidades escalables, interlineado legible y metadatos ampliables; no usar mayúsculas extensas ni convertir texto en imagen.
- Usar una escala compartida de espacios, contenedores fluidos y alineaciones consistentes. Agrupar por relación informativa; comprobar lectura con títulos largos y contenido real, sin recortes ni alturas fijas que oculten texto.
- Fotografías e ilustraciones deben aportar contexto, tener permisos y alternativa adecuada; las decorativas no agregan ruido al lector de pantalla. No usar imágenes genéricas como evidencia de actividades de UGD.
- Iconos consistentes; acciones poco familiares llevan etiqueta visible. Un icono solo necesita nombre accesible, pero ese nombre no sustituye la comprobación de comprensión.
- Mantener los roles reutilizables en la implementación futura; los nombres y valores actuales de variables CSS no obligan al nuevo sistema.

**Propuestas:** evaluar fuentes del sistema por costo de carga; numerales tabulares para cifras comparables; limitar longitud de línea y contrastar muestras con visitantes. Ninguna familia, escala, paleta, sombra, radio o estilo de fotografía queda seleccionada aquí.

## 5. Contenido, arquitectura y navegación

**Reglas obligatorias:**

- Inicio identifica la unidad, presenta su propósito con contenido validado o marcador explícito y permite elegir una tarea. La prioridad se justifica por comprensión y evidencia disponible; no por protagonismo del mapa o cantidad de datos.
- Usar nombres comprensibles, desarrollar siglas y evitar trasladar nombres de módulos técnicos a la navegación. El mapa del sitio de PRODUCT.md sigue siendo preliminar.
- Mantener ubicación y orden de navegación consistentes; señalar sección actual sin depender del color. Cada página tiene título propio y acceso al inicio; añadir migas solo si existe una jerarquía que ayuden a recorrer.
- Proporcionar rutas o anclas estables y compartibles para contenidos relevantes; verificar entrada directa, recarga y volver del navegador. Si una selección necesita compartirse, definir qué estado conserva la URL.
- Contenido principal responde la consulta; fuentes, metodología y material relacionado complementan sin esconder limitaciones necesarias para interpretar.
- Mantener una ficha o ubicación principal por documento; enlazar desde otros temas sin copiar versiones divergentes. No publicar secciones vacías ni repetir bloques para llenar la portada.
- Búsqueda y filtros requieren volumen y tarea que los justifiquen. La navegación básica no debe depender de un buscador ni de explorar un mapa.

## 6. Convenciones de componentes

Aplicar estas **reglas obligatorias cuando el componente esté justificado**; la lista no obliga a incorporarlos.

| Componente | Comportamiento y accesibilidad |
| --- | --- |
| Encabezado | Identidad autorizada y enlace de inicio comprensible; acceso para saltar al contenido. Si es fijo, no tapa títulos ni foco. |
| Navegación principal y móvil | Mismos destinos esenciales; botón de apertura con nombre, estado expandido y relación con el panel. Cerrado no deja enlaces ocultos enfocables. Escape cierra y devuelve foco al activador; si se usa modalidad, gestionar foco y fondo como diálogo. No usar semántica de menú de aplicación para enlaces ordinarios. |
| Enlaces y botones | Enlace navega; botón ejecuta acción. Etiquetas describen destino/resultado, enlaces en texto son reconocibles sin depender del color. Estados de foco, activación, deshabilitado y carga distinguibles; explicar indisponibilidad cuando sea necesaria. Avisar descargas o apertura nueva. |
| Tarjetas | Título y destino claros; usar enlace real para navegar, sin controles anidados ni varias acciones ambiguas sobre toda la superficie. |
| Secciones | Encabezados jerárquicos y contenido agrupado por tema; desplegables con estado accesible solo para información secundaria. |
| Tablas | Título o descripción, encabezados asociados y unidades explícitas. Ordenación mediante controles identificados y estado anunciado. Desplazamiento local accesible si es necesario; conservar relaciones al adaptar la presentación. |
| Búsqueda y filtros | Etiquetas persistentes, alcance, selección activa, restablecimiento y número de resultados. Comunicar actualización sin mover foco inesperadamente; ofrecer recuperación cuando no haya coincidencias. |
| Formularios | Solo con propósito y canal de atención definidos. Pedir lo mínimo, indicar campos obligatorios, asociar ayuda y errores, conservar entradas y ofrecer corrección. Confirmar éxito solo tras confirmación real del envío. No convertir el contacto público en gestión privada. |
| Estados | Distinguir carga, ausencia de datos, cero resultados, error y éxito. Mensajes específicos con siguiente paso; reintento si procede. Anunciar cambios relevantes mediante mecanismos de estado accesibles sin repetir todo el contenido ni bloquear el portal. |
| Pie de página | Canales y enlaces institucionales verificados, información de responsabilidad pertinente y acceso coherente a ayuda. No inventar sellos de cumplimiento ni compromisos legales. |

## 7. Responsive, rendimiento y movimiento

**Reglas obligatorias:**

- Diseñar primero el flujo de lectura en pantalla estrecha; ampliar columnas solo cuando el contenido conserve legibilidad y orden. Mantener información esencial y funciones disponibles en móvil, tableta y escritorio, en ambas orientaciones.
- Elegir puntos de ruptura donde el contenido deje de funcionar; registrar el problema que resuelven. No heredar automáticamente los valores del prototipo ni una lista de modelos de dispositivo.
- Comprobar anchos intermedios, textos largos, zoom, teclado y toque; no depender de hover. Evitar que paneles, cabeceras o controles fijos oculten contenido o acciones.
- Dimensionar medios para evitar saltos, servir recursos proporcionales y cargar visualizaciones pesadas cuando sean necesarias. Fuentes e imágenes no deben impedir leer información esencial.
- Para cambios futuros, medir peso transferido, carga del contenido principal, respuesta de interacción y desplazamientos de diseño; documentar dispositivo, navegador, red y comparación con la base. Acordar presupuestos antes de aceptar recursos costosos; no asumir rendimiento por una puntuación aislada.
- Admitir movimiento solo si explica un cambio, orienta o confirma una acción; nunca transmite información exclusiva ni retrasa el acceso. Sin partículas, parallax, destellos ni animación decorativa continua.
- Respetar `prefers-reduced-motion`: eliminar desplazamientos y transiciones no esenciales, conservando estados y retroalimentación. La duración concreta se evalúa por interacción; no se imponen tiempos del atlas.

**Pendiente:** matriz de navegadores/dispositivos y presupuestos de rendimiento según condiciones de uso investigadas. Entretanto, registrar explícitamente el alcance de cada prueba; no declarar compatibilidad universal.

## 8. Accesibilidad: objetivo WCAG 2.2 AA

**Reglas obligatorias:** evaluar todos los criterios A y AA aplicables de [WCAG 2.2](https://www.w3.org/TR/WCAG22/). Esta lista prioriza comprobaciones, no sustituye la norma ni certifica el sitio.

- Contraste de texto: al menos 4.5:1; 3:1 para texto grande según la definición WCAG. Elementos gráficos y señales necesarias para identificar controles/estados: 3:1 frente a colores adyacentes, con las excepciones de la norma (1.4.3 y 1.4.11). Comprobar cada combinación utilizada.
- Teclado: todas las tareas operables sin trampas, orden lógico y foco visible, nunca totalmente oculto por contenido propio (2.1.1, 2.1.2, 2.4.3, 2.4.7 y 2.4.11). Preferir controles nativos; evitar `tabindex` positivo.
- Semántica: idioma, título de página, regiones y encabezados que representen la estructura. Controles con nombre, rol y estado; el nombre accesible incluye la etiqueta visible. Imágenes informativas con alternativas equivalentes.
- Ampliación: texto al 200 % sin pérdida; redistribución a 320 píxeles CSS de ancho sin desplazamiento en dos ejes, salvo contenido que necesite presentación bidimensional, como determinadas tablas/mapas (1.4.4 y 1.4.10). Confinar su desplazamiento, sin arrastrar toda la página.
- Comprobar espaciado personalizado sin pérdida: interlineado 1.5, párrafos 2 veces el tamaño de fuente, letras 0.12 em y palabras 0.16 em (1.4.12).
- Objetivos de puntero: 24 × 24 píxeles CSS o alternativa/excepción admitida por 2.5.8; comprobar separación. Ofrecer alternativa sin arrastre a acciones de arrastrar (2.5.7). **Propuesta:** áreas de 44 × 44 para acciones frecuentes, sin presentarlas como mínimo AA.
- Contenido adicional por hover/foco: descartable, alcanzable con el puntero y persistente según 1.4.13. No ocultar allí información esencial.
- Mapas/gráficos: resumen textual y acceso equivalente a información y tareas mediante listado/tabla; no basta describir “mapa de Honduras”. Ofrecer etiquetas, unidades y distinciones ajenas al color.
- Formularios y mensajes: etiquetas, instrucciones, errores asociados y avisos de estado accesibles. Medios audiovisuales, si se incorporan, requieren las alternativas aplicables.
- Movimiento reducido es además una regla del proyecto; no confundir esta preferencia con una certificación AA.

**Automatizable parcialmente:** estructura y atributos, enlaces, ciertas combinaciones de contraste y dimensiones. Las herramientas no evalúan todas las combinaciones ni la calidad de nombres, alternativas o comprensión.

**Revisión manual necesaria:** completar tareas con teclado y lector de pantalla, foco y retorno, zoom/redistribución, espaciado, toque, mensajes dinámicos, movimiento reducido y equivalencia de visualizaciones. Registrar herramientas, versiones, escenarios y fallos; una auditoría automática sin errores no demuestra conformidad.

## 9. Datos, visualizaciones y documentos

**Reglas obligatorias:**

- Antes de incluir mapa, gráfico, indicador o tabla, escribir qué pregunta del visitante responde y por qué esa representación es útil. Si es una hipótesis, indicar cómo se validará.
- Mostrar junto al dato fuente, período, unidad, ámbito y limitaciones; distinguir período observado de fecha de actualización. No convertir ausencias en cero ni cifras históricas en vigentes.
- Etiquetar ejes, leyendas, escalas y denominadores; explicar cálculos y diferencias metodológicas. No sugerir tendencia o causalidad sin respaldo.
- Atlas complementario: proporcionar acceso textual/tabular a la misma información relevante, selección y contexto territorial comprensibles. Su fallo no impide consultar contenido institucional.
- Exportaciones, si se justifican, conservan contexto, filtros, período y fuente. No prometer descargas que no existen.
- Documentos: identificar título, emisor, fecha, versión y estado de vigencia cuando estén confirmados; señalar formato y tamaño cuando se conozcan. Comprobar acceso y accesibilidad del archivo, no solo del enlace. Para archivos inaccesibles, resolver una alternativa accesible y documentar la limitación; un PDF escaneado no basta como único acceso a información esencial.

## 10. Aceptación de futuras modificaciones

Cada PR de interfaz debe registrar evidencia o “no aplica” con motivo para:

- [ ] Tarea y alcance vinculados a PRODUCT.md; hipótesis diferenciadas de aprobación.
- [ ] Contenido comprensible, procedencia/estado visibles y ausencia de afirmaciones oficiales inventadas.
- [ ] Jerarquía, roles visuales y patrones consistentes, incluyendo textos largos.
- [ ] Navegación, entrada directa, volver, enlaces y rutas compartibles comprobados.
- [ ] Estados normales, vacíos, carga, error, éxito e indisponibilidad revisados según corresponda.
- [ ] Comprobaciones automáticas y manuales de accesibilidad documentadas; fallos y límites explícitos.
- [ ] Móvil, tableta, escritorio y anchos intermedios revisados, con zoom y orientación.
- [ ] Rendimiento comparado bajo condiciones registradas; contenido esencial usable si falla la visualización.
- [ ] Decisiones y excepciones justificadas, sin convertir propuestas visuales en requisitos aprobados.

Aplicar las pruebas pertinentes de AGENTS.md. Un cambio documental requiere exactitud, enlaces y diff; no requiere ejecutar la aplicación. No declarar cumplimiento, investigación con usuarios ni pruebas no realizadas.

## 11. Propuestas y decisiones pendientes

| Estado | Cuestión y validación |
| --- | --- |
| Propuesta | Portada institucional con accesos a tareas, o portada orientada a consultas: evaluar las alternativas de PRODUCT.md con contenido y visitantes; ninguna composición definitiva. |
| Pendiente institucional | Manual de identidad, logotipos, permisos de imágenes, contenido oficial y responsable de aprobación: solicitar a UGD. |
| Pendiente de diseño | Paleta, tipografía, escala, espacios, contenedores y tratamientos visuales: comparar muestras accesibles y registrar selección; consultar restricciones de identidad antes de declararlos definitivos. |
| Pendiente de producto | Prioridad de tareas, nombres de navegación y utilidad de mapa, indicadores, biblioteca y formularios: validar con coordinadora y visitantes. |
| Pendiente técnico | Matriz de compatibilidad y presupuestos de rendimiento: acordar con evidencia de condiciones de uso, sin cambiar stack por este documento. |

Registrar cada decisión futura con estado, motivo, evidencia y PR; indicar qué regla sustituye. Consultar documentos especializados solo para la tarea afectada. Las referencias históricas al atlas dominante quedan sustituidas por este documento; reconciliar después la descripción histórica de esta referencia en AGENTS.md y PRODUCT.md, sin modificar esos archivos en esta fase.
