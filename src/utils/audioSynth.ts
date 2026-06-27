let audioCtx: AudioContext | null = null;
let sourceNodes: any[] = [];
let oscInterval: any = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  sourceNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {}
    try {
      node.disconnect();
    } catch (e) {}
  });
  sourceNodes = [];
  if (oscInterval) {
    clearInterval(oscInterval);
    oscInterval = null;
  }
}

export function startAmbientSound(type: string) {
  stopAmbientSound();
  const ctx = getAudioContext();
  
  if (type === 'Summer Rain') {
    // Generate pink noise for rain sound
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 * 0.5362;
      output[i] *= 0.11; // volume scaling
      b6 = white * 0.115926;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Add lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    
    // Volume control
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(0);
    sourceNodes.push(noise);
    
  } else if (type === 'Forest Wind') {
    // Wind uses white noise with custom resonant lowpass filter with moving cutoff frequency
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, ctx.currentTime);
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(0);
    sourceNodes.push(noise);
    
    // Animate the bandpass filter frequency to simulate gusts of wind
    let windTime = 0;
    oscInterval = setInterval(() => {
      windTime += 0.1;
      const baseFreq = 400;
      const wave = Math.sin(windTime) * Math.cos(windTime * 0.4);
      const freq = baseFreq + wave * 250;
      filter.frequency.setValueAtTime(Math.max(100, freq), ctx.currentTime);
      gainNode.gain.setValueAtTime(Math.max(0.05, 0.15 + wave * 0.1), ctx.currentTime);
    }, 100);
    
  } else if (type === 'Lofi Focus Beat') {
    // Generates a calming chord progression (sine waves) + a subtle kick drum pulse
    let time = 0;
    const playLofiNotes = () => {
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // C major 7
        [146.83, 174.61, 220.00, 261.63], // D minor 7
        [164.81, 196.00, 246.94, 293.66], // E minor 7
        [174.61, 220.00, 261.63, 329.63]  // F major 7
      ];
      
      const chord = chords[Math.floor(time / 4) % chords.length];
      chord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Soft envelope
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 4);
        sourceNodes.push(osc);
      });
      
      // Kick drum pulse
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(120, ctx.currentTime);
      kickOsc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      kickGain.gain.setValueAtTime(0.12, ctx.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start();
      kickOsc.stop(ctx.currentTime + 0.4);
      sourceNodes.push(kickOsc);
      
      time += 4;
    };
    
    playLofiNotes();
    oscInterval = setInterval(playLofiNotes, 4000);
    
  } else if (type === 'Ocean Waves') {
    // Wave sound: white noise with slow volume modulation (LFO)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noise.start(0);
    sourceNodes.push(noise);
    
    let waveTime = 0;
    oscInterval = setInterval(() => {
      waveTime += 0.05;
      const lfo = (Math.sin(waveTime) + 1) / 2; // 0 to 1
      gainNode.gain.setValueAtTime(Math.max(0.01, lfo * 0.22), ctx.currentTime);
      filter.frequency.setValueAtTime(250 + lfo * 350, ctx.currentTime);
    }, 50);
  }
}
