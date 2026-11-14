# Propuestas visuales del portal UGD

Estado: **tres propuestas para elegir; ninguna aprobada.** El rediseño definitivo no se implementa hasta que Carlos elija una opción. La ausencia de respuesta no equivale a aprobación. Este documento no aprueba identidad, textos, cifras ni fotografías.

Prototipos locales comparables en [`design/propuestas/`](../design/propuestas/README.md): la misma portada, municipio seleccionado (Lepaera, Lempira), ficha de gestor y ficha incompleta, en escritorio (1440 px) y móvil (390 px).

## 1. Qué es ejemplo y qué es real en los prototipos

| Elemento | Naturaleza |
| --- | --- |
| Textos «Texto de ejemplo…» | Ficticios; marcan longitud y lugar del texto institucional pendiente. |
| «Asociación Gestora de Ejemplo del Occidente», su población (87 500), inversión (L 14 200 000), contacto (`@ejemplo.invalid`) y vínculos con Lepaera, Talgua, Las Flores y Piraera | **Ficticios.** No representan ninguna entidad ni asignación real. |
| Población de municipios (p. ej. Lepaera 42 710), 1 592 136 y 93 municipios, mapa de cobertura reportada | Corte 2024 del repositorio (SESAL, Memoria institucional 2024), **provisional y sin verificación oficial**. |
| Fotografías | No hay fotografías autorizadas: se muestran marcadores degradados con la leyenda «Fotografía pendiente de autorización». |
| Logotipo SESAL | Marcador punteado. No se reproduce el logotipo oficial (contiene el escudo nacional) sin autorización ni manual vigente. |
| Geometría | Histórica HDX/SINIT simplificada; no certifica límites vigentes. |

Todas las pantallas llevan la franja «Prototipo de diseño · contenido de ejemplo, no institucional». Nada de `design/` entra en `dist/` (el build lo rechaza explícitamente).

## 2. Investigación de referencias (14 de noviembre de 2026)

