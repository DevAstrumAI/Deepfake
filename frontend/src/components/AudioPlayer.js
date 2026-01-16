import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  SkipBack,
  SkipForward
} from 'lucide-react';

const AudioPlayer = ({ audioUrl, title = "Audio File", className = "" }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set preload and crossOrigin for better compatibility
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Audio error:', e);
      const error = e.target.error;
      let errorMessage = 'Failed to load audio file';
      
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio. Please check your connection.';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Unable to decode audio data. The audio file may use a codec that is not supported by your browser. Try converting the file to a standard PCM WAV format.';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported by your browser. Supported formats: WAV (PCM), MP3, OGG, AAC. If your file is WAV, it may need to be converted to PCM format.';
            break;
          default:
            errorMessage = `Audio error: ${error.message || 'Unknown error'}. The file may use an unsupported codec or format.`;
        }
      } else {
        // Fallback error message if error object is not available
        errorMessage = 'Unable to load audio file. The file format may not be supported by your browser.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };
    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Try to load the audio
    if (audioUrl) {
      audio.load();
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        No audio file provided
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
        <div className="text-red-600 font-medium mb-2">Audio Error</div>
        <div className="text-red-500 text-sm">{error}</div>
        <div className="text-red-400 text-xs mt-2">URL: {audioUrl}</div>
        {error.includes('corrupted') || error.includes('decode') ? (
          <div className="text-red-400 text-xs mt-2">
            The audio file may have been cleaned up after analysis. Try uploading a new file.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
        {isLoading && (
          <div className="text-sm text-gray-500">Loading audio...</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-primary-500 rounded-full transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          />
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-lg cursor-pointer"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => skipTime(-10)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Skip back 10s"
          >
            <SkipBack className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={resetAudio}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => skipTime(10)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              title="Volume"
            />
            <span className="text-xs text-gray-500 w-8">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
