# Preview y migración a SESAL
## Desarrollo y revisión
Node 22 o posterior. Ejecutar npm test, npm run validate, npm run build y npm run preview.
También se pueden ejecutar directamente node scripts/validate.mjs y node scripts/build.mjs.
El workflow de CI valida y produce un artefacto dist; no publica ningún sitio.
Los artefactos heredan el acceso del repositorio. Revisar permisos de colaboradores.

## GitHub Pages opcional
Mantener este repositorio privado. Pages desde repositorios privados requiere un plan compatible.
Un sitio Pages puede ser público aunque su repositorio sea privado: revisar acceso y aprobación institucional antes de habilitarlo.
En Free, una alternativa futura es un repositorio de demo separado con solo dist aprobado; nunca copiar el historial de trabajo.
Configurar Pages con GitHub Actions y un environment protegido cuando se autorice publicar.
No se incluye workflow de despliegue activo.

## Un único artefacto portable
La compilación utiliza ./src/, ./data/ y ./geography/ respecto a index.html.
config.json se lee en ejecución: dataRoot y geographyRoot son directorios relativos terminados en /.
Sirve el mismo dist/ bajo /, /ugd-portal/ o /unidades/ugd/ sin recompilar.
Normalizar la URL del directorio con barra final en el servidor.
No utilizar rutas absolutas /data ni dominios incrustados. Evitar rutas de navegador profundas; usar hash si se incorpora navegación.
npm run dev sirve el árbol de desarrollo SOLO en localhost; nunca usarlo como servidor institucional.
npm run preview sirve dist para revisión local.

## Entrega a infraestructura oficial
1. SESAL define responsable, ruta/dominio, permisos y aprobación de contenido, cartografía y fuentes.
2. Ejecutar validación, pruebas y build en una revisión identificada; conservar SHA y artefacto.
3. Copiar únicamente dist/ al directorio web del servidor (Nginx, Apache o equivalente), conservando su estructura.
4. Configurar HTTPS, MIME para JS/JSON/GeoJSON, compresión, barra final y cache: index.html/config.json/catalog.json revalidables.
5. Probar desde la ruta oficial CSS, módulos, catálogo, snapshots, errores y mapa cuando exista; comprobar teclado y móvil.
6. Mantener la versión anterior para rollback atómico. Cambiar DNS solo con autorización institucional.
GitHub permanece como repositorio e historial. Un despliegue automatizado futuro cambia el destino del artefacto; las credenciales viven en secretos protegidos, nunca en config.json.
No poner autenticación ni información confidencial en archivos estáticos.

Referencias:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
