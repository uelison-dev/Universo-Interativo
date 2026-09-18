export function initializeDateTime() {
  const currentDateElem = document.getElementById('current-date');
  const currentTimeElem = document.getElementById('current-time');

  if (!currentDateElem || !currentTimeElem) {
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const updateDateTime = () => {
    const now = new Date();
    currentDateElem.textContent = dateFormatter.format(now);
    currentTimeElem.textContent = timeFormatter.format(now);
  };

  updateDateTime();
  window.setInterval(updateDateTime, 1000);
}
