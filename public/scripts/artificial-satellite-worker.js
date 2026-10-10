import {
  eciToGeodetic,
  gstime,
  json2satrec,
  propagate
} from '../../node_modules/satellite.js/dist/index.js';

const EARTH_RADIUS_SCENE = 4;
const ALTITUDE_SCALE = 0.00035;
const ORBIT_SAMPLES = 180;
let satellites = [];
let updateTimer = null;
let selectedCatalogId = null;
let lastOrbitUpdateAt = 0;

function scheduleNextUpdate() {
  updateTimer = setTimeout(() => {
    sendPositions();
    scheduleNextUpdate();
  }, 1000);
}

function toScenePosition(satellite, date, referenceGmst = gstime(date)) {
  const state = propagate(satellite.satrec, date);
  if (
    !state?.position ||
    ![state.position.x, state.position.y, state.position.z].every(Number.isFinite)
  ) {
    return null;
  }

  const geodetic = eciToGeodetic(state.position, referenceGmst);
  const latitude = geodetic.latitude;
  const longitude = geodetic.longitude;
  const altitude = geodetic.height;
  if (![latitude, longitude, altitude].every(Number.isFinite)) return null;
  const radius = EARTH_RADIUS_SCENE + altitude * ALTITUDE_SCALE;
  const cosLatitude = Math.cos(latitude);

  return {
    x: radius * cosLatitude * Math.cos(longitude),
    y: radius * Math.sin(latitude),
    z: -radius * cosLatitude * Math.sin(longitude),
    altitudeKm: geodetic.height
  };
}

function sendPositions() {
  if (satellites.length === 0) return;
  const positions = new Float32Array(satellites.length * 3);
  const now = new Date();

  satellites.forEach((satellite, index) => {
    const point = toScenePosition(satellite, now);
    if (!point) return;
    const offset = index * 3;
    positions[offset] = point.x;
    positions[offset + 1] = point.y;
    positions[offset + 2] = point.z;
  });

  self.postMessage({ type: 'positions', positions }, [positions.buffer]);
  if (selectedCatalogId && Date.now() - lastOrbitUpdateAt >= 15000) {
    sendSelectedOrbit(selectedCatalogId, now);
  }
}

function sendSelectedOrbit(catalogId, now = new Date()) {
  const satellite = satellites.find((entry) => entry.catalogId === catalogId);
  if (!satellite) return;
  lastOrbitUpdateAt = Date.now();

  const periodMinutes = (2 * Math.PI) / satellite.satrec.no;
  const referenceGmst = gstime(now);
  const currentPosition = toScenePosition(satellite, now, referenceGmst);
  if (!currentPosition) return;

  const orbitPoints = [];
  for (let index = 0; index <= ORBIT_SAMPLES; index += 1) {
    const offsetMinutes = (index / ORBIT_SAMPLES - 0.5) * periodMinutes;
    const date = new Date(now.getTime() + offsetMinutes * 60000);
    const point = toScenePosition(satellite, date, referenceGmst);
    if (!point) continue;
    orbitPoints.push(point.x, point.y, point.z);
  }
  if (orbitPoints.length < 6) return;
  const points = new Float32Array(orbitPoints);

  self.postMessage(
    {
      type: 'selected-orbit',
      catalogId,
      points,
      details: {
        name: satellite.name,
        catalogId: satellite.catalogId,
        epoch: satellite.epoch,
        inclination: satellite.inclination,
        eccentricity: satellite.eccentricity,
        periodMinutes,
        altitudeKm: currentPosition.altitudeKm
      }
    },
    [points.buffer]
  );
}

self.onmessage = (event) => {
  const message = event.data || {};

  if (message.type === 'load') {
    if (updateTimer) clearInterval(updateTimer);
    satellites = [];
    selectedCatalogId = null;
    lastOrbitUpdateAt = 0;

    (message.elements || []).forEach((element) => {
      try {
        const satrec = json2satrec(element);
        const meanMotion = Number(element.MEAN_MOTION);
        if (satrec.error || !Number.isFinite(meanMotion) || meanMotion <= 0) return;

        satellites.push({
          satrec,
          catalogId: String(element.NORAD_CAT_ID),
          name: element.OBJECT_NAME || `Satélite ${element.NORAD_CAT_ID}`,
          epoch: element.EPOCH || '',
          meanMotion,
          inclination: Number(element.INCLINATION) || 0,
          eccentricity: Number(element.ECCENTRICITY) || 0
        });
      } catch {
        // Registros inválidos ficam fora da visualização sem interromper o lote.
      }
    });

    self.postMessage({
      type: 'catalog-ready',
      satellites: satellites.map(
        ({ catalogId, name, epoch, meanMotion, inclination, eccentricity }) => ({
          catalogId,
          name,
          epoch,
          meanMotion,
          inclination,
          eccentricity
        })
      )
    });
    sendPositions();
    scheduleNextUpdate();
    return;
  }

  if (message.type === 'select') {
    selectedCatalogId = String(message.catalogId);
    sendSelectedOrbit(selectedCatalogId);
    return;
  }

  if (message.type === 'clear-selection') {
    selectedCatalogId = null;
    return;
  }

  if (message.type === 'stop') {
    if (updateTimer) clearInterval(updateTimer);
    updateTimer = null;
    satellites = [];
    selectedCatalogId = null;
  }
};
