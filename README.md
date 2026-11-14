# UGD · Portal institucional
Portal institucional público de la Unidad de Gestión Descentralizada (UGD) de SESAL, Honduras: qué hace la UGD, dónde tiene presencia y cómo se distribuyen la población y la inversión vinculadas a su trabajo. Prototipo pendiente de aprobación institucional. Propósito, estructura y alcance: [PRODUCT.md](docs/PRODUCT.md) y [AGENTS.md](AGENTS.md).
La consulta territorial usa por ahora el archivo histórico provisional SESAL 2024 y cartografía histórica SINIT/HDX; se sustituirá con datos actualizados de la UGD. No acredita situación actual ni realiza despliegue público.
El prototipo conserva módulos que quedan fuera del alcance (biblioteca documental, convenios, observatorio y administración interna); su retiro del sitio público está planificado en PRODUCT.md.

## Inicio
Requiere Node.js 22.13+. No requiere instalar dependencias.
```sh
npm test
npm run validate
npm run build
npm run preview
```
Abrir http://127.0.0.1:4173. Para desarrollo: npm run dev.
Para instalar las herramientas de navegador de forma reproducible: `npm ci`, `npx playwright install chromium` y `npm run test:browser`. El CI usa el lockfile. Las pruebas, validación y build básicos siguen sin requerir dependencias instaladas.
Frontend HTML/CSS/módulos ES y mapa SVG sin dependencias externas. Hover, selección móvil, drill-down, búsqueda, filtros respaldados por datos, tabla accesible, enlaces compartibles y exportación municipal contextual.

## Estructura
- src/: frontend, configuración de rutas y contrato del mapa.
- data/: catálogo, JSON Schemas, archivo histórico territorial y observaciones data_quality_issues.
- geography/: cartografía GeoJSON histórica; carga municipal por departamento.
- scripts/: validación, build y servidor local.
- tests/: contratos, relaciones y portabilidad.
- public/: configuración de ejecución y recursos publicables.
- .github/workflows/: CI sin publicación automática.
- docs/: arquitectura, modelo de datos y despliegue.

## Documentación
- [Producto: propósito, estructura y alcance](docs/PRODUCT.md)
- [Gobernanza de contenidos](docs/content-governance.md)
- [Arquitectura](docs/architecture.md)
- [Modelo de datos y publicación de cortes](docs/data-model.md)
- [Preview y migración a SESAL](docs/deployment.md)
- [Contrato del mapa](src/map/README.md)
- [Explorador: evidencia, actualización, migración y pruebas](docs/territorial-explorer.md)

## Portabilidad y privacidad
dist/ usa rutas relativas y config.json en ejecución, sin dominio ni prefijo GitHub codificado.
El mismo artefacto puede alojarse en GitHub Pages/preview o infraestructura oficial.
El repositorio es público: todo lo que se incorpora a Git, incluido su historial, queda visible. Incorporar solo material con autorización de publicación.
No guardar datos personales, datos de pacientes, secretos ni documentos internos. data/raw/ y .env están excluidos como medida auxiliar.
El build publica únicamente catálogo, snapshots registrados, recursos frontend y GeoJSON; revisar estos archivos antes de publicar.
No se concede licencia de redistribución de código o datos hasta que el titular la defina.

## Administración interna (experimental, fuera de alcance)

Servicio separado con SQLite, acceso por roles, importación JSON/CSV y circuito de revisión. Ver [puesta en marcha y operación](docs/admin-workflow.md). No se incluye en `dist/` ni despliega el sitio.

## Observatorio y seguimiento (prototipo, fuera de alcance)

Indicadores nacionales, comparación condicionada por metodología y alertas internas sobre el último período disponible. Ver [metodología y alcance](docs/observatory.md). El histórico actual no permite calcular una tendencia entre años.
