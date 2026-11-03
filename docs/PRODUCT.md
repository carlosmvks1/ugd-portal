# PRODUCT — Portal institucional UGD

Estado: propuesta de definición de producto para revisión. Las decisiones marcadas como confirmadas proceden del encargo del responsable del proyecto y de [AGENTS.md](../AGENTS.md); no equivalen a aprobación institucional de textos, datos o diseños.

## 1. Visión y propósito

Desarrollar un sitio propio, público, claro, accesible y verificable para la Unidad de Gestión Descentralizada (UGD) de SESAL, Honduras. Permitirá conocer la unidad, sus funciones, la descentralización en salud, autoridades, cobertura, resultados y documentación.

El portal debe facilitar comprensión y consulta. El atlas es una herramienta complementaria, no el principio obligatorio de organización. El sistema privado de empleados no forma parte de este producto.

## 2. Problema y punto de partida

El prototipo está orientado a consulta territorial y dispone de módulos institucionales, pero su documentación reconoce contenidos oficiales pendientes. La biblioteca deriva de fuentes del archivo territorial; la información histórica no acredita situación actual.

Hipótesis del problema: los visitantes necesitan una entrada comprensible y confiable para localizar información de la UGD, interpretar su alcance y encontrar respaldo documental o contacto. No se ha demostrado todavía la frecuencia de estas necesidades ni que los canales existentes sean insuficientes.

Se conserva la trazabilidad y la distinción entre datos ausentes y cero. No se asume que todas las funcionalidades implementadas deban permanecer.

## 3. Usuarios y necesidades

La solicitud de un portal público es un requisito confirmado del proyecto. No hay investigación con visitantes documentada que permita declarar verificadas las siguientes necesidades:

| Usuario potencial | Necesidad hipotética | Evidencia por obtener |
| --- | --- | --- |
| Ciudadanía | Comprender qué hace UGD, consultar territorio y encontrar orientación. | Consultas recibidas y pruebas de comprensión. |
| Municipalidades y organizaciones relacionadas | Localizar información territorial, lineamientos y canales institucionales. | Entrevistas y ejemplos de solicitudes. |
| Personal institucional que consulta el sitio público | Encontrar documentos y referencias para compartir. | Tareas frecuentes y documentos solicitados. |
| Autoridades | Consultar resultados y su respaldo por período. | Preguntas concretas y decisiones que informan. |
| Investigadores, estudiantes y otros interesados | Entender fuentes, metodología y datos publicables. | Casos de consulta y reutilización. |

Prioridad, frecuencia, vocabulario y condiciones de acceso quedan por investigar. Consultar información pública no implica disponer de cuentas o funciones internas.

## 4. Objetivos y criterios de éxito

Los siguientes criterios son propuestas de evaluación; no son resultados de pruebas:

| Objetivo | Cómo evaluar |
| --- | --- |
| Comprender la institución | El participante explica qué hace UGD después de consultar la presentación. |
| Encontrar información | Completa tareas de funciones, autoridades, documentos, cobertura y contacto sin ayuda; registrar éxito, errores y tiempo. |
| Interpretar correctamente | Distingue período histórico, dato pendiente y ausencia de información; no deduce ausencia de servicios a partir de un registro faltante. |
| Ofrecer evidencia | Cada cifra identifica fuente, período y limitaciones; cada documento identifica emisor, fecha y versión cuando estén disponibles. |
| Garantizar acceso | Evaluación manual y automática con WCAG 2.2 AA como objetivo, incluyendo teclado, foco, móvil y alternativas al mapa. |
| Sostener la actualización | El responsable actualiza contenido y documentos mediante un procedimiento documentado y puede recuperar una versión anterior. |

Definir participantes, línea base y umbrales antes de la evaluación. No usar visitas como único indicador ni declarar conformidad de accesibilidad sin verificarla.

## 5. Alcance

Incluido como alcance de contenido, sujeto a fuentes y autorización de publicación:
- Presentación institucional, funciones, autoridades, estructura y base legal.
- Explicación de la descentralización, participantes y niveles de atención.
- Cobertura y resultados con contexto temporal y documental.
- Documentos públicos y canales oficiales de contacto.

Propuestas funcionales por validar:
- Navegación por tareas y páginas temáticas compartibles.
- Consulta territorial mediante listado o tabla; mapa complementario.
- Biblioteca organizada, con búsqueda y filtros solo cuando el volumen lo justifique.
- Resúmenes de resultados por período y descargas cuando exista necesidad de reutilización.

Fuera del alcance actual:
- Cuentas de empleados, gestión privada de convenios e informes, aprobaciones internas, alertas operativas y expedientes.
- Datos de pacientes, información confidencial y trámites no definidos por la institución.
- Integraciones transaccionales y seguimiento en tiempo real sin un nuevo alcance aprobado.

No comprometido para la primera versión: directorios de gestores, padrón individual de convenios, comparaciones entre años, noticias, buscador global y exportaciones avanzadas. Su inclusión requiere evidencia y revisión; no se hereda del prototipo. El código experimental existente tampoco autoriza su eliminación.

## 6. Arquitectura de información preliminar

Propuesta pendiente de validación con visitantes y UGD:

- Inicio.
- Sobre la UGD: presentación, funciones, autoridades, estructura y base legal.
- Descentralización en salud: funcionamiento, participantes, responsabilidades y papel de los convenios.
- Cobertura y resultados: consulta territorial, resultados por período, fuentes y metodología.
- Documentos: normativa, informes, memorias y lineamientos.
- Contacto: canales, ubicación y orientación según el motivo de consulta.

Cada documento tendrá una ficha principal enlazable desde otros temas, evitando copias contradictorias. Las agrupaciones no obligan a crear una página por cada apartado ni a publicar secciones vacías.

