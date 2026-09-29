export function initializeControlPanels({ planets, moons, majorTNOs, tnos, comets, kuiperGroup }) {
  const visibilityBtn = document.getElementById('visibility-btn');
  const visibilityMenu = document.getElementById('visibility-menu');
  const reopenAudioBtn = document.getElementById('reopen-audio-btn');
  const audioControls = document.getElementById('audio-controls');
  const infoBtn = document.getElementById('info-btn');
  const navigationLegend = document.getElementById('navigation-legend');
  const togglePlanetsOrbits = document.getElementById('toggle-planets-orbits');
  const toggleSatellitesOrbits = document.getElementById('toggle-satellites-orbits');
  const toggleTnosOrbits = document.getElementById('toggle-tnos-orbits');
  const toggleCometsOrbits = document.getElementById('toggle-comets-orbits');
  const toggleMajorTnosOrbits = document.getElementById('toggle-major-tnos-orbits');
  const syncButtonStates = () => {
    visibilityBtn.classList.toggle('active', visibilityMenu.classList.contains('visible'));
    reopenAudioBtn.classList.toggle('active', audioControls.classList.contains('visible'));
    infoBtn.classList.toggle('active', !navigationLegend.classList.contains('minimized'));
  };

  kuiperGroup.visible = false;
  planets.forEach((planet) => planet.trail && (planet.trail.line.visible = false));
  majorTNOs.forEach((tno) => tno.trail && (tno.trail.line.visible = false));
  tnos.forEach((tno) => tno.trail && (tno.trail.line.visible = false));
  comets.forEach((comet) => {
    if (comet.trail) comet.trail.line.visible = false;
  });
  moons.forEach(({ trail }) => trail && (trail.line.visible = false));

  visibilityBtn.addEventListener('click', () => {
    visibilityMenu.classList.toggle('visible');
    audioControls.classList.remove('visible');
    navigationLegend.classList.add('minimized');
    syncButtonStates();
  });

  reopenAudioBtn.addEventListener('click', () => {
    audioControls.classList.toggle('visible');
    visibilityMenu.classList.remove('visible');
    navigationLegend.classList.add('minimized');
    syncButtonStates();
  });

  infoBtn.addEventListener('click', () => {
    navigationLegend.classList.toggle('minimized');
    visibilityMenu.classList.remove('visible');
    audioControls.classList.remove('visible');
    syncButtonStates();
  });

  document.addEventListener('click', (event) => {
    const controlsContainer = document.getElementById('controls-container');
    const zoomContainer = document.getElementById('zoom-controls-container');

    if (
      !controlsContainer.contains(event.target) &&
      !audioControls.contains(event.target) &&
      !zoomContainer.contains(event.target)
    ) {
      visibilityMenu.classList.remove('visible');
      audioControls.classList.remove('visible');
      syncButtonStates();
    }
  });

  const panelObserver = new MutationObserver(syncButtonStates);
  [visibilityMenu, audioControls, navigationLegend].forEach((element) => {
    panelObserver.observe(element, { attributes: true, attributeFilter: ['class'] });
  });

  syncButtonStates();

  togglePlanetsOrbits.addEventListener('change', (event) => {
    planets.forEach((planet) => {
      if (planet.trail) {
        planet.trail.line.visible = event.target.checked;
      }
    });
  });

  toggleSatellitesOrbits.addEventListener('change', (event) => {
    moons.forEach(({ trail }) => {
      if (trail) trail.line.visible = event.target.checked;
    });
  });

  toggleMajorTnosOrbits.addEventListener('change', (event) => {
    majorTNOs.forEach((tno) => {
      if (tno.trail) {
        tno.trail.line.visible = event.target.checked;
      }
    });
  });

  toggleTnosOrbits.addEventListener('change', (event) => {
    tnos.forEach((tno) => {
      if (tno.trail) tno.trail.line.visible = event.target.checked;
    });

    kuiperGroup.visible = event.target.checked;
  });

  toggleCometsOrbits.addEventListener('change', (event) => {
    comets.forEach((comet) => {
      if (comet.trail) {
        comet.trail.line.visible = event.target.checked;
      }
    });
  });
}
