import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type ActiveNodes = { gain: GainNode; stop: () => void };

export function Soundscape() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const nodesRef = useRef<ActiveNodes | null>(null);

  useEffect(() => {
    return () => {
      nodesRef.current?.stop();
      nodesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (nodesRef.current) nodesRef.current.gain.gain.value = volume;
  }, [volume]);

  function start() {
    const ctx = new AudioContext();

    // Brown noise via a leaky integrator over white noise.
    const bufferSize = 4096;
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0;
    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      }
    };

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    // Slow LFO on the filter cutoff so the texture breathes rather than sitting static.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    nodesRef.current = {
      gain,
      stop: () => {
        lfo.stop();
        noiseNode.disconnect();
        filter.disconnect();
        gain.disconnect();
        lfoGain.disconnect();
        void ctx.close();
      },
    };
    setPlaying(true);
  }

  function stop() {
    nodesRef.current?.stop();
    nodesRef.current = null;
    setPlaying(false);
  }

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <p className="text-sm text-muted-foreground">
        A soft ambient wash, generated live on your device — no recordings, nothing downloaded.
      </p>

      <button
        onClick={() => (playing ? stop() : start())}
        className="mt-8 grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
      >
        {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
      </button>

      <div className="mt-8 w-full">
        <label className="text-xs text-muted-foreground">Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </div>
    </div>
  );
}
