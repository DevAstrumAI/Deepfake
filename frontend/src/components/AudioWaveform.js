import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AudioWaveform = ({ audioUrl, className = "", height = 100 }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waveformData, setWaveformData] = useState(null);

  useEffect(() => {
    if (!audioUrl) return;

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create audio context for analysis
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Extract waveform data
        const channelData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of samples to display
        const blockSize = Math.floor(channelData.length / samples);
        const waveform = [];

        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          const end = Math.min(start + blockSize, channelData.length);
          let sum = 0;
          let count = 0;

          for (let j = start; j < end; j++) {
            sum += Math.abs(channelData[j]);
            count++;
          }

          waveform.push(sum / count);
        }

        setWaveformData(waveform);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading audio:', err);
        let errorMessage = `Failed to load audio waveform: ${err.message}`;
        
        // Provide more helpful error messages
        if (err.message.includes('decode') || err.name === 'EncodingError') {
          errorMessage = 'Unable to decode audio data. The audio file may use a codec that is not supported by your browser. Try converting the file to a standard PCM WAV format.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error while loading audio. Please check your connection and try again.';
        } else if (err.message.includes('404') || err.message.includes('not found')) {
          errorMessage = 'Audio file not found. The file may have been cleaned up or moved.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [audioUrl]);

  useEffect(() => {
    if (!waveformData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    ctx.fillStyle = '#3B82F6'; // Primary blue
    ctx.strokeStyle = '#1D4ED8'; // Darker blue
    ctx.lineWidth = 1;

    const barWidth = width / waveformData.length;
    const maxAmplitude = Math.max(...waveformData);

    waveformData.forEach((amplitude, index) => {
      const barHeight = (amplitude / maxAmplitude) * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Draw bar
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      ctx.strokeRect(x, y, barWidth - 1, barHeight);
    });

    // Draw center line
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [waveformData, height]);

  if (!audioUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <span className="text-gray-500">No audio file</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          <span className="text-gray-500">Loading waveform...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center ${className}`} style={{ height }}>
        <span className="text-red-600 font-medium mb-2">Waveform Error</span>
        <span className="text-red-500 text-sm text-center px-4">{error}</span>
        <span className="text-red-400 text-xs mt-2">URL: {audioUrl}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <h4 className="text-sm font-medium text-gray-700 mb-2">Audio Waveform</h4>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full border border-gray-200 rounded"
      />
    </motion.div>
  );
};

export default AudioWaveform;
