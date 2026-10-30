# Contrato del mapa
El frontend usa módulos ES y SVG sin motor ni teselas externas.
model.js separa estado, filtros, derivados y exportación del DOM; geometry.js proyecta polígonos; explorer.js sincroniza mapa, panel, tabla, búsqueda e historial.
El estado compartido identifica territorio, año, versión, filtros y capa. Las geometrías municipales se cargan por departamento y se guardan en memoria. Las respuestas tardías no cambian la vista activa.
Usar properties.territorio_id como clave estable, nunca el nombre.
GeoJSON RFC 7946: WGS84, longitud/latitud. No inferir límites desde datos de cobertura.
Proveer alternativa tabular, controles de teclado, atribución y estado sin datos.
Configurar proveedor/licencia antes de activar peticiones a servicios externos.
