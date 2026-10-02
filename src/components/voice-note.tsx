"use client";

import { useEffect, useRef, useState } from "react";
import { errorMessage, parseResponse } from "@/lib/http";
import type { VoiceIntake } from "@/lib/schemas";
import { buttonStyles } from "./ui";

const MAX_SECONDS = 120;
const RECORDING_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"];

type Status = "idle" | "recording" | "processing";

export function VoiceNote({ onExtracted }: { onExtracted: (intake: VoiceIntake) => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (seconds >= MAX_SECONDS) recorder.current?.stop();
  }, [seconds]);

  async function transcribe(file: File) {
    setStatus("processing");
    setError(null);
    try {
      const body = new FormData();
      body.append("audio", file);
      const intake = await parseResponse<VoiceIntake>(
        await fetch("/api/intake/voice", { method: "POST", body }),
      );
      onExtracted(intake);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setStatus("idle");
    }
  }

  async function startRecording() {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access was blocked. Allow it in your browser, or upload a recording instead.");
      return;
    }

    const mimeType = RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const media = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    media.ondataavailable = (event) => chunks.push(event.data);
    media.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const type = media.mimeType.split(";")[0];
      const extension = type.split("/")[1] ?? "webm";
      void transcribe(new File(chunks, `voice-note.${extension}`, { type }));
    };

    recorder.current = media;
    media.start();
    setSeconds(0);
    setStatus("recording");
  }

  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Start from a voice note</p>
          <p className="text-sm text-stone-500">
            Record the customer&apos;s voice note or your own call notes. The form fills itself for you to
            check.
          </p>
        </div>

        <div className="flex gap-2">
          {status === "recording" ? (
            <button
              type="button"
              onClick={() => recorder.current?.stop()}
              className={buttonStyles("primary")}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Stop · {formatDuration(seconds)}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={startRecording}
                disabled={status === "processing"}
                className={buttonStyles("secondary")}
              >
                Record
              </button>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={status === "processing"}
                className={buttonStyles("secondary")}
              >
                Upload audio
              </button>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="audio/*,.opus,.ogg,.m4a"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void transcribe(file);
            }}
          />
        </div>
      </div>

      {status === "processing" && <p className="mt-3 text-sm text-stone-600">Listening to the recording…</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
