// AudioWorkletProcessor for 24kHz PCM audio capture
class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = (options && options.processorOptions && options.processorOptions.sampleRate) || 24000;
    this.buffer = new Int16Array(1200); // 50ms chunk at 24kHz (24000 * 0.05)
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const inputChannel = input[0];
    if (!inputChannel) return true;

    const sourceSampleRate = sampleRate; // Global sampleRate inside AudioWorklet Global Scope
    const ratio = sourceSampleRate / this.targetSampleRate;

    for (let i = 0; i < inputChannel.length; i += ratio) {
      const idx = Math.floor(i);
      if (idx >= inputChannel.length) break;

      const sample = Math.max(-1, Math.min(1, inputChannel[idx]));
      // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
      const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

      this.buffer[this.bufferIndex++] = Math.round(int16Sample);

      if (this.bufferIndex >= this.buffer.length) {
        // Send a copy of the buffer to the main thread
        this.port.postMessage(this.buffer.slice(0, this.bufferIndex));
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
