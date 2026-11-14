# Prototipos de las tres propuestas visuales

Prototipos locales para comparar direcciones de diseño. **No son el portal**, no se publican y el build rechaza cualquier archivo de `design/` en `dist/`. Contenido de ejemplo descrito en [propuestas-visuales.md](../../docs/propuestas-visuales.md#1-qué-es-ejemplo-y-qué-es-real-en-los-prototipos).

| Archivo | Opción |
| --- | --- |
| `opcion-1.html` | Institucional contemporánea |
| `opcion-2.html` | Salud y territorio |
| `opcion-3.html` | Presencia y datos |

Cada archivo admite `?vista=portada|municipio|ficha|incompleto`.

```bash
node design/propuestas/capturas.mjs --serve       # http://127.0.0.1:4174/opcion-1.html?vista=portada
node design/propuestas/generar-mapa.mjs          # regenera shared/mapa.js desde geography/ y el archivo 2024
node design/propuestas/capturas.mjs work/propuestas   # 24 capturas (3 opciones × 4 vistas × escritorio/móvil)
```

Las fuentes se cargan desde Google Fonts solo en los prototipos; la implementación final las autoalojará.
