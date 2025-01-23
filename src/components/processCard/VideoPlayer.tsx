import { FC, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import StreamStats from "@/components/processCard/StreamStats";
import { InputProcess } from "@/types/processTypes";
import CollapseButton from "@/components/ui/CollapseButton";
import { useCollapse } from "@/hooks/useCollapse";

interface VideoPlayerProps {
  url: string;
  isRunning: boolean;
  refreshTrigger?: number;
  stats: InputProcess;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  url,
  isRunning,
  refreshTrigger,
  stats,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useCollapse('video-preview', stats.id);

  useEffect(() => {
    let hls = hlsRef.current;

    const initPlayer = () => {
      if (isRunning && url && Hls.isSupported() && videoRef.current && !isCollapsed) {
        setIsPlaying(false);
        setIsConnecting(true);

        if (hls) {
          hls.destroy();
        }

        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.on(Hls.Events.ERROR, () => {
          setIsPlaying(false);
          setIsConnecting(true);
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          retryTimeoutRef.current = setTimeout(initPlayer, 8000);
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsPlaying(true);
              setIsConnecting(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsConnecting(false);
            });
        });

        hlsRef.current = hls;
      } else {
        setIsPlaying(false);
        setIsConnecting(false);
      }
    };

    if (isRunning && !isCollapsed) {
      setIsConnecting(true);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      retryTimeoutRef.current = setTimeout(initPlayer, 5000);
    } else {
      setIsPlaying(false);
      setIsConnecting(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      setIsPlaying(false);
      setIsConnecting(false);
    };
  }, [url, isRunning, refreshTrigger, isCollapsed]);

  return (
    <div className="mt-2 p-3 bg-card-background dark:bg-card-background-dark rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1 group"
        >
          <CollapseButton 
            isCollapsed={isCollapsed} 
          />
          <h3 className="text-base font-medium text-text dark:text-text-dark">
            Preview
          </h3>
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div
            className="video-container relative"
            style={{ aspectRatio: "16 / 9" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              playsInline
              muted
              style={{ display: isPlaying ? "block" : "none" }}
            />
            {!isPlaying && (
              <div className="absolute bg-card-background dark:bg-card-background-dark inset-0 flex items-center justify-center text-text dark:text-text-dark">
                <div className="text-center">
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary dark:bg-primary-dark rounded-full animate-pulse"></div>
                      <p className="text-lg">Connecting...</p>
                    </div>
                  ) : (
                    <p className="text-lg">NO VIDEO</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <StreamStats input={stats} />
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
