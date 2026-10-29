# UGD · Portal institucional
Base inicial privada para desarrollar el portal UGD. Prototipo pendiente de aprobación institucional.
Sin datos sensibles, cifras precargadas, cartografía ni despliegue público.

## Inicio
Requiere Node.js 22+. No requiere instalar dependencias.
```sh
npm test
npm run validate
npm run build
npm run preview
```
Abrir http://127.0.0.1:4173. Para desarrollo: npm run dev.
Frontend HTML/CSS/módulos ES preparado para incorporar componentes y un motor de mapa.

## Estructura
- src/: frontend, configuración de rutas y contrato del mapa.
- data/: catálogo, JSON Schemas y futuros snapshots aprobados.
- geography/: cartografía GeoJSON aprobada.
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

## Portabilidad y privacidad
dist/ usa rutas relativas y config.json en ejecución, sin dominio ni prefijo GitHub codificado.
El mismo artefacto puede alojarse en GitHub Pages/preview o infraestructura oficial.
Mantener privado el repositorio. La privacidad del código no protege los archivos de un sitio publicado.
No guardar datos personales, secretos ni documentos internos. data/raw/ y .env están excluidos como medida auxiliar.
El build publica únicamente catálogo, snapshots registrados, recursos frontend y GeoJSON; revisar estos archivos antes de publicar.
No se concede licencia de redistribución de código o datos hasta que el titular la defina.
