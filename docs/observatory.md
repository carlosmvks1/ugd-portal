# Observatorio y seguimiento · tercera etapa

> **Estado:** documento histórico del prototipo. El observatorio, los indicadores de convenios y el seguimiento interno quedan **fuera del alcance** según [PRODUCT.md](PRODUCT.md); su acceso público se retira en el paso 4 del plan. Se conservan como regla sus cautelas: no atribuir causalidad, no comparar períodos sin metodología equivalente y no convertir ausencia en cero.

El módulo público añade seis indicadores nacionales: convenios totales, convenios I/II, municipios según tabla, municipios según texto y población de nivel I. Sus valores proceden de `snapshot.indicators`; no se suman poblaciones municipales, convenios o niveles que podrían solaparse. La discrepancia narrativa/tabla sigue visible.

## Comparabilidad

La tabla presenta valores originales y solo calcula diferencias cuando ambos períodos son de años distintos, están aprobados o archivados y tienen verificación `official_verified`. Deben tener el siguiente objeto opcional, validado y conservado en las exportaciones:

```json
{
  "comparison": {
    "methodology_id": "identificador-de-metodologia-aprobada",
    "source_id": "fuente-metodologica-registrada",
    "geography_version": "version-cartografica-documentada",
    "periodicity": "annual"
  }
}
```

La fuente debe existir y ambos períodos deben cubrir un año natural completo. Deben coincidir metodología, geografía y periodicidad. Registrar estos campos requiere evidencia y revisión institucional; el programa no puede demostrar por sí mismo la equivalencia metodológica. No se añadieron estos metadatos al archivo histórico actual, ni se modificaron sus estados.

La comparación es descriptiva y no acredita causalidad. Si falta un valor, no se calcula la variación de ese indicador. Una base cero permite diferencia absoluta pero no porcentaje. Un año con varias revisiones aporta solo la última a las barras, según la política común de versiones; las correcciones dentro del mismo año no son una tendencia temporal. Las barras son valores publicados de referencia, no una certificación de comparabilidad.

Los selectores permiten elegir versiones y compartir consulta con `obs_from`, `obs_to`, `obs_metric`. Conviven con los parámetros del atlas. CSV/JSON conservan razones para no calcular, unidades, versiones y referencias de fuente; JSON añade los metadatos públicos de los períodos y las definiciones. El archivo actual de 2024 no habilita una tendencia entre años.

## Calidad y actualización

Se muestran estado de verificación, falta de fecha de publicación/corte, discrepancia municipal, observaciones abiertas y ausencia de padrón individual. No se deduce una frecuencia de publicación ni un incumplimiento a partir de la fecha de importación. Los indicadores permanecen históricos hasta disponer de nuevas fuentes.

## Seguimiento interno

`GET /api/monitor`, con sesión, usa la última versión preparada (o la base inicial) y ofrece comprobaciones de calidad, conteos del circuito visibles para el rol y fechas de convenios. Edición solo cuenta sus borradores; revisión/publicación cuentan los que pueden consultar. No se publican borradores ni conteos administrativos en el portal estático.

Los vencimientos consideran únicamente convenios individuales del último período registrado con estado `active`. Los que tienen fecha inicial futura no se consideran vigentes todavía. Se señalan fechas finales pasadas cuyo estado sigue activo, fechas dentro de 90 días (incluido hoy) y convenios activos sin fecha final. Se calculan días en UTC; no se reescriben estados ni se certifica vigencia jurídica actual. Si no hay padrón, se muestra ausencia de evidencia, no un total ficticio de cero vencimientos.

Las alertas son consultas dentro del panel, sin envíos de correo, tareas automáticas o integraciones externas. Las conexiones con sistemas oficiales requerirán fuentes, permisos y contratos de intercambio definidos por la institución.
