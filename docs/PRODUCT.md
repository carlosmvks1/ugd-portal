# PRODUCT — Portal institucional UGD

Estado: definición de trabajo acordada con la coordinadora de UGD. Fija propósito, estructura y alcance del desarrollo; no aprueba textos, cifras, fotografías ni diseños concretos, que requieren revisión y autorización de publicación. Sustituye la definición anterior, que incluía biblioteca documental, consulta de convenios y sección de resultados.

## 1. Propósito

El portal es un sitio institucional público que explica **qué hace la UGD, dónde tiene presencia y cómo se distribuyen la población y la inversión vinculadas a su trabajo**. Fotografías y datos deben permitir entender esa labor de forma clara y verificable.

Debe dar a conocer la Unidad de Gestión Descentralizada de SESAL y presentar de manera comprensible:

- Su identidad, funciones y organización.
- Cómo funciona la descentralización en salud y cuál es el papel de la UGD.
- Los gestores y los territorios relacionados con su trabajo.
- La población reportada para esos territorios.
- La inversión por nivel de gestión y por nivel de atención, con categorías y períodos definidos por la institución.
- El trabajo de los equipos de salud mediante fotografías contextualizadas.

Pregunta que debe resolver el sitio: **«¿Qué hace la UGD, dónde lo hace y qué información permite conocer su alcance?»**

Tener dominio propio es una decisión confirmada del proyecto; su nombre exacto, configuración y servicio de alojamiento siguen pendientes.

## 2. Punto de partida

Hechos comprobados en el repositorio:

- El portal es una sola página (`index.html`) con las 7 secciones de §3, mapa SVG y listado/tabla territorial; `portal.html` solo redirige enlaces antiguos.
- El archivo territorial (`data/explorer/archive.json`) contiene un corte 2024 provisional (`official_unverified`): cobertura municipal con población, nivel de atención y gestor (39 etiquetas), sin convenios individuales y **sin datos de inversión**. La UGD entregará datos actualizados que lo sustituirán.
- El sitio público ya no muestra biblioteca documental, convenios ni observatorio. La administración interna experimental y el módulo del observatorio siguen en el repositorio, fuera del artefacto público.
- El contenido institucional (textos, gestores y sus fichas, vínculos territoriales, población, inversión, fotografías y contacto) tiene estructura, validación y vistas en `data/content/`; todas las piezas están pendientes de información y aprobación de la UGD ([pendientes](content-pending.md)).

## 3. Estructura propuesta

Nombres y agrupaciones son propuesta del equipo; el contenido dependerá del material institucional. No todas las secciones necesitan ser páginas independientes: las fotografías, por ejemplo, pueden integrarse en las secciones correspondientes. No se publican secciones vacías.

| Sección | Contenido | Resultado para el visitante |
| --- | --- | --- |
| **Inicio** | Presentación breve, fotografía representativa y accesos principales. | Identificar la UGD y saber qué puede consultar. |
| **Conocer la UGD** | Presentación, funciones, estructura, autoridades y fundamento legal pertinente. | Comprender su papel institucional. |
| **Descentralización en salud** | Explicación del modelo, participantes y responsabilidades. | Entender cómo funciona sin conocer previamente las siglas. |
| **Presencia territorial** | Gestores, territorios y población, mediante mapa y listado equivalente. | Consultar qué información existe para un lugar. |
| **Inversión** | Distribución por nivel de gestión y por nivel de atención, en los períodos que defina la UGD. | Interpretar montos y su alcance correctamente. |
| **Trabajo de los equipos** | Fotografías con descripción, lugar y fecha cuando estén disponibles. | Conocer actividades concretas. |
| **Contacto** | Canales institucionales confirmados. | Saber dónde dirigirse. |

Usuarios previstos: ciudadanía, municipalidades y organizaciones relacionadas, personal institucional, autoridades y otros interesados. No hay investigación con visitantes documentada; sus necesidades concretas son hipótesis que se validan en la revisión con la coordinadora de UGD y, si es posible, con pruebas de comprensión.

## 4. Alcance

Dentro: las secciones de §3, con fuentes que acompañan a las cifras.

Fuera:

- Repositorio o biblioteca de documentos.
- Catálogo y gestión de convenios.
- Sistemas internos, cuentas de empleados, informes internos y expedientes.
- Información de pacientes.
- Comparaciones históricas o indicadores que los datos disponibles no permitan sostener.

