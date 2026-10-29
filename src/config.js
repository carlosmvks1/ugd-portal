export function localUrl(path, base) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\') || path.split('/').includes('..') || /^[a-z][a-z\d+.-]*:/i.test(path)) throw new Error('Se requiere una ruta relativa local');
  const url = new URL(path, base);
  if (url.origin !== new URL(base).origin) throw new Error('Origen no permitido');
  return url;
}
export function resolveConfig(raw, appRoot) {
  return {dataRoot:localUrl(raw.dataRoot, appRoot), geographyRoot:localUrl(raw.geographyRoot, appRoot), catalog:raw.catalog};
}
export async function loadConfig() {
  const appRoot = new URL('../', import.meta.url);
  const response = await fetch(new URL('config.json', appRoot));
  if (!response.ok) throw new Error('No se pudo cargar la configuración');
  return resolveConfig(await response.json(), appRoot);
}
