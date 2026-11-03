# AGENTS.md — UGD Portal

## Misión y alcance
Desarrollar un portal institucional público para la Unidad de Gestión Descentralizada (UGD) de SESAL, Honduras: información institucional, funciones, descentralización, autoridades, cobertura, resultados y documentos.
Los sistemas internos de empleados, gestión de convenios e informes quedan fuera del alcance actual. Su código experimental existente no autoriza ampliarlo, integrarlo ni eliminarlo.

## Trabajo y contexto
1. Inspecciona el estado de Git, README.md, package.json y solo los archivos/documentos pertinentes. Recupera contexto progresivamente; no cargues todo el proyecto.
2. Expón un plan proporcional, con alcance y verificaciones. Distingue hechos comprobados, contenido pendiente de validación, hipótesis y decisiones pendientes.
3. Implementa el cambio mínimo autorizado; evita refactorizaciones y modificaciones ajenas a la tarea.
4. Verifica y revisa el diff. Reporta cambios, evidencia, pruebas ejecutadas, resultados y limitaciones.
5. Registra decisiones relevantes y su motivo en el PR; enlaza el documento afectado. Las propuestas no se convierten en decisiones aprobadas por estar documentadas. Actualiza documentación contradictoria dentro del alcance autorizado; si queda fuera, identifica el pendiente.

## Diseño y contenido
- Prioriza comprensión institucional y tareas de visitantes; el atlas es una herramienta de consulta, no una jerarquía obligatoria.
- Diseña interfaces coherentes, responsive y accesibles, con WCAG 2.2 AA como objetivo. Comprueba teclado, foco, lectura móvil y alternativas textuales/tabulares.
- No inventes datos, funciones legales, estadísticas vigentes, autoridades ni aprobaciones institucionales. Usa marcadores explícitos en propuestas.
- Conserva fuente, período, estado de verificación y limitaciones. No conviertas ausencia de datos en cero ni históricos en información actual.

## Ingeniería
- Respeta la base existente: HTML, CSS y módulos ES; Node.js para herramientas. Consulta package.json para requisitos y comandos vigentes.
- Mantén responsabilidades y módulos claros. No añadas dependencias ni cambies tecnologías sin justificar necesidad, alternativas, costo y riesgo dentro del alcance acordado.
- Preserva contratos de datos, rutas portables y separación entre recursos públicos e internos. No alteres datos para hacer pasar pruebas.

## Seguridad y Git
- No incluyas secretos, datos de pacientes, información interna ni contactos personales no autorizados en Git, artefactos o descargas.
- Trabaja en ramas independientes y pull requests; no escribas directamente en main ni reescribas historial compartido.
- No publiques el sitio, despliegues ni cambies visibilidad sin autorización explícita. Crear un PR no autoriza fusionarlo.
- .github/workflows/pages.yml solo se activa manualmente con workflow_dispatch; el despliegue requiere main. Fusionar no despliega Pages automáticamente. Comprueba automatizaciones antes de acciones que puedan publicarlo.

## Verificación
- Para cambios de código/datos, ejecuta las comprobaciones pertinentes de package.json: npm test, npm run validate y npm run build.
- Para interacción o diseño, añade npm run test:browser y revisión manual de móvil/teclado cuando corresponda; informa si falta el entorno requerido.
- Para cambios exclusivamente documentales, revisa exactitud, enlaces locales y diff; no ejecutes suites sin relación con el cambio.
- No declares pruebas exitosas, conformidad de accesibilidad ni despliegues que no hayas comprobado. Distingue resultados locales de CI.

## Documentación por tarea
Estas referencias describen el prototipo y pueden contener decisiones superadas. Para alcance y prioridades, aplica las instrucciones explícitas de la tarea y este archivo; contrasta los hechos técnicos con código/configuración.
- Entrada y arquitectura: [README](README.md), [arquitectura](docs/architecture.md). Desactualizados sobre enfoque privado/territorial y ausencia de backend o publicación automática; distingue portal público de administración experimental.
- Producto: [portal institucional](docs/institutional-portal.md). Describe la implementación anterior; su segunda etapa administrativa queda fuera de alcance. No fija la nueva navegación.
- Diseño: [sistema visual](docs/visual-system.md). Superadas la dominancia del atlas y la portada cartográfica obligatoria; no trasladarlas a nuevas reglas.
- Datos/mapas: [modelo](docs/data-model.md), [explorador](docs/territorial-explorer.md), [contrato del mapa](src/map/README.md). Distingue contrato general y archivo territorial; verifica comandos contra package.json.
- Resultados: [observatorio](docs/observatory.md). Conserva cautelas metodológicas; su seguimiento interno no es requisito del portal.
- Publicación: [despliegue](docs/deployment.md). Contiene afirmaciones contradictorias sobre Pages; verifica .github/workflows/ sin tomar su existencia como autorización.
- Administración: [flujo interno](docs/admin-workflow.md). Referencia del experimento fuera de alcance; consulta solo para evaluar dependencias o una tarea explícitamente autorizada.
