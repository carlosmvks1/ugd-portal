# Administración interna · segunda etapa

Esta aplicación es un servicio Node separado del portal estático. Incluye SQLite persistente, acceso local por usuarios, importación JSON/CSV, comparación detallada, borradores versionados, revisión independiente, preparación de paquetes e historial. No se copia a `dist/`, no contiene usuarios predeterminados y no despliega ni modifica automáticamente los archivos del portal público.

## Inicio local

Requiere Node **22.13 o posterior** por `node:sqlite` (puede mostrar una advertencia experimental). No añade dependencias de servidor.

Crear tres cuentas personales distintas, una por función. En una terminal Bash, introducir cada contraseña sin mostrarla ni guardarla en argumentos o historial:

```bash
read -r -s -p 'Contraseña de edición (12–256 caracteres): ' ugd_password
printf '%s' "$ugd_password" | npm run admin:user -- nombre.edicion editor
unset ugd_password
```

Repetir para `nombre.revision reviewer` y `nombre.publicacion publisher`, con contraseñas individuales. Después ejecutar:

```sh
npm run admin
```

Abrir `http://127.0.0.1:4174`. No existe registro público de cuentas. Para restablecer una contraseña, usar el mismo mecanismo de entrada con `npm run admin:user -- nombre.edicion reset`; se revocan sus sesiones existentes.

La base se almacena en `work/admin/portal.sqlite`, fuera de `dist/` y excluida de Git mediante `work/`. Guarda usuarios, hashes de contraseña, sesiones, límites de intentos, datos, revisiones, eventos y paquetes. La copia inicial del archivo territorial se conserva en SQLite; un reinicio no reemplaza la base por el archivo del repositorio.

## Circuito de trabajo

1. **Edición** inicia un borrador desde el último paquete preparado, o desde la base inicial si no hay paquetes. Carga un archivo territorial JSON o actualiza cobertura con CSV. Puede editar JSON, validar y revisar diferencias antes de guardar.
2. La comparación muestra registros añadidos, eliminados y modificados por tabla, con valores anteriores y nuevos. Se conserva cada revisión guardada. Una carga inválida no sobrescribe el borrador. Los cambios de dos sesiones no pueden sobrescribirse: se exige la revisión esperada. También se comprueba que la base cargada al iniciar un borrador no haya cambiado antes de su primer guardado. La comparación de una versión guardada conserva su base original incluso después de preparar el paquete.
3. Edición guarda y envía. No puede modificar un envío pendiente. Una persona con rol de **revisión** debe aprobarlo o devolverlo con comentario obligatorio. Al corregir una devolución, el borrador vuelve a necesitar revisión.
4. **Publicación**, independiente del autor y del revisor, prepara un paquete aprobado. Si otro paquete cambió la base desde que se creó el borrador, debe prepararse otro borrador sobre la versión vigente; se bloquea la publicación desactualizada.
5. El paquete JSON descargable contiene `archive`, `data_quality_issues` y un `manifest` con identificadores, fecha, responsables y SHA-256 del archivo territorial serializado compacto. Las cuentas de revisión/publicación pueden descargarlo. Sus datos e historial quedan conservados; no hay rutas de modificación o borrado de versiones publicadas.

La aprobación del paquete es un acto del flujo de publicación: **no cambia automáticamente** `status`, `verification_status`, fechas ni fuentes del histórico. No convierte una etiqueta de gestor en identidad jurídica confirmada.

## Importación

JSON debe ser el archivo territorial completo conforme a `src/map/contract.js`. No se aceptan propiedades desconocidas, fechas imposibles ni relaciones rotas.

CSV es exclusivamente una actualización de `coverage`, con codificación UTF-8, separador coma, comillas dobles y encabezados del contrato. Puede exportarse desde Excel como CSV UTF-8. `.xlsx` no se interpreta en esta entrega. Las claves obligatorias son `snapshot_id`, `territory_id` y `care_level`. Se conservan los códigos como texto, incluidos ceros iniciales. Los campos numéricos admiten enteros; celdas vacías representan `null` en campos anulables. `agreement_ids` separa IDs con punto y coma. Se rechazan columnas y claves repetidas. Filas omitidas **no se eliminan**. Las filas nuevas requieren los campos obligatorios del contrato. Nuevas versiones, fuentes o entidades se incorporan mediante el JSON completo antes de enlazarlas con CSV.

La plantilla descargable contiene la cobertura vigente; importar esa misma plantilla conserva sus registros. Límite por petición: 4 MB. No introducir datos personales o internos en campos de texto permitidos: la validación estructural no sustituye la revisión de contenido.

## Entrega del paquete

Una persona responsable puede copiar `archive` y `data_quality_issues` del paquete aprobado a sus rutas de `data/explorer/`, conservar el manifiesto como evidencia y ejecutar pruebas, validación y build en una revisión identificada. Este paso sigue el proceso institucional de autorización/despliegue. No copiar SQLite, usuarios, historial administrativo o borradores al alojamiento público. Las fuentes documentales y la cartografía conservan su proceso de revisión propio.

## Configuración y operación

- `UGD_ADMIN_DB`: ruta de la base persistente (usar siempre la misma ruta al crear usuarios y arrancar el servicio).
- `UGD_ADMIN_PORT`: puerto, 4174 por defecto.
- `UGD_ADMIN_HOST`: interfaz de escucha, `127.0.0.1` por defecto.
- `UGD_ADMIN_ORIGIN`: origen exacto permitido, por defecto `http://127.0.0.1:4174` (ajustado al puerto configurado). Para un servicio institucional detrás de proxy debe ser el origen HTTPS oficial, sin ruta. El proxy debe conservar `Host`.

Las contraseñas usan scrypt con sal aleatoria, y las sesiones opacas se almacenan con hash, duran ocho horas y se revocan al salir o restablecer contraseña. Las cookies son HttpOnly y SameSite=Strict; con origen HTTPS se añade Secure. Las operaciones de escritura requieren origen exacto y JSON. Se valida Host, se limita el tamaño de entrada y se aplican CSP y no-store. Los roles se comprueban en el servidor. Los intentos fallidos se limitan en SQLite por usuario e IP; no se confía en encabezados de IP reenviada.

Para operación real, la institución debe definir responsables de cuentas, dominio/HTTPS, respaldo y recuperación de la base y acceso al servidor. La entrega incluye autenticación local; no incluye SSO institucional, MFA ni un servicio de correo. El historial registra acciones del servicio, pero no es evidencia inviolable frente a una persona que controle directamente el archivo SQLite.

Detener el servicio antes de copiar la base con sus archivos auxiliares; conservar respaldos con acceso restringido. No almacenar la base en un filesystem compartido no confiable. Para revocar acceso de una cuenta antes de contar con un gestor de cuentas, restablecer su contraseña a un valor nuevo y no entregarlo; sus sesiones se invalidan.

## Comprobaciones

`npm test` incluye permisos, sesiones, limitación de intentos, importaciones, cambios concurrentes, devoluciones, publicación obsoleta, integridad del paquete, persistencia y protección de API. `npm run test:admin-browser` prueba el circuito con tres cuentas sintéticas en memoria, descarga y móvil. Las cuentas y los paquetes de esas pruebas nunca se guardan como datos institucionales.
