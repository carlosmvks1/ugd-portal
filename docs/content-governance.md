# Gobernanza de contenidos institucionales

## Alcance y estado

**Propuesta operativa para revisión**, no procedimiento institucional formal ni política legal aprobada. Aplicable al portal público UGD con dominio propio. La inclusión de cada categoría y los responsables siguen sujetos a validación.

Consultar [PRODUCT.md](PRODUCT.md) para alcance y prototipo, [sistema visual](visual-system.md) para accesibilidad, [arquitectura](architecture.md) para datos/artefactos y [AGENTS.md](../AGENTS.md) para autorización y trabajo por PR. Este documento no implementa un CMS ni amplía la administración experimental.

## 1. Situación comprobada

- El [catálogo](../data/catalog.json) referencia el archivo territorial y no contiene cortes generales publicados. El [archivo](../data/explorer/archive.json) registra fuentes, emisor, URL, fecha de consulta, períodos, páginas y estados de verificación; algunos campos son opcionales.
- El corte 2024-v1 figura como provisional y `official_unverified`, con fecha de publicación desconocida. La observación Q001 conserva la discrepancia de 93 municipios en tabla y 89 en texto: no resolverla por inferencia.
- [contract.js](../src/map/contract.js) define `official_verified`, `official_unverified` y `pending_UGD`; son estados de datos, **no autorizaciones editoriales**. Los estados propuestos abajo no sustituyen ni migran ese contrato.
- La biblioteca de [institutional.js](../src/institutional.js) deriva de fuentes territoriales; no acredita un inventario completo de documentos institucionales. La biblioteca documental y los convenios quedan fuera del alcance según [PRODUCT.md](PRODUCT.md); las fuentes acompañan a las cifras sin formar un repositorio documental.
- [Pages](../.github/workflows/pages.yml) se activa manualmente y su despliegue exige main. Aprobar un contenido, fusionar un PR y autorizar un despliegue son decisiones distintas.
- No contamos todavía con todos los contenidos oficiales ni un procedimiento institucional formal de aprobación. La presencia de una fuente en Git no demuestra vigencia, exactitud ni permiso de publicación. Esta revisión comprobó registros del repositorio, no revalidó las fuentes externas.

## 2. Categorías y comprobaciones aplicables

Todas son candidatas, no secciones ya aprobadas.

| Categoría | Evidencia específica antes de publicar |
| --- | --- |
| Presentación y funciones | Texto respaldado y validado por UGD; distinguir descripción divulgativa de atribución legal. |
| Marco normativo | Instrumento, emisor, fecha y versión; confirmar vigencia o señalar que es histórica/desconocida. No interpretar facultades legales por cuenta del equipo. |
| Autoridades y estructura | Nombre/cargo, fecha de referencia y confirmación competente; organigrama autorizado. |
| Descentralización sanitaria | Explicación institucional validada; fuentes de responsabilidades y relaciones, sin trasladar diagramas del prototipo como hechos oficiales. |
| Presencia territorial y población | Gestor, territorio, fuente, período, unidad territorial y definición de la población; distinguir ausencia, cero y datos históricos. |
| Inversión | Nivel de gestión o de atención, categoría, moneda, tipo de monto, período, unidad territorial y fuente definidos por UGD; no presentarla como impacto ni repartirla entre territorios sin respaldo. |
| Fotografías del trabajo de los equipos | Descripción, lugar y fecha cuando consten, crédito, autorización de uso y consentimiento si aparecen personas identificables; texto alternativo. |
| Fuentes de cifras | Emisor, título, fecha o período y enlace cuando exista. Citar la fuente no implica alojar ni catalogar documentos. |
| Contacto | Canal institucional autorizado, propósito y confirmación de funcionamiento; evitar contactos personales no autorizados. |

## 3. Estados editoriales propuestos

Aplicarlos a una **pieza y versión identificables**, no globalmente al portal.

| Estado | Condición para avanzar |
| --- | --- |
| Propuesto | Tema, propósito y necesidad por validar. |
| En recopilación | Se solicitan fuentes o contenido; registrar faltantes. |
| Pendiente de verificación | Material recibido, todavía sin contraste suficiente. |
| Verificado documentalmente | Contenido contrastado con fuente identificada, período y limitaciones revisados. No autoriza publicación. |
| Aprobado para publicación | Autoridad competente designada autoriza esa versión y su alcance; evidencia y fecha registradas. |
| Publicado | Versión autorizada efectivamente disponible en URL, con fecha y referencia de entrega comprobadas. |
| Desactualizado | Se detecta pérdida de vigencia o una duda material; advertir o retirar según el riesgo y abrir revisión. |
| Retirado | Se deja de ofrecer el contenido; registrar motivo y reemplazo cuando exista. No implica borrar el historial de Git. |