| Referencia | Qué se comprobó | Uso en las propuestas |
| --- | --- | --- |
| [salud.gob.hn](https://www.salud.gob.hn/) | **Verificado en su CSS vigente** (`/css/style.css`, bloque «Nuevos Colores Institucionales»): `--azul-sesal: #224F9D`, `--azul-sesal-dark: #183A78`, `--dorado-sesal: #AD8411`. En el HTML: `theme-color` y títulos/botones `#273A81`. Tipografía Poppins (Google Fonts). Cabecera con barra superior oscura y logotipo blanco «Gobierno de la República de Honduras · Secretaría de Salud» con escudo. | Pertenencia: los tres prototipos usan `#224F9D`/`#183A78` como color principal y `#AD8411` solo como acento (filetes, numeración, selección del mapa), nunca como texto pequeño sobre blanco (contraste ≈ 3,4:1). Son valores de la web actual, no de un manual certificado. |
| [undp.org](https://www.undp.org/) | El acceso automatizado devolvió 403; no se pudo verificar tipografía ni composición actuales. | Solo como referencia general de composición editorial (opción 2), sin atribuirle valores concretos. |
| [paho.org/es/honduras](https://www.paho.org/es/honduras) | Página de país con carrusel fotográfico documental, bloque de datos de contexto y secciones de noticias e historias. No se pudieron verificar créditos ni textos alternativos. | Fotografía documental como protagonista con leyenda (opción 2); se evita el carrusel. |
| [nhs.uk](https://www.nhs.uk/) | Enlace «saltar al contenido», búsqueda y lista de tareas principales visibles. Colores y fuente no verificados por CSS. | Accesos directos por tarea en todas las opciones; foco amarillo `#FFBF47` (ya usado por el portal). |
| [maps.worldbank.org](https://maps.worldbank.org/projects?status=active,pipeline) | Aplicación renderizada con JavaScript; no se pudo leer su composición. | Patrón general filtros → mapa → detalle de la opción 3, basado en el explorador actual del portal, no en una copia. |
| [annualreport.undp.org](https://annualreport.undp.org/) | Solo se obtuvo el título «Annual Report 2025 | UNDP»; contenido no verificable. | No usado. |

## 3. Las tres opciones

### Opción 1 · Institucional contemporánea — [`opcion-1.html`](../design/propuestas/opcion-1.html)

- **Composición:** barra gubernamental azul oscuro, cabecera blanca con marcador de logotipo; portada en dos columnas (título + presentación a la izquierda, una fotografía vertical a la derecha); accesos por tarea en lista de 3×2; modelo en cuatro pasos numerados; banda de territorio con mapa y llamada; cifras en tres columnas con fuente y estado.
- **Recorrido:** entender UGD → modelo → territorio → cifras, con accesos directos visibles desde el primer pantallazo.
- **Municipio:** panel dividido (filtros + mapa departamental | detalle con población, estado, gestores y fuente) y tabla equivalente debajo.
- **Ficha:** encabezado sobrio, cuerpo con descripción, territorios (botones a cada municipio), mapa mínimo y fotografías; columna lateral de datos clave (población, inversión, contacto) que en móvil sube arriba.
- **Tipografía:** Public Sans (OFL) 400–700; títulos 700 con tracking negativo; numerales tabulares.
- **Color:** blanco, `#224F9D`, `#183A78`, gris azulado `#F5F7FB`; `#AD8411` en filetes y selección.
- **Ventajas:** la más robusta con pocas fotografías y contenido parcial; muy próxima a SESAL; bajo costo de mantenimiento.
- **Limitaciones:** menos memorable; con muchos datos pendientes puede parecer un esqueleto institucional.
- **Dependencia de fotos:** baja (una fotografía de portada; las fichas funcionan sin fotos).

### Opción 2 · Salud y territorio — [`opcion-2.html`](../design/propuestas/opcion-2.html) (preferencia inicial de Carlos)

- **Composición:** fotografía documental a sangre en la portada con título serif grande sobre degradado; capítulos numerados (01 La UGD, 02 Cómo funciona, 03 Territorio y gestores, 04 Población e inversión, 05 Equipos) que alternan foto y texto; banda oscura de transición al territorio con cifra destacada y mapa.
- **Recorrido:** narrativo y lineal, el más fiel a «entender UGD → comprender su trabajo → territorio → gestor → cifras → equipos»; accesos directos en barra bajo la portada.
- **Municipio:** página editorial con el nombre del lugar en grande, filtros como etiquetas, mapa como figura con pie, «Quién gestiona los servicios aquí» con miniatura del gestor, galería del territorio y tabla desplegable.
- **Ficha:** cabecera fotográfica con el nombre; sin fotografía, cabecera tipográfica azul noche con la silueta del mapa (estado incompleto). Cuerpo con descripción destacada y «ficha técnica» lateral.
- **Tipografía:** Source Serif 4 (títulos, 500–700) + Source Sans 3 (texto), ambas OFL.
- **Color:** papel cálido `#FAF7F1`, azul noche `#13294F` derivado de `#183A78`, `#224F9D` para enlaces, dorado `#AD8411` y su versión clara `#E9D59A` (solo sobre fondo oscuro).
- **Ventajas:** la de mayor calidad editorial y emoción; explica con lugares y personas; transición clara a territorio y gestores.
- **Limitaciones:** el serif y el papel cálido se alejan algo de la web de SESAL; páginas más largas; exige disciplina editorial (pies de foto, créditos).
- **Dependencia de fotos:** **alta.** Necesita como mínimo ~6 fotografías autorizadas de buena calidad (portada, La UGD, Equipos y una por gestor destacado). Sin ellas la portada pierde su razón de ser.

### Opción 3 · Presencia y datos — [`opcion-3.html`](../design/propuestas/opcion-3.html)

- **Composición:** cabecera compacta; banda azul con presentación de dos líneas y accesos por tarea en forma de píldoras; el explorador territorial aparece inmediatamente (filtros y lista | mapa | cifras nacionales); debajo, tres bloques: Qué es la UGD, Cómo funciona, Gestores/Contacto.
- **Recorrido:** prioriza consultar; la explicación institucional es breve y enlaza a su sección.
- **Municipio:** el mismo explorador con el municipio seleccionado; detalle a la derecha con indicadores, gestores, fuente, compartir y CSV. En móvil: pestañas Mapa/Lista, filtros plegados y detalle bajo el mapa.
- **Ficha:** hoja de datos con tres indicadores (municipios vinculados, población, inversión), tabla de territorios con enlaces, mapa, descripción, contacto y fotografías en recuadros.
- **Tipografía:** IBM Plex Sans (OFL) con numerales tabulares.
- **Color:** blanco y gris `#F3F5F9`, `#224F9D`/`#183A78`, selección `#AD8411`.
- **Ventajas:** la más rápida para quien busca un lugar o un gestor; escala bien con muchos gestores.
- **Limitaciones:** contradice la prioridad de AGENTS.md de que el visitante entienda la institución sin depender del mapa; con datos 2024 provisionales y sin gestores confirmados, lo primero que se ve es información no verificada; aspecto de tablero más que de portal institucional.
- **Dependencia de fotos:** baja.

## 4. Estado incompleto

Las tres muestran una ficha con nombre muy largo y sin descripción, territorios, población, fotos ni contacto: no aparecen bloques vacíos, solo un aviso único y el regreso al directorio. Opción 1 y 3 lo resuelven con un recuadro; la opción 2 sustituye la fotografía por una cabecera tipográfica.

## 5. Recomendación razonada

**Opción 2, con una condición:** que la UGD se comprometa a entregar el conjunto mínimo de fotografías autorizadas (≈ 6) antes de publicar. Es la que mejor cumple el recorrido pedido y la calidad editorial buscada, y sus fichas ya degradan bien sin fotografía.

Si ese material no está garantizado, **la opción 1** es la elección prudente: hoy el repositorio tiene **cero** fotografías autorizadas, y la opción 1 se ve intencional así. La opción 3 no se recomienda como dirección principal por adelantar datos provisionales al contenido institucional, aunque su explorador puede inspirar la vista de territorio de cualquiera de las otras dos.

## 6. Decisiones técnicas comunes a cualquier opción

- Las fuentes se **autoalojarán** (WOFF2, licencia OFL) en `public/fonts/`; los prototipos usan Google Fonts solo por comodidad. Alternativa sin dependencia: fuentes del sistema (peor carácter tipográfico, costo cero).
- Sin carruseles, vídeo ni scroll secuestrado; transiciones desactivadas con `prefers-reduced-motion`.
- El mapa SVG actual se conserva; solo cambia su estilo. La tabla equivalente se mantiene.
- Contraste calculado (WCAG): `#224F9D` sobre blanco 7,86:1; `#183A78` 10,96:1; `#AD8411` 3,45:1 (solo decorativo o texto grande); para texto dorado pequeño se usa `#7D5F0A` (5,98:1 sobre blanco; 5,59:1 sobre papel); `#E9D59A` sobre `#13294F` 9,91:1.

## 7. Cómo elegir

Responder con «Opción 1», «Opción 2» u «Opción 3» (o ajustes concretos). Tras la elección se implementará la opción completa sobre el portal real, se documentará el sistema visual definitivo en [visual-system.md](visual-system.md) y se revisarán móvil, tableta, escritorio, teclado y estados.
