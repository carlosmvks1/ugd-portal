import {loadConfig, localUrl} from './config.js';
const status = document.querySelector('#status');
try {
  const config = await loadConfig();
  const response = await fetch(localUrl(config.catalog, config.dataRoot));
  if (!response.ok) throw new Error('Catálogo no disponible');
  const catalog = await response.json();
  status.textContent = catalog.snapshots.length ? 'Catálogo disponible; visualización pendiente de implementación.' : 'Sin datos publicados. No hay cifras institucionales cargadas.';
} catch { status.textContent = 'No fue posible consultar los datos. Intente nuevamente más tarde.'; }