Inicio debe identificar la unidad, explicar brevemente su propósito y permitir elegir una tarea. Se estudiaron dos wireframes: A, presentación institucional con accesos directos; B, acceso a consultas desde el primer bloque. A fue recomendada provisionalmente; ninguna alternativa, jerarquía visual ni llamada a la acción está aprobada como diseño definitivo.

## 7. Recorridos principales propuestos

| Tarea hipotética | Recorrido | Resultado esperado |
| --- | --- | --- |
| Conocer la unidad | Inicio o enlace externo → Sobre la UGD → Funciones. | Comprender su papel y localizar respaldo. |
| Entender la descentralización | Descentralización → Participantes y niveles. | Entender responsabilidades sin conocer previamente las siglas. |
| Consultar un municipio | Cobertura → búsqueda o listado → detalle territorial. | Identificar información disponible, período, fuente y límites de interpretación. |
| Encontrar un documento | Documentos → categoría o búsqueda → ficha → archivo o fuente. | Identificar el documento y su versión antes de descargar. |
| Conocer resultados | Resultados → período → resumen → informe de respaldo. | Entender qué se midió sin atribuir causalidad no demostrada. |
| Localizar autoridad o contacto | Sobre la UGD → Autoridades; o Contacto → canal pertinente. | Identificar cargo o canal oficial confirmado. |

Probar también entradas directas desde buscadores y enlaces compartidos; no asumir que todos empiezan en Inicio.

## 8. Contenido y dependencias institucionales

Solicitar a la coordinadora y a las áreas competentes:
1. Prioridad alta: funciones y presentación aprobadas, dependencia y base legal, autoridades, canales de contacto, identidad gráfica y responsable de aprobación.
2. Prioridad alta para validar tareas: consultas frecuentes y documentos solicitados, sin datos personales.
3. Antes de publicar cobertura/resultados: fuentes autorizadas, períodos, definiciones, metodología, limitaciones y tratamiento de discrepancias.
4. Para la biblioteca: inventario de documentos públicos, emisor, fecha, versión, vigencia confirmada cuando corresponda y permisos de uso.
5. Para completar la presentación: fotografías autorizadas y explicación institucional del modelo.
6. Para operar: responsables de contenido, frecuencia de revisión, dominio, alojamiento, mantenimiento y procedimiento de corrección.

Se acordó preparar un ejemplo antes de pedir los datos aprobados. Usar marcadores explícitos para contenido ausente y etiquetas de período/estado para material histórico; no inventar cifras, autoridades ni textos oficiales.

La aprobación del prototipo no aprueba automáticamente su contenido. La publicación requiere revisión y autorización; antes del lanzamiento deben resolverse o retirarse los marcadores. El contenido institucional básico debe seguir disponible si falla la consulta territorial.

## 9. Decisiones y estado

| Estado | Decisión o cuestión |
| --- | --- |
| Confirmado por el responsable del proyecto | Sitio propio institucional público; prototipo experimental autorizado; sistema interno excluido. |
| Confirmado como previsión operativa | El ingeniero de la unidad mantendría el sitio; falta formalizar responsabilidades y procedimiento. |
| Confirmado en gobernanza | Trabajo por ramas y PR; despliegue manual y autorizado, conforme a AGENTS.md y al PR #13. |
| Propuesto | Mapa del sitio, recorridos, criterios de éxito y alternativas de portada de este documento. |
| Pendiente de investigación | Usuarios prioritarios, necesidades frecuentes, lenguaje y condiciones reales de consulta. |
| Pendiente institucional | Textos, autoridades, identidad visual, contactos, datos y documentos publicables; responsable de aprobación. |
| Pendiente técnico/operativo | Dominio, alojamiento, mecanismo editorial y frecuencia de actualización. |
| No acordado | Contratación externa de mantenimiento; no constituye un requisito de arquitectura ni un compromiso institucional. |

Registrar cambios de alcance o decisiones de producto con motivo, evidencia y PR; distinguir propuesta, aceptación y sustitución de decisiones previas. La incorporación de este documento no aprueba automáticamente sus propuestas.

## 10. Aceptación de futuras funcionalidades

Una funcionalidad candidata debe:
- Resolver una tarea identificada, con evidencia o una hipótesis explícita y un plan para validarla.
- Encajar en el portal público; un cambio de alcance requiere acuerdo explícito.
- Disponer de contenido publicable, responsable y mecanismo sostenible de actualización.
- Aportar valor frente a una alternativa más simple.
- Tener criterios verificables de utilidad, accesibilidad, privacidad y rendimiento.
- Justificar costo, dependencias y mantenimiento; no elegir tecnología por popularidad.
- Ser revisada mediante PR con resultados reales de las comprobaciones pertinentes.

Posponer funcionalidades sin evidencia o contenido suficiente. No añadirlas solo porque existan en el prototipo, aparezcan en otra web o sean posibles técnicamente.

## Referencias y decisiones anteriores

- [AGENTS.md](../AGENTS.md): reglas vigentes de alcance y trabajo.
- [README](../README.md): entrada técnica; su descripción de explorador privado no define la misión actual.
- [Portal institucional](institutional-portal.md): describe el prototipo y sus carencias; la segunda etapa administrativa está fuera del alcance confirmado.
- [Sistema visual](visual-system.md): referencia histórica; la dominancia del atlas y la portada cartográfica obligatoria quedan superadas por AGENTS.md.
- [Observatorio](observatory.md): conservar cautelas metodológicas; comparación temporal y seguimiento interno no se convierten en requisitos actuales.
- [package.json](../package.json): comandos existentes, no definición del producto.

Los documentos anteriores necesitan reconciliación posterior. Este cambio solo establece PRODUCT.md y no autoriza modificar otros archivos, implementar los wireframes ni desplegar.
