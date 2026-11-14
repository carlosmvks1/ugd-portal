# Ficha de necesidades fotográficas

Para solicitar las fotografías oficiales del portal (dirección visual «Salud y territorio»). Hay **seis fotografías de equipos** con una función narrativa cada una y, aparte, **un retrato institucional** de la dirección. Ninguna imagen se repite: cada fotografía ocupa un solo lugar (`placements`) y el validador lo exige.

Mientras falte una fotografía, su lugar no ocupa espacio: la portada se muestra tipográfica sobre azul con la silueta de Honduras, los capítulos usan una sola columna y la galería de equipos muestra «En preparación». No se publican marcos vacíos ni degradados que imiten una foto.

## Requisitos comunes

| Requisito | Detalle |
| --- | --- |
| Formato | JPG (fotografía) o WebP; sRGB. |
| Tamaño | Lado largo de 2000 a 2400 px para portada y bandas; 1600 px para el resto. Peso **menor de 1 MB** (el validador rechaza más). |
| Encuadre | Dejar aire alrededor del motivo: la imagen se recorta distinto en escritorio y en móvil. Indicar el punto de interés (`focus`, p. ej. `"60% 40%"`). |
| Contenido | Trabajo real de los equipos de salud en territorio. Sin pacientes identificables salvo consentimiento documentado; sin datos clínicos, expedientes ni pantallas con información personal. |
| Metadatos (obligatorios) | Descripción visible, texto alternativo distinto de la descripción, crédito, autorización de uso (y su alcance), personas identificables (`none` o `consented`). |
| Metadatos (si constan) | Lugar, fecha o fecha aproximada (`date_label`), territorio (`territory_ids`) y gestor (`manager_ids`) relacionados. |
| Evidencia | La autorización y los consentimientos se archivan fuera del repositorio (es público); en el PR solo se registra que existen. |

## Las seis fotografías de equipos

| # | Dónde se usa (`placements`) | Escena recomendada | Orientación y encuadre | Notas |
| --- | --- | --- | --- | --- |
| 1 | Portada (`home`), a sangre bajo el título | Equipo de salud llegando o trabajando en una comunidad, con paisaje o entorno reconocible de Honduras | Horizontal 16:9 o más panorámica. Motivo en el **tercio derecho**; tercio inferior izquierdo despejado para el título; cielo o fondo sin detalle en la parte superior | Es la imagen que más define el portal. Evitar rostros en primer plano bajo el título |
| 2 | La UGD (`ugd`), junto al título del capítulo | Personal de la UGD coordinando con equipos (reunión de trabajo, revisión de planificación) | Horizontal 4:3 | Que se entienda «coordinación», no un acto protocolar |
| 3 | Cómo funciona (`decentralization`) | Servicio prestado en territorio: unidad de salud, brigada, atención en comunidad (sin pacientes identificables) | Horizontal 4:3 | Ilustra el paso «Los servicios en el territorio» |
| 4 | Territorio y gestores (`territory`), en la banda azul | Paisaje con presencia del equipo: traslado, camino rural, establecimiento en su entorno | Horizontal 16:10; tonos que funcionen junto a azul noche | Se ve sobre fondo oscuro |
| 5 | Galería de equipos (`teams`), imagen principal | Equipo en una actividad concreta (vacunación, visita domiciliaria, jornada) | Horizontal 4:3 o vertical 4:5; se muestra grande | Descripción con lugar y fecha |
| 6 | Galería de equipos (`teams`) | Otra actividad, otro territorio o nivel de atención | Horizontal 4:3 | Distinta de la anterior en lugar o tipo de actividad |

Más fotografías de equipos pueden añadirse a la galería (`teams`) o asociarse a un gestor (`manager_ids`): la primera de cada gestor encabeza su ficha.

## Retrato institucional de la dirección (adicional)

| Campo | Detalle |
| --- | --- |
| Dónde se usa | Bloque «Dirección de la UGD» en La UGD, referenciado por `photo_id`; **sin** `placements` |
| Escena | Retrato institucional sobrio, fondo neutro o lugar de trabajo; mirada a cámara o tres cuartos |
| Orientación | Vertical 4:5, de 1200 × 1500 px aprox.; cabeza en el tercio superior (`focus` p. ej. `"50% 30%"`) |
| Metadatos | Nombre y cargo en el bloque; en la foto: texto alternativo («Retrato de …, …»), crédito, autorización de uso y consentimiento de la persona retratada |

Si el retrato falta, el bloque muestra solo nombre, cargo, responsabilidades y contacto, alineados en las mismas columnas.

## Cómo incorporarlas

1. Copiar el archivo a `public/media/equipos/<nombre>.jpg` (minúsculas, sin espacios).
2. Registrar la pieza en `data/content/photos.json` con los campos anteriores y `status: "approved"` solo cuando exista la autorización.
3. `npm run validate:content`, `npm run preview:content` y revisar en móvil y escritorio. Detalle en la [guía](content-guide.md#fotografías).
