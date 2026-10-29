# Contrato de datos v1
Los esquemas JSON Schema 2020-12 están en data/schemas/. El validador local implementa únicamente las keywords utilizadas y rechaza keywords no soportadas.
Cada snapshot incluye metadatos y las seis colecciones completas; no se mezclan cortes para calcular indicadores.
No hay snapshots de ejemplo en el catálogo. Vacío significa sin publicar, no cobertura cero.

| Colección | Contenido y relaciones |
| --- | --- |
| gestores | Entidades gestoras institucionales; no personas ni contactos |
| convenios | Código, gestor_id, vigencia y estado; no documentos confidenciales |
| territorios | Código administrativo como texto, nivel, padre_id y fuentes |
| cobertura | Convenio, territorio, indicador, unidad, valor y periodo |
| fuentes | Institución, referencia pública, fecha de consulta y licencia |
| calidad | Hallazgo por entidad/registro, regla, severidad y resolución |

id es estable dentro de cada colección; nunca derivarlo del nombre. Cada registro sustantivo requiere fuente_ids.
codigo preserva ceros iniciales. Cada relación debe existir dentro del mismo snapshot.
valor=null representa ausencia o no aplicabilidad; cero solo se admite como valor reportado.
No sumar indicadores de distinta unidad o periodo; la definición de indicador y sus denominadores requiere validación institucional.
fecha_corte identifica la vigencia; publicado_en registra la publicación, ambas ISO YYYY-MM-DD.
No se presupone que fin=null signifique convenio vigente: consultar estado y evidencia.
Las fechas, IDs únicos, referencias, ciclos territoriales y estados de cobertura se validan automáticamente.
Los hallazgos de error pendientes bloquean el build; otros hallazgos deben acompañar la interpretación.

## Incorporar un corte
1. Revisar sensibilidad, autorización, fuentes y licencia fuera del repositorio.
2. Crear data/snapshots/<id>/snapshot.json conforme al esquema; no subir datos crudos.
3. Resolver errores y revisar vacíos, consistencia y metodología.
4. Agregar id, fecha_corte y path al catálogo; ejecutar validación y pruebas.
5. Revisar el contenido completo de dist antes de autorizar publicación.
6. Conservar cortes publicados inmutables; emitir un nuevo snapshot para correcciones.

## Geografía
GeoJSON WGS84 según RFC 7946; properties.territorio_id enlaza con territorios.
Antes de incorporarlo, revisar geometrías, coincidencia de códigos, procedencia y licencia.
La comprobación actual de build solo exige FeatureCollection e identificador territorial; no certifica topología ni límites oficiales.
