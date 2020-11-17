
const context = new AudioContext();
const playButton: HTMLButtonElement | null = document.querySelector('#play');
loadSound('/sounds/blip.mp3');

function loadSound(blipURL: string): void {
  if (!!playButton) {
    let blipBuffer: AudioBuffer;
    window.fetch(blipURL)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        playButton.disabled = false;
        blipBuffer = audioBuffer;
      });
    playButton.onclick = () => playAudio(blipBuffer);
  }
}

function playAudio(audioBuffer: AudioBuffer): void {
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start();
}