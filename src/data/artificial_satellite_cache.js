const fs = require('node:fs/promises');
const path = require('node:path');

const CELESTRAK_ACTIVE_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=ACTIVE&FORMAT=JSON';
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

async function readCache(cachePath) {
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
}

async function writeCache(cachePath, catalog) {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  const temporaryPath = `${cachePath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(catalog), 'utf8');
  await fs.rename(temporaryPath, cachePath);
}

async function writeMetadata(metadataPath, metadata) {
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  const temporaryPath = `${metadataPath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(metadata), 'utf8');
  await fs.rename(temporaryPath, metadataPath);
}

async function getActiveSatelliteCatalog(userDataPath, options = {}) {
  const now = options.now ?? Date.now();
  const fetchData = options.fetchData ?? globalThis.fetch;
  const cacheDirectory = path.join(userDataPath, 'orbital-data');
  const cachePath = path.join(cacheDirectory, 'active-omm.json');
  const metadataPath = path.join(cacheDirectory, 'active-omm-meta.json');
  const cachedCatalog = await readCache(cachePath);
  const cacheMetadata = await readCache(metadataPath);
  const cachedElements = Array.isArray(cachedCatalog?.elements) ? cachedCatalog.elements : null;
  const lastAttemptAt = Number(cacheMetadata?.lastAttemptAt || cachedCatalog?.lastAttemptAt) || 0;

  if (now - lastAttemptAt < REFRESH_INTERVAL_MS) {
    if (cachedElements) {
      return {
        elements: cachedElements,
        fetchedAt: cachedCatalog.fetchedAt,
        stale: now - Number(cachedCatalog.fetchedAt) > REFRESH_INTERVAL_MS,
        source: 'CelesTrak',
        refreshDeferred: true
      };
    }
    throw new Error('A consulta orbital recente falhou. Tente novamente após algumas horas.');
  }

  try {
    await writeMetadata(metadataPath, { lastAttemptAt: now });
    const response = await fetchData(CELESTRAK_ACTIVE_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      throw new Error(`CelesTrak respondeu HTTP ${response.status}`);
    }

    const elements = await response.json();
    if (!Array.isArray(elements) || elements.length === 0) {
      throw new Error('A resposta do CelesTrak não contém elementos orbitais válidos.');
    }

    const catalog = {
      source: 'CelesTrak',
      fetchedAt: now,
      lastAttemptAt: now,
      elements
    };
    await writeCache(cachePath, catalog);
    await writeMetadata(metadataPath, { lastAttemptAt: now });

    return { elements, fetchedAt: now, stale: false, source: catalog.source };
  } catch (error) {
    if (cachedElements) {
      await writeMetadata(metadataPath, { lastAttemptAt: now });
      return {
        elements: cachedElements,
        fetchedAt: cachedCatalog.fetchedAt,
        stale: true,
        source: 'CelesTrak',
        refreshError: error.message
      };
    }

    throw new Error(`Não foi possível obter dados orbitais do CelesTrak: ${error.message}`);
  }
}

module.exports = { getActiveSatelliteCatalog };
