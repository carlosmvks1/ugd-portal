# Sistema visual UGD

## Dirección

El portal adopta una estética de **inteligencia sanitaria pública**: sobria, clara, territorial y orientada a datos. No intenta parecer un sitio corporativo ni un dashboard administrativo genérico.

Principios:
- confianza institucional antes que decoración;
- jerarquía tipográfica clara, no estridente;
- mapa y datos como protagonistas;
- controles progresivos: primero lo esencial, después lo avanzado;
- color como apoyo, nunca como única señal;
- componentes reutilizables y accesibles;
- diseño móvil con navegación completa;
- ningún módulo se presenta como funcional si todavía depende de datos o validación de UGD.

## Tipografía

El prototipo utiliza **Source Sans 3** como familia principal, con una pila de sistema como respaldo. La elección prioriza lectura prolongada, formularios, tablas, cifras e interfaces institucionales.

Reglas:
- texto base cercano a 16–17 px;
- títulos de sección contenidos, evitando escalas publicitarias;
- pesos 600–700 para jerarquía; evitar 800–900 salvo casos excepcionales;
- mayúsculas sostenidas solo en etiquetas cortas;
- cifras KPI con peso fuerte, pero sin competir con el contenido territorial;
- producción final: evaluar autoalojamiento de la fuente para evitar dependencia externa.

## Referentes

La dirección toma patrones, no estilos literales, de:
- NHS Digital Service Manual: claridad, confianza, inclusión y componentes accesibles;
- UKHSA Data Dashboard: datos públicos, filtros, mapas, tooltips y descargas;
- Health New Zealand: identidad unificada, lenguaje simple y consistencia transversal;
- WHO Global Health Observatory: portales de datos con navegación por territorio/indicador;
- U.S. Web Design System: design tokens, tipografía legible y color funcional.

## Tokens principales

- `--deep`: identidad institucional oscura.
- `--brand`: acento turquesa para navegación, estados activos y acciones.
- `--brand-soft`: fondos de apoyo.
- `--surface`: fondo general.
- `--paper`: paneles y contenido.
- `--warning`: avisos de calidad y provisionalidad.

Los textos largos mantienen una medida limitada y los estados nunca dependen únicamente del color.

## Estructura

1. Franja institucional.
2. Navegación principal, incluida navegación móvil accesible.
3. Hero de alto contraste con indicadores integrados.
4. Explorador territorial como pieza central.
5. Filtros esenciales visibles y filtros avanzados progresivos.
6. Modelo de gestión.
7. Hoja de ruta de módulos institucionales.
8. Footer con atribución institucional, sin crédito de autoría técnica.

## Evolución

Gestores, Convenios, Documentos, Normativa y Monitoreo deben heredar este sistema visual. Hasta que cuenten con datos y validación institucional, se presentan como **hoja de ruta**, no como enlaces o funcionalidades terminadas.
