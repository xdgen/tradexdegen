import { useState, useRef, useEffect } from "react";
import { Mic, Video, Square } from "lucide-react";
import { Button } from "../ui/button";

interface MediaRecorderProps {
  onRecordingComplete: (
    blob: Blob,
    type: "audio" | "video",
    duration: number
  ) => void;
  type: "audio" | "video";
}

export function MediaRecorder({
  onRecordingComplete,
  type,
}: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  //   const startRecording = async () => {
  //     setError(null);

  //     try {
  //       if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //         throw new Error("Media devices not supported in this browser");
  //       }

  //       const constraints =
  //         type === "audio"
  //           ? { audio: true, video: false }
  //           : { audio: true, video: true };

  //       const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //       streamRef.current = stream;

  //       let mediaRecorder: MediaRecorder;
  //       try {
  //         mediaRecorder = new MediaRecorder(stream, {
  //           mimeType: type === "audio" ? "audio/webm" : "video/webm",
  //         });
  //       } catch (e) {
  //         // Fallback without mimeType if not supported
  //         mediaRecorder = new MediaRecorder(stream);
  //       }

  //       mediaRecorderRef.current = mediaRecorder;
  //       chunksRef.current = [];

  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data && event.data.size > 0) {
  //           chunksRef.current.push(event.data);
  //         }
  //       };

  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(chunksRef.current, {
  //           type: type === "audio" ? "audio/webm" : "video/webm",
  //         });
  //         const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

  //         try {
  //           onRecordingComplete(blob, type, duration);
  //         } catch (err) {
  //           console.error("[v0] Error in onRecordingComplete callback:", err);
  //         }

  //         // Cleanup
  //         if (streamRef.current) {
  //           streamRef.current.getTracks().forEach((track) => track.stop());
  //           streamRef.current = null;
  //         }
  //       };

  //       mediaRecorder.onerror = (event) => {
  //         console.error("[v0] MediaRecorder error:", event);
  //         setError("Recording error occurred");
  //         stopRecording();
  //       };

  //       startTimeRef.current = Date.now();
  //       mediaRecorder.start(100); // Collect data every 100ms
  //       setIsRecording(true);
  //       setRecordingTime(0);

  //       // Start timer
  //       timerRef.current = setInterval(() => {
  //         setRecordingTime((prev) => prev + 1);
  //       }, 1000);
  //     } catch (err) {
  //       console.error("[v0] Error starting recording:", err);
  //       const errorMessage =
  //         err instanceof Error ? err.message : "Could not access media devices";
  //       setError(errorMessage);

  //       // Cleanup on error
  //       if (streamRef.current) {
  //         streamRef.current.getTracks().forEach((track) => track.stop());
  //         streamRef.current = null;
  //       }
  //     }
  //   };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setRecordingTime(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          //   onClick={startRecording}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          type="button"
          title={error || `Record ${type}`}
        >
          {type === "audio" ? (
            <Mic className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-white font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRecording}
            className="text-red-400 hover:text-red-300 hover:bg-zinc-700 h-8 w-8"
            type="button"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && (
        <span
          className="text-xs text-red-400 max-w-[200px] truncate"
          title={error}
        >
          {error}
        </span>
      )}
    </div>
  );
}
