import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import AudioWaveform from './AudioWaveform';

const AudioDebug = () => {
  const [testUrl, setTestUrl] = useState('http://localhost:8000/uploads/test-audio-player.wav');
  const [customUrl, setCustomUrl] = useState('');

  const testUrls = [
    'http://localhost:8000/uploads/test-audio-player.wav',
    'http://localhost:8000/uploads/1f5f3e82-3455-42b2-8916-123249b08b21.wav',
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // External test
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audio Player Debug</h1>
      
      {/* Test URL Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test URLs</h2>
        <div className="space-y-2">
          {testUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setTestUrl(url)}
              className={`w-full text-left p-3 rounded-lg border ${
                testUrl === url 
                  ? 'border-blue-500 bg-blue-50 text-blue-900' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{url}</div>
              <div className="text-sm text-gray-500">Click to test</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom URL Input */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom URL</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Enter audio URL..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setTestUrl(customUrl)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Test
          </button>
        </div>
      </div>

      {/* Current URL Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Current Test URL:</h3>
        <code className="text-sm text-gray-600 break-all">{testUrl}</code>
      </div>

      {/* Audio Player Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Audio Player</h2>
        <AudioPlayer 
          audioUrl={testUrl}
          title="Test Audio File"
        />
      </div>

      {/* Audio Waveform Test */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Audio Waveform</h2>
        <AudioWaveform 
          audioUrl={testUrl}
          height={120}
        />
      </div>

      {/* Debug Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
        <div className="space-y-2 text-sm">
          <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
          <div><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not set'}</div>
          <div><strong>Current URL:</strong> {testUrl}</div>
          <div><strong>Browser:</strong> {navigator.userAgent}</div>
          <div><strong>Audio Support:</strong> {typeof Audio !== 'undefined' ? 'Yes' : 'No'}</div>
          <div><strong>Web Audio API:</strong> {typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined' ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default AudioDebug;
