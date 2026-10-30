# Sistema visual UGD

## Dirección

El portal adopta una estética de **inteligencia sanitaria pública**: sobria, clara, territorial y orientada a datos. No intenta parecer un sitio corporativo ni un dashboard administrativo genérico.

Principios:
- confianza institucional antes que decoración;
- jerarquía tipográfica fuerte;
- mapa y datos como protagonistas;
- controles compactos y comprensibles;
- color como apoyo, nunca como única señal;
- componentes reutilizables y accesibles;
- diseño móvil desde el inicio.

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

El contenido normal usa un mínimo efectivo cercano a 16–17 px. Los textos largos mantienen una medida limitada y los estados nunca dependen únicamente del color.

## Estructura

1. Franja institucional.
2. Navegación principal.
3. Hero de alto contraste con indicadores integrados.
4. Explorador territorial como pieza central.
5. Modelo de gestión.
6. Módulos institucionales.
7. Footer con atribución institucional, sin crédito de autoría técnica.

## Evolución

Los módulos de Gestores, Convenios, Documentos, Normativa y Monitoreo deben heredar este sistema visual. Evitar crear estilos aislados por página.
