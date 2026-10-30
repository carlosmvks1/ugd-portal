# Arquitectura
Base estática sin dependencias externas: HTML, CSS y módulos ES; Node 22+ para validación, pruebas y empaquetado.
No se ha elegido un framework; src/ permite incorporar componentes o un bundler sin modificar los contratos de datos.
public/ contiene recursos explícitamente publicables; data/ contiene contratos y snapshots; geography/ cartografía.
El build usa una lista explícita de archivos. No copia esquemas, scripts, tests, fuentes internas ni documentación.
Distinción esencial: repositorio privado no implica sitio privado. Todo recurso servido por el frontend es descargable.
No incluir pacientes, identificadores personales, teléfonos, credenciales, contactos individuales ni convenios íntegros.
Los esquemas rechazan campos no previstos, pero no sustituyen revisión humana del contenido.
No hay autenticación, backend, teselas externas ni publicación automática. El explorador incorpora el archivo histórico provisional registrado mediante catalog.explorer. Su validación territorial es independiente del contrato contractual 1.0.0: no inventa contratos o fechas ausentes. Ver territorial-explorer.md.
