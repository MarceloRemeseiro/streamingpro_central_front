import { FC, useEffect, useRef, useState, memo } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  url: string;
  isRunning: boolean;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ url, isRunning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initPlayer = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.muted = true;
        video.play().catch(console.error);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Error de red, intentando reconectar...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Error de media, intentando recuperar...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Error fatal, destruyendo instancia...");
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    };

    if (isRunning) {
      setIsLoading(true);
      // Aumentamos el delay a 5 segundos para asegurar que el stream HLS esté disponible
      const timer = setTimeout(() => {
        initPlayer();
      }, 8000);

      return () => {
        clearTimeout(timer);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        setIsLoading(false);
      };
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsLoading(false);
    }
  }, [url, isRunning]);

  const containerStyle = {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%", // 16:9 aspect ratio (9/16 * 100)
  } as const;

  const contentStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  } as const;

  if (!isRunning) {
    return (
      <div
        style={containerStyle}
        className="bg-gray-800 rounded-tr-lg rounded-tl-lg overflow-hidden"
      >
        <div style={contentStyle} className="flex items-center justify-center">
          <p className="text-gray-400">Stream no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className="bg-black overflow-hidden">
      <video ref={videoRef} style={contentStyle} controls playsInline muted />
      {isLoading && (
        <div
          style={contentStyle}
          className="flex items-center justify-center bg-black/80"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-300">Conectando al stream...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(VideoPlayer);
