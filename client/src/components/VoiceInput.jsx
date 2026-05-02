import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceInput = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);
  
  // Use speech recognition API
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      setError(`Error: ${event.error}`);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    setRecognition(rec);
  }, []);

  // Update parent when recording stops and we have a transcript
  useEffect(() => {
    if (!isRecording && transcript && !error) {
      onTranscription(transcript);
      // Wait a moment then clear
      const timer = setTimeout(() => setTranscript(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, transcript, error, onTranscription]);

  const toggleRecording = useCallback(() => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setError(null);
      setTranscript('');
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        setError('Failed to start microphone');
      }
    }
  }, [recognition, isRecording]);

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-500 italic px-2 py-1 bg-slate-800/50 rounded-lg inline-block border border-slate-700/50">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggleRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isRecording 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 shadow-red-500/20 animate-pulse' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 hover:scale-105'
        }`}
        title={isRecording ? 'Stop recording' : 'Record expense description'}
      >
        {isRecording ? <Loader2 className="animate-spin absolute opacity-20" size={32} /> : null}
        {isRecording ? <MicOff size={24} className="relative z-10" /> : <Mic size={24} />}
      </button>

      {/* Status or Transcript Display */}
      <div className="mt-3 min-h-[24px] text-center w-full max-w-sm">
        {error ? (
          <span className="text-red-400 text-xs">{error}</span>
        ) : isRecording ? (
          <span className="text-blue-400 text-sm font-medium">Listening... {transcript}</span>
        ) : transcript ? (
          <span className="text-emerald-400 text-sm font-medium">Recorded!</span>
        ) : (
          <span className="text-slate-500 text-xs">Tap to speak your expense</span>
        )}
      </div>
      
      {/* Helper text */}
      <div className="mt-1 text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
        Example: "Spent 500 on pizza"
      </div>
    </div>
  );
};

export default VoiceInput;