Una objeción devuelve la pieza a recopilación/verificación con el motivo. Una modificación sustantiva abre una versión nueva y requiere nueva autorización; no hereda automáticamente la aprobación anterior. No usar silencio, CI satisfactorio o aprobación del diseño como autorización editorial.

## 4. Registro mínimo de procedencia

Mantener una ficha breve por pieza en el medio de revisión acordado; puede comenzar en el PR para material publicable. No crear infraestructura ni guardar comunicaciones internas en el repositorio para cumplir esta regla.

**Mínimo:** identificador/título y versión de la pieza; fuente y entidad emisora; documento/enlace o referencia de recepción; fecha/período pertinente (o “no consta”); fecha de consulta/recepción; estado de verificación; restricciones conocidas o pendientes; responsable de revisión si está designado.

**Solo cuando aplique:** página/sección, unidad y método de cálculo, ámbito territorial, licencia/permisos de imagen, versión sustituida, fecha prevista de revisión. No exigir unidades a una presentación ni licencia cartográfica a un contacto.

**Para autorizar/publicar:** registrar quién autorizó en calidad de qué responsable, cuándo, qué versión y para qué difusión; conservar referencia verificable de la evidencia en el canal autorizado. Añadir URL y fecha efectiva al publicar. No exponer firmas, correos privados o mensajes internos como evidencia pública.

El visitante debe ver la procedencia, período y límites necesarios para interpretar; los datos de gestión editorial pueden permanecer en un registro restringido. “No consta” permite conservar el pendiente, pero no supera una carencia esencial para autorizar publicación.

## 5. Flujo recomendado y responsabilidades por acordar

**Recopilar → verificar → revisar institucionalmente → autorizar → publicar → mantener.**

1. El equipo propone la pieza y solicita material; identifica huecos y evita completar hechos por inferencia.
2. Contrasta texto/datos con la fuente, registra discrepancias y prepara una versión accesible.
3. La persona designada por UGD revisa exactitud institucional, pertinencia y posibilidad de difusión. La coordinadora de UGD puede orientar y designar responsables; no se presume que deba aprobar todas las categorías.
4. El responsable con competencia acordada autoriza la versión concreta; si hay dudas legales o de privacidad, solicita revisión pertinente.
5. El responsable técnico comprueba versión, enlaces y artefacto. Publica únicamente con autorización editorial y autorización de despliegue; verifica la URL y registra la entrega.
6. El responsable de contenido revisa cambios y correcciones; el técnico aplica la versión autorizada.

Estos son **roles propuestos**, no nombramientos. El desarrollador o agente puede redactar propuestas, contrastar y ejecutar cambios autorizados; no certifica vigencia oficial ni se autoasigna aprobación institucional. La previsión de mantenimiento por el ingeniero requiere formalizar responsabilidades. Aprobar este documento tampoco nombra personas.

## 6. Prototipo y ejemplos

- Permitir estructura, etiquetas y contenido neutro de ejemplo para demostrar comportamiento. Rotular de forma visible “Ejemplo ficticio” o “Contenido pendiente de validación”, junto a la pieza y dentro de cualquier descarga demostrativa.
- Preferir marcadores como “[Nombre de autoridad pendiente]” o “[Indicador por validar]”. No inventar autoridades, cifras institucionales, resultados, documentos o declaraciones oficiales, aunque la interfaz parezca incompleta.
- Material histórico real puede ilustrar una consulta si muestra período, fuente y estado provisional; no presentarlo como situación vigente ni como dato ficticio.
- Mantener ejemplos identificables y separados del contenido autorizado. Antes de un lanzamiento oficial, retirarlos o sustituirlos por contenido autorizado y revisar también archivos descargables y artefactos.
- Un prototipo compartido no convierte sus datos en oficiales. Publicar una preview requiere autorización; los pendientes no bloquean por defecto el trabajo de diseño y desarrollo.

## 7. Actualización, corrección y retiro

