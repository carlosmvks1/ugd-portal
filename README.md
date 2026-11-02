# UGD · Portal institucional
Explorador territorial privado UGD. Prototipo pendiente de aprobación institucional.
Integra el archivo histórico provisional SESAL 2024 y cartografía histórica SINIT/HDX recuperados del mapa previo. No acredita situación actual ni realiza despliegue público.

## Inicio
Requiere Node.js 22+. No requiere instalar dependencias.
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
- [Arquitectura](docs/architecture.md)
- [Modelo de datos y publicación de cortes](docs/data-model.md)
- [Preview y migración a SESAL](docs/deployment.md)
- [Contrato del mapa](src/map/README.md)
- [Explorador: evidencia, actualización, migración y pruebas](docs/territorial-explorer.md)

## Portabilidad y privacidad
dist/ usa rutas relativas y config.json en ejecución, sin dominio ni prefijo GitHub codificado.
El mismo artefacto puede alojarse en GitHub Pages/preview o infraestructura oficial.
Mantener privado el repositorio. La privacidad del código no protege los archivos de un sitio publicado.
No guardar datos personales, secretos ni documentos internos. data/raw/ y .env están excluidos como medida auxiliar.
El build publica únicamente catálogo, snapshots registrados, recursos frontend y GeoJSON; revisar estos archivos antes de publicar.
No se concede licencia de redistribución de código o datos hasta que el titular la defina.
