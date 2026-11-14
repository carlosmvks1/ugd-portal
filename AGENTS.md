# AGENTS.md — UGD Portal

## Misión y alcance
Desarrollar un portal institucional público que explique qué hace la Unidad de Gestión Descentralizada (UGD) de SESAL, Honduras, dónde tiene presencia y cómo se distribuyen la población y la inversión vinculadas a su trabajo. Fotografías y datos deben permitir entender esa labor de forma clara y verificable.

Pregunta guía: **«¿Qué hace la UGD, dónde lo hace y qué información permite conocer su alcance?»**

Dentro del alcance (definición acordada con la coordinadora de UGD; detalle en [PRODUCT.md](docs/PRODUCT.md)):
- Identidad, funciones, estructura, autoridades y fundamento legal pertinente.
- Funcionamiento de la descentralización en salud y papel de la UGD.
- Gestores y territorios relacionados con su trabajo, con la población reportada.
- Inversión por nivel de gestión y por nivel de atención, con categorías y períodos definidos por la UGD.
- Fotografías contextualizadas del trabajo de los equipos de salud.
- Canales de contacto institucionales confirmados.

Fuera del alcance:
- Repositorio o biblioteca de documentos. Citar la fuente de una cifra no implica construir un repositorio documental.
- Catálogo, consulta pública y gestión de convenios.
- Sistemas internos, cuentas de empleados, informes internos y expedientes.
- Información de pacientes.
- Comparaciones históricas, tendencias o indicadores que los datos disponibles no permitan sostener.

El código experimental existente (administración interna, observatorio, módulos de biblioteca y convenios) no autoriza ampliarlo ni integrarlo. Su retiro del sitio público se hace en una tarea autorizada y verificada, no como efecto lateral de otro cambio.

## Trabajo y contexto
1. Inspecciona el estado de Git, README.md, package.json y solo los archivos/documentos pertinentes. Recupera contexto progresivamente; no cargues todo el proyecto.
2. Expón un plan proporcional, con alcance y verificaciones. Distingue hechos comprobados, contenido pendiente de validación, hipótesis y decisiones pendientes.
3. Implementa el cambio mínimo autorizado; evita refactorizaciones y modificaciones ajenas a la tarea.
4. Verifica y revisa el diff. Reporta cambios, evidencia, pruebas ejecutadas, resultados y limitaciones.
5. Registra decisiones relevantes y su motivo en el PR; enlaza el documento afectado. Las propuestas no se convierten en decisiones aprobadas por estar documentadas. Actualiza documentación contradictoria dentro del alcance autorizado; si queda fuera, identifica el pendiente.

## Diseño y contenido
- Prioriza que el visitante entienda la institución sin depender del mapa. El mapa sirve para consultar la presencia territorial y siempre tiene un listado equivalente.
- Al seleccionar un territorio, muestra solo lo que se relacione de forma verificable: gestor, población, período y, si los datos lo permiten, inversión y fotografías pertinentes. No prometas un nivel de detalle territorial que los datos no tengan.
- Población e inversión describen alcance y recursos; por sí solas no demuestran resultados sanitarios ni impacto. No titules secciones «Impacto» o «Resultados» sin evidencia que lo respalde.
- Las fotografías llevan descripción y, cuando estén disponibles, lugar y fecha; requieren autorización de uso y no muestran pacientes identificables sin consentimiento documentado.
- Diseña interfaces coherentes, responsive y accesibles, con WCAG 2.2 AA como objetivo. Comprueba teclado, foco, lectura móvil y alternativas textuales/tabulares.
- No inventes datos, funciones legales, estadísticas vigentes, autoridades ni aprobaciones institucionales. Usa marcadores explícitos en propuestas.
- Cada cifra conserva fuente, período, definición, estado de verificación y limitaciones. No conviertas ausencia de datos en cero ni históricos en información actual.

## Ingeniería
- Respeta la base existente: HTML, CSS y módulos ES; Node.js para herramientas. Consulta package.json para requisitos y comandos vigentes.
- Mantén responsabilidades y módulos claros. No añadas dependencias ni cambies tecnologías sin justificar necesidad, alternativas, costo y riesgo dentro del alcance acordado.
- Preserva contratos de datos, rutas portables y separación entre recursos públicos e internos. No alteres datos para hacer pasar pruebas.

## Seguridad y Git
- El repositorio es **público**: todo lo que entra en Git, incluido su historial, es visible. No incluyas secretos, datos de pacientes, información interna, material sin autorización de publicación ni contactos personales no autorizados en Git, artefactos o descargas.
- Trabaja en ramas independientes y pull requests; no escribas directamente en main ni reescribas historial compartido.
- No publiques el sitio, despliegues ni cambies visibilidad sin autorización explícita. Crear un PR no autoriza fusionarlo.
- .github/workflows/pages.yml solo se activa manualmente con workflow_dispatch; el despliegue requiere main. Fusionar no despliega Pages automáticamente. Comprueba automatizaciones antes de acciones que puedan publicarlo.

## Verificación
- Para cambios de código/datos, ejecuta las comprobaciones pertinentes de package.json: npm test, npm run validate y npm run build.
- Para interacción o diseño, añade npm run test:browser y revisión manual de móvil/teclado cuando corresponda; informa si falta el entorno requerido.
- Para cambios exclusivamente documentales, revisa exactitud, enlaces locales y diff; no ejecutes suites sin relación con el cambio.
- No declares pruebas exitosas, conformidad de accesibilidad ni despliegues que no hayas comprobado. Distingue resultados locales de CI.

## Documentación por tarea
[PRODUCT.md](docs/PRODUCT.md) y este archivo definen alcance y prioridades. Las demás referencias describen el prototipo y pueden contener decisiones superadas; contrasta los hechos técnicos con código/configuración.
- Entrada y arquitectura: [README](README.md), [arquitectura](docs/architecture.md). La arquitectura describe biblioteca, convenios y observatorio del prototipo; distingue portal público de administración experimental.
- Contenido: [gobernanza de contenidos](docs/content-governance.md) para procedencia y estados editoriales de textos, cifras y fotografías.
- Prototipo anterior: [portal institucional](docs/institutional-portal.md). Su biblioteca, consulta de convenios y segunda etapa administrativa quedan fuera de alcance.
- Diseño: [sistema visual](docs/visual-system.md). Superadas la dominancia del atlas y la portada cartográfica obligatoria; no trasladarlas a nuevas reglas.
- Datos/mapas: [modelo](docs/data-model.md), [explorador](docs/territorial-explorer.md), [contrato del mapa](src/map/README.md). Base para presencia territorial; el archivo 2024 es provisional y se sustituirá con datos actualizados de la UGD.
- Observatorio: [observatorio](docs/observatory.md). Fuera de alcance como sección; conserva sus cautelas metodológicas (no causalidad, no comparar sin metodología equivalente).
- Publicación: [despliegue](docs/deployment.md). Contiene afirmaciones contradictorias sobre Pages; verifica .github/workflows/ sin tomar su existencia como autorización.
- Administración: [flujo interno](docs/admin-workflow.md). Referencia del experimento fuera de alcance; consulta solo para evaluar dependencias o una tarea explícitamente autorizada.
