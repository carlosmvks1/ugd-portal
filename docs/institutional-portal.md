# Primera etapa institucional

El portal incorpora presentación institucional, biblioteca documental, directorio de registros de gestores y consulta de convenios, conservando el atlas territorial.

La biblioteca se deriva de `archive.sources`: los años se obtienen de los períodos que citan la fuente o de su validez cartográfica histórica. `retrieved_at` es fecha de consulta y no se presenta como fecha de publicación. Los enlaces conducen a las fuentes originales; no se descargan ni redistribuyen documentos automáticamente. La búsqueda común consulta títulos, emisores, etiquetas, nombres e identificadores; período y tipo filtran exclusivamente la biblioteca. Los estados sin coincidencias se explican en cada módulo.

Las fichas de gestores muestran nombre jurídico solo cuando esté registrado y conservan la etiqueta original y el estado de verificación. Los vínculos territoriales se crean exclusivamente mediante `manager_id`, nunca por similitud de nombres. Los convenios individuales proceden de `archive.agreements`; el agregado anual se mantiene separado. El archivo actual contiene 39 etiquetas de gestores y ningún convenio individual. Las cifras agregadas no generan expedientes ficticios.

Para publicar mandatos, organigramas, normativa o contactos oficiales se necesitan documentos y canales aprobados por UGD. Esta entrega no añade atribuciones legales ni contactos sin respaldo. El mantenimiento sigue el contrato y la validación descritos en territorial-explorer.md; un campo documental nuevo exige revisar el contrato público. La administración de contenidos y aprobación por roles corresponden a la segunda etapa.

Verificación: pruebas del modelo documental/relaciones, suite de navegador con búsqueda, filtros y apertura de fichas, además de las pruebas de contratos y publicación existentes. El mismo build relativo funciona bajo subdirectorios.
