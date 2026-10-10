export function initializeAudioPlayer(audioControls) {
  const audioFiles = [{ name: 'Sfx Ufo Engine', path: 'sound/ufoengine.mp3' }];

  const audioTitle = document.getElementById('audio-title');
  const prevBtn = document.getElementById('prev-btn');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const nextBtn = document.getElementById('next-btn');
  const muteBtn = document.getElementById('mute-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const volumeIcon = document.getElementById('volume-icon');
  const muteIcon = document.getElementById('mute-icon');
  const closeAudioBtn = document.getElementById('close-audio-btn');

  const audio = new Audio();
  audio.loop = true;

  let currentTrackIndex = 0;
  let isPlaying = false;
  let initialPlayAttempted = false;
  let lastVolume = 1;

  const syncPlayState = (playing) => {
    isPlaying = playing;
    playIcon.style.display = playing ? 'none' : 'block';
    pauseIcon.style.display = playing ? 'block' : 'none';
  };

  const loadTrack = (index) => {
    currentTrackIndex = (index + audioFiles.length) % audioFiles.length;
    audio.src = audioFiles[currentTrackIndex].path;
    audioTitle.textContent = audioFiles[currentTrackIndex].name;

    if (isPlaying) {
      audio.play().catch((event) => {
        console.error('Erro de Autoplay/Load na troca de faixa:', event);
        syncPlayState(false);
      });
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause();
      syncPlayState(false);
      return;
    }

    audio
      .play()
      .then(() => syncPlayState(true))
      .catch(() => syncPlayState(false));
  };

  const toggleMute = () => {
    if (audio.muted) {
      audio.muted = false;
      audio.volume = lastVolume;
      volumeSlider.value = lastVolume * 100;
      volumeIcon.style.display = 'block';
      muteIcon.style.display = 'none';
      return;
    }

    lastVolume = audio.volume;
    audio.muted = true;
    volumeSlider.value = 0;
    volumeIcon.style.display = 'none';
    muteIcon.style.display = 'block';
  };

  const playNextTrack = () => {
    const shouldPlay = isPlaying;
    loadTrack(currentTrackIndex + 1);

    if (shouldPlay) {
      audio.play().catch((event) => {
        console.error('Erro de Autoplay/Load na proxima faixa:', event);
      });
    }
  };

  const playPrevTrack = () => {
    const shouldPlay = isPlaying;
    loadTrack(currentTrackIndex - 1);

    if (shouldPlay) {
      audio.play().catch((event) => {
        console.error('Erro de Autoplay/Load na faixa anterior:', event);
      });
    }
  };

  const initialPlayHandler = () => {
    if (initialPlayAttempted) {
      return;
    }

    initialPlayAttempted = true;
    audio
      .play()
      .then(() => syncPlayState(true))
      .catch(() => syncPlayState(false));

    document.removeEventListener('mousedown', initialPlayHandler);
    document.removeEventListener('keydown', initialPlayHandler);
  };

  audio.addEventListener('error', (event) => {
    console.error('ERRO CRITICO NO CARREGAMENTO DE AUDIO:', audio.src, event);
    if (isPlaying) {
      loadTrack(currentTrackIndex + 1);
    }
  });

  loadTrack(currentTrackIndex);

  prevBtn.addEventListener('click', playPrevTrack);
  playPauseBtn.addEventListener('click', togglePlayPause);
  nextBtn.addEventListener('click', playNextTrack);
  muteBtn.addEventListener('click', toggleMute);

  closeAudioBtn.addEventListener('click', () => audioControls.classList.remove('visible'));

  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
    if (audio.volume > 0) {
      audio.muted = false;
      volumeIcon.style.display = 'block';
      muteIcon.style.display = 'none';
    } else {
      audio.muted = true;
      volumeIcon.style.display = 'none';
      muteIcon.style.display = 'block';
    }
  });

  document.addEventListener('mousedown', initialPlayHandler, { once: true });
  document.addEventListener('keydown', initialPlayHandler, { once: true });
}