Las fuentes seguirán acompañando las cifras (emisor, título, fecha o período y enlace cuando exista), pero **citar una fuente no implica construir un repositorio documental**.

Población e inversión describen alcance y recursos; **por sí solas no demuestran resultados sanitarios ni impacto**. No se titula ninguna sección «Impacto» o «Resultados» sin evidencia que lo respalde.

## 5. Función del mapa

El mapa sirve para **consultar la presencia territorial de la UGD**. La base municipal actual (mapa, listado y tabla) se conserva y se alimentará con los datos actualizados que entregue la UGD.

- Al seleccionar un territorio se muestra únicamente lo que pueda relacionarse de forma verificable: gestor, población, período y, si los datos lo permiten, inversión y fotografías pertinentes.
- La unidad territorial de cada dato se respeta: si la inversión llega por gestor o por departamento, no se reparte ni se atribuye a municipios.
- El listado permite consultar lo mismo sin depender del mapa.
- El contenido institucional sigue disponible aunque falle la carga territorial.

## 6. Población e inversión

- **Población:** la reportada para cada territorio, con período, fuente y definición (por ejemplo, población cubierta o asignada). No se suman poblaciones que puedan solaparse.
- **Inversión:** se presentará por **nivel de gestión** y por **nivel de atención**. Las categorías exactas de cada nivel, la moneda, el tipo de monto (asignado, transferido, ejecutado u otro) y los períodos los define la UGD; el portal no los infiere.
- Cada cifra lleva período, fuente y definición. Los vacíos se muestran como «sin dato», nunca como cero.
- No se calculan comparaciones entre períodos, tendencias ni indicadores derivados (por ejemplo, inversión por habitante) sin metodología validada por la UGD.

## 7. Fotografías

- Cada fotografía lleva descripción y, cuando estén disponibles, lugar, fecha y autoría o crédito.
- Requiere autorización de uso; no se publican pacientes identificables sin consentimiento documentado.
- Se vinculan a un territorio o gestor solo cuando esa relación conste.
- Texto alternativo en todas las imágenes; las fotografías ilustran, no sustituyen la información.

## 8. Material institucional requerido

Material a recibir y registrar (paso 2 del plan). Para cada pieza se registra fuente, fecha o período, significado, estado de verificación y pendientes, según [gobernanza de contenidos](content-governance.md).

| Material | Uso | Qué hay que aclarar |
| --- | --- | --- |
| DO UGD (documento institucional) | Conocer la UGD, Descentralización | Textos aprobados, funciones, estructura, autoridades, fundamento legal. |
| Gestores | Presencia territorial | Nombre oficial, territorios asignados, período, relación con las etiquetas del archivo 2024. |
| Población | Presencia territorial | Unidad territorial, período, definición, fuente. |
| Inversión | Inversión, y Presencia territorial si aplica | Niveles de gestión y de atención, categorías, moneda, tipo de monto, períodos, unidad territorial. |
| Fotografías | Inicio, Trabajo de los equipos, otras secciones | Descripción, lugar, fecha, autorización de uso. |
| Contacto e identidad | Contacto, cabecera | Canales oficiales, logotipos y normas de uso. |
| Operación | Publicación | Responsable de aprobación, dominio, alojamiento, frecuencia de actualización. |

Mientras llega el material, se trabaja con marcadores explícitos. No se inventan cifras, autoridades ni textos oficiales, y los marcadores se resuelven o retiran antes de publicar.

## 9. Plan de trabajo

| Paso | Trabajo concreto | Condición para darlo por terminado |
| --- | --- | --- |
| **1. Actualizar la definición** | Corregir AGENTS.md, PRODUCT.md y las referencias pertinentes; retirar biblioteca y convenios del alcance. | La documentación expresa una misma dirección. |
| **2. Organizar el material institucional** | Recibir DO UGD, gestores, población, fotografías e inversión por niveles. Registrar fuente, fecha, significado y pendientes. | Se sabe qué puede usarse y qué falta aclarar. |
| **3. Diseñar los recorridos interiores** | Definir contenido y navegación de cada sección, aprovechando la portada existente. | Cada acceso conduce a información útil y comprensible. |
| **4. Implementar la presentación institucional** | Completar Conocer la UGD y Descentralización; retirar el acceso público a Documentos, Convenios y Observatorio. | El visitante puede entender la institución sin usar el mapa. |
| **5. Integrar territorio e inversión** | Adaptar mapa, listados y cifras a los datos recibidos. | Cada cifra tiene período, fuente y definición; los vacíos no aparecen como ceros. |
| **6. Revisar con la coordinadora de UGD** | Comprobar textos, relaciones territoriales, cifras, imágenes y prioridades. | Las correcciones y decisiones quedan registradas. |
| **7. Verificar y publicar la versión acordada** | Revisar móvil, teclado, enlaces, navegación, datos y actualización. | La versión funciona y cuenta con autorización de publicación. |