| Caso | Acción propuesta |
| --- | --- |
| Error | Registrar evidencia, impacto y versión corregida. Cambios de significado/cifras requieren revisión y autorización; correcciones tipográficas pueden seguir una delegación editorial solo si se acuerda expresamente. |
| Cambio de autoridad/contacto | Confirmar el cambio y sustituir la pieza afectada; retirar o advertir datos antiguos para no orientar a un canal incorrecto. |
| Documento sustituido | Enlazar la nueva versión, marcar la anterior como histórica cuando proceda y conservar referencias compartidas mediante aviso o redirección. |
| Nuevo período de indicador | Añadir corte/versionado con su fuente; conservar el histórico y comprobar comparabilidad antes de calcular tendencias. |
| Desactualización | Revisar por evento y en la fecha acordada para cada categoría; no imponer una frecuencia ficticiamente oficial. |
| Enlace roto | Buscar ubicación oficial equivalente y contrastar identidad/versión; si no se encuentra, indicar indisponibilidad y ofrecer alternativa autorizada. |
| Solicitud de retiro | Registrar motivo, alcance y solicitante por canal autorizado; verificar competencia y escalar al responsable designado. Ante exposición sensible, activar atención prioritaria y solicitar contención autorizada. |

Historial mínimo: pieza/versión, fecha, motivo, cambio, referencia de autorización y entrega. Conservar versiones aprobadas sin sobreescribir la evidencia del cambio.

Revertir a una versión anterior solo si sigue siendo correcta, autorizada y segura; comprobar enlaces y disponibilidad después. Retirar de la página no elimina Git, cachés, artefactos ni copias descargadas: si hay exposición sensible, evaluar esos destinos con el responsable técnico. No reescribir historial compartido unilateralmente.

## 8. Privacidad y publicación

Clasificación operativa propuesta, sujeta a revisión institucional/jurídica:

- **Pública autorizada:** puede difundirse en el alcance aprobado.
- **Interna:** material de trabajo; no incorporarlo al sitio, repositorio o artefactos publicables.
- **Confidencial/restringida:** requiere canal y controles institucionales; fuera del portal.
- **Datos personales:** pueden aparecer en distintas categorías; revisar necesidad, autorización y minimización, sin asumir que estar disponibles en Internet permite republicarlos.

Confirmar uso de nombres/cargos y canales oficiales. Para fotografías, revisar procedencia, permisos y personas identificables; no usar imágenes que revelen atención sanitaria o información de pacientes. Revisar PDFs, anexos y metadatos para detectar datos personales, firmas, contactos o contenido interno antes de difundirlos.

No incluir historias clínicas, identificadores de pacientes ni datos sanitarios individuales. Los agregados también requieren evaluar riesgo de identificación. Esta guía no establece bases legales, plazos de conservación ni avisos de privacidad definitivos.

## 9. Criterio de aceptación para publicación oficial

- [ ] Pieza y versión identificadas, pertinentes al alcance validado.
- [ ] Exactitud contrastada, fuente localizable y período/vigencia correctamente expresados.
- [ ] Discrepancias y límites visibles; ninguna ausencia convertida en cero ni propuesta presentada como hecho.
- [ ] Restricciones, privacidad y permisos resueltos para la difusión prevista.
- [ ] Autorización verificable de la versión por responsable competente designado.
- [ ] Texto, imágenes, documentos y enlaces revisados según el sistema visual; alternativa accesible cuando corresponda.
- [ ] Sin ejemplos ni marcadores que aparenten contenido oficial terminado.
- [ ] Responsable de mantenimiento y siguiente revisión/evento acordados; entrega y reversión identificables.

Solo después del despliegue autorizado y comprobado cambia a “Publicado”. El prototipo utiliza las reglas de la sección 6 y no necesita fingir que satisface esta lista de lanzamiento.

## 10. Solicitudes y decisiones pendientes

Solicitar a la coordinadora de UGD, por prioridad (inventario detallado en [PRODUCT.md §8](PRODUCT.md)):

1. Quién valida cada categoría, quién autoriza difusión y qué evidencia/canal se aceptará; mecanismo de atención a errores o retiros.
2. Presentación, funciones, base normativa, autoridades/estructura y contacto respaldados; identidad y permisos de imágenes.
3. Datos actualizados de gestores, territorios, población e inversión por nivel de gestión y por nivel de atención, con fuentes, períodos, definiciones y discrepancias conocidas; fotografías autorizadas con su contexto.
4. Responsable de mantenimiento editorial, eventos/frecuencias de revisión y tratamiento de históricos.

Quedan por acordar roles, delegación de correcciones menores, registro editorial y su acceso, frecuencia de revisión y criterios jurídicos de privacidad/licencias. No seleccionar un CMS ni adoptar el flujo administrativo experimental para resolver estos pendientes. Registrar decisiones con evidencia y estado, sin crear obligaciones institucionales no aceptadas.
