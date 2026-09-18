export function initializeVersionDisplay(version) {
  const versionDisplayElem = document.getElementById('version-display');
  if (versionDisplayElem) {
    versionDisplayElem.textContent = version;
  }
}