Prioridad inmediata: cerrar el paso 1 y preparar el inventario del paso 2. Después, cada cambio de interfaz tendrá un contenido y un propósito claros.

## 10. Criterios de éxito

Propuestas de evaluación, no resultados de pruebas:

| Objetivo | Cómo evaluar |
| --- | --- |
| Comprender la institución | El participante explica qué hace la UGD después de consultar Inicio y Conocer la UGD, sin usar el mapa. |
| Consultar un territorio | Encuentra gestor, población y período de un lugar, por mapa o por listado. |
| Interpretar cifras | Distingue período, «sin dato» y cero; no interpreta población o inversión como impacto. |
| Verificar | Cada cifra identifica fuente, período y definición; cada fotografía, descripción y, si consta, lugar y fecha. |
| Garantizar acceso | Evaluación manual y automática con WCAG 2.2 AA como objetivo: teclado, foco, móvil y alternativas al mapa. |
| Sostener la actualización | El responsable puede sustituir datos y fotografías mediante un procedimiento documentado. |

## 11. Decisiones y estado

| Estado | Decisión o cuestión |
| --- | --- |
| Acordado con la coordinadora de UGD | Propósito, estructura de §3 y exclusión de biblioteca documental y convenios. |
| Acordado con la coordinadora de UGD | Inversión por nivel de gestión y por nivel de atención. |
| Acordado con la coordinadora de UGD | El mapa municipal se conserva para presencia territorial; se actualizará con nuevos datos. |
| Confirmado del proyecto | Dominio propio; repositorio público; trabajo por ramas y PR; despliegue manual y autorizado conforme a AGENTS.md. |
| Confirmado como previsión operativa | El ingeniero de la unidad mantendría el sitio; falta formalizar responsabilidades y procedimiento. |
| Pendiente institucional | Textos, autoridades, categorías de inversión, datos actualizados, fotografías autorizadas, contactos, identidad visual y responsable de aprobación. |
| Pendiente técnico/operativo | Nombre y configuración del dominio, alojamiento, mecanismo de actualización y frecuencia. |
| Fuera de alcance | Biblioteca documental, convenios, observatorio como sección, administración interna, datos de pacientes, comparaciones históricas sin sustento. |

Registrar cambios de alcance o decisiones con motivo, evidencia y PR; distinguir propuesta, aceptación y sustitución de decisiones previas.

## 12. Aceptación de futuras funcionalidades

Una funcionalidad candidata debe:

- Responder a la pregunta guía del portal (§1) y encajar en una sección de §3; un cambio de alcance requiere acuerdo explícito con la coordinadora de UGD.
- Disponer de contenido publicable, responsable y mecanismo sostenible de actualización; el prototipo puede representar pendientes con marcadores explícitos.
- Aportar valor frente a una alternativa más simple.
- Tener criterios verificables de utilidad, accesibilidad, privacidad y rendimiento.
- Justificar costo, dependencias y mantenimiento.
- Ser revisada mediante PR con resultados reales de las comprobaciones pertinentes.

No añadir funcionalidades solo porque existan en el prototipo, aparezcan en otra web o sean posibles técnicamente.

## Referencias

- [AGENTS.md](../AGENTS.md): reglas de alcance y trabajo.
- [README](../README.md): entrada técnica.
- [Gobernanza de contenidos](content-governance.md): procedencia y estados editoriales.
- [Portal institucional](institutional-portal.md): prototipo anterior; biblioteca y convenios fuera de alcance.
- [Sistema visual](visual-system.md): referencia histórica; la dominancia del atlas queda superada.
- [Observatorio](observatory.md): fuera de alcance como sección; conservar sus cautelas metodológicas.
- [Explorador territorial](territorial-explorer.md) y [modelo de datos](data-model.md): base técnica de la presencia territorial.
