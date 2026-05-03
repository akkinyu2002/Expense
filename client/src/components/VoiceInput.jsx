import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceInput = ({ language = 'en-US', onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language;

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

    recognitionRef.current = rec;

    return () => {
      rec.abort();
      recognitionRef.current = null;
    };
  }, [language]);

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
    const recognition = recognitionRef.current;

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
      } catch {
        setError('Failed to start microphone');
      }
    }
  }, [isRecording]);

  if (!isSupported) {
    return (
      <div className="inline-block rounded-lg border border-[var(--app-border)] bg-[var(--app-input)] px-3 py-2 text-xs app-muted">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggleRecording}
        className={`flex h-12 w-12 items-center justify-center rounded-lg border transition ${
          isRecording 
            ? 'border-red-500/50 bg-red-500/15 text-red-300'
            : 'border-[var(--app-border)] bg-[var(--app-input)] text-[var(--accent)] hover:border-[var(--accent)]'
        }`}
        title={isRecording ? 'Stop recording' : 'Record expense description'}
      >
        {isRecording ? <Loader2 className="absolute animate-spin opacity-20" size={28} /> : null}
        {isRecording ? <MicOff size={24} className="relative z-10" /> : <Mic size={24} />}
      </button>

      <div className="mt-3 min-h-[24px] w-full max-w-sm text-center">
        {error ? (
          <span className="text-xs text-red-300">{error}</span>
        ) : isRecording ? (
          <span className="text-sm font-medium text-[var(--accent)]">Listening... {transcript}</span>
        ) : transcript ? (
          <span className="text-sm font-medium text-emerald-300">Recorded</span>
        ) : (
          <span className="text-xs app-muted">Voice capture</span>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;
