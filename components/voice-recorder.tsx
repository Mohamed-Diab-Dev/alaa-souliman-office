"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

export function VoiceRecorder({
  onChange,
}: {
  onChange: (file: File | null) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    chunks.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    recorder.onstop = () => {
      const next = new Blob(chunks.current, { type: mime });
      const file = new File([next], mime.includes("mp4") ? "request.m4a" : "request.webm", {
        type: mime,
      });
      onChange(file);
      setUrl(URL.createObjectURL(next));
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  function clear() {
    onChange(null);
    if (url) URL.revokeObjectURL(url);
    setUrl("");
  }

  return (
    <div className="rounded-3xl border border-forest/10 bg-sand/60 p-5">
      <p className="mb-4 text-lg font-black text-forest">احكي طلبك بصوتك</p>
      <div className="flex flex-wrap items-center gap-3">
        {recording ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex h-16 items-center gap-2 rounded-full bg-rose-600 px-6 text-lg font-bold text-white"
          >
            <Square className="h-5 w-5 fill-current" />
            وقّف التسجيل
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex h-16 items-center gap-2 rounded-full bg-forest px-6 text-lg font-bold text-cream"
          >
            <Mic className="h-6 w-6" />
            اضغط واتكلم
          </button>
        )}
        {url ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-forest/15 px-4 font-semibold text-forest"
          >
            <Trash2 className="h-4 w-4" />
            امسح الصوت
          </button>
        ) : null}
      </div>
      {url ? <audio className="mt-4 w-full" controls src={url} /> : null}
    </div>
  );
}
