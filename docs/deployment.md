# Preview y migración a SESAL
## Desarrollo y revisión
Node 22 o posterior. Ejecutar npm test, npm run validate, npm run build y npm run preview.
`npm run preview:content` construye en `work/preview/` una vista previa con piezas de contenido no aprobadas rotuladas; nunca escribe en `dist/` ni debe publicarse.
También se pueden ejecutar directamente node scripts/validate.mjs y node scripts/build.mjs.
El workflow de CI valida y produce un artefacto dist; no publica ningún sitio.
Los artefactos heredan el acceso del repositorio. Revisar permisos de colaboradores.

## GitHub Pages opcional
El repositorio es público: su código, datos e historial son visibles con independencia de que el sitio esté publicado. Incorporar solo material con autorización de publicación.
Un sitio Pages es público: revisar aprobación institucional del contenido antes de desplegarlo.
Configurar Pages con GitHub Actions y un environment protegido cuando se autorice publicar.
El workflow de despliegue (`pages.yml`) solo se ejecuta manualmente; ver «Despliegue activo en Pages».

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

## Despliegue activo en Pages

El workflow `pages.yml` se activa **solo manualmente** (`workflow_dispatch`); fusionar en `main` no despliega. Publica únicamente `dist/`, después de pruebas, validación, build y navegador. Configura Pages para usar GitHub Actions y usa el entorno `github-pages`; el trabajo de despliegue solo permite `main`. Ejecutarlo requiere autorización explícita. Si la política del repositorio impide cambiar la fuente con GITHUB_TOKEN, seleccionar **Settings → Pages → Source → GitHub Actions** y reintentar el trabajo.

URL predeterminada: https://carlosmvks1.github.io/ugd-portal/. No se cambia DNS ni se despliega la administración Node/SQLite. `config.json` se incluye en la raíz del artefacto y las rutas de módulos, datos y cartografía permanecen relativas al subdirectorio.
