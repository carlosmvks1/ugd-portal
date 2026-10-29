# Contrato del mapa
El frontend usa módulos ES y puede incorporar MapLibre GL JS o Leaflet mediante un adaptador aquí.
No se incluye todavía motor, proveedor de teselas ni cartografía.
El adaptador recibirá contenedor, GeoJSON y selección territorial; emitirá territorio_id.
Usar properties.territorio_id como clave estable, nunca el nombre.
GeoJSON RFC 7946: WGS84, longitud/latitud. No inferir límites desde datos de cobertura.
Proveer alternativa tabular, controles de teclado, atribución y estado sin datos.
Configurar proveedor/licencia antes de activar peticiones a servicios externos.
