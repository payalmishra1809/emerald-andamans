import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  ArrowRight,
  User,
  Minimize2,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { OctoAvatar } from './OctoAvatar';

interface OctoAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenItineraryPlanner: () => void;
  onOpenDestination: (id: string) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

// Clean any stray asterisks, markdown bold stars, or decorative roleplay actions
const sanitizeDisplayText = (raw: string): string => {
  if (!raw) return '';
  return raw
    // Remove decorative action asterisks like *waves tentacles*, *blub blub*, etc.
    .replace(/\*[a-zA-Z\s,!'’~-]{1,50}\*/g, '')
    // Strip bold asterisks **text** -> text
    .replace(/\*{2,}([^*]+)\*{2,}/g, '$1')
    // Strip all remaining asterisks *
    .replace(/\*/g, '')
    // Clean excessive blank lines or whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const OctoAssistantDrawer: React.FC<OctoAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpenItineraryPlanner,
  onOpenDestination,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'octo',
      text: "Hi! I am Octo. Ask me anything about Andaman travel or how to use this app.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Voice Chat States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('emerald_octo_voice_output');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Text to Speech Stop
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancellation error:', e);
      }
      setCurrentlySpeakingId(null);
    }
  }, []);

  // Text to Speech Playback
  const speakText = useCallback((text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {}

    // Clean text for natural speech (remove emojis and stars)
    const cleanSpeech = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*/g, '')
      .trim();

    if (!cleanSpeech) return;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setCurrentlySpeakingId(msgId);
      utterance.onend = () => setCurrentlySpeakingId(null);
      utterance.onerror = () => setCurrentlySpeakingId(null);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech playback error:', e);
      setCurrentlySpeakingId(null);
    }
  }, [currentlySpeakingId, stopSpeaking]);

  // Send Message function
  const sendMessage = useCallback(async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Stop listening if mic is active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    transcriptRef.current = '';
    setLiveTranscript('');

    const cleanUserText = sanitizeDisplayText(trimmed);
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: cleanUserText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'octo' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanUserText,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await res.json();
      const rawReply = data.reply || "I am here to help. Ask me anything and I will assist!";
      const replyText = sanitizeDisplayText(rawReply);

      const isItineraryRelated =
        trimmed.toLowerCase().includes('itinerary') ||
        trimmed.toLowerCase().includes('plan') ||
        trimmed.toLowerCase().includes('days');

      const octoReply: ChatMessage = {
        id: `octo_${Date.now()}`,
        sender: 'octo',
        text: replyText,
        timestamp: Date.now(),
        quickActions: isItineraryRelated
          ? [{ label: 'Open Itinerary Planner', action: 'open_planner' }]
          : undefined,
      };

      setMessages((prev) => [...prev, octoReply]);

      // If voice output is enabled, speak the answer
      if (voiceOutputEnabled) {
        speakText(replyText, octoReply.id);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = "For Havelock and Neil islands, book private catamarans 10-14 days ahead and carry cash as island ATMs can run dry.";
      const errorMsg: ChatMessage = {
        id: `octo_err_${Date.now()}`,
        sender: 'octo',
        text: fallbackText,
        timestamp: Date.now(),
        quickActions: [{ label: 'Open Itinerary Planner', action: 'open_planner' }],
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (voiceOutputEnabled) {
        speakText(fallbackText, errorMsg.id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, voiceOutputEnabled, speakText]);

  // Toggle Speech to Text (Microphone)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. Please type your message.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    // If currently listening, stopping sends the transcribed question to Octo
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      const captured = transcriptRef.current.trim() || input.trim();
      if (captured) {
        transcriptRef.current = '';
        setLiveTranscript('');
        setInput('');
        sendMessage(captured);
      }
      return;
    }

    try {
      stopSpeaking(); // stop reading when user starts speaking
      transcriptRef.current = '';
      setLiveTranscript('');

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      // Transcribes speech to text in real-time
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          transcriptRef.current = combined;
          setInput(combined);
          setLiveTranscript(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow mic access in browser settings.');
          setTimeout(() => setSpeechError(null), 5000);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setSpeechError('Could not capture audio. Please try speaking again.');
          setTimeout(() => setSpeechError(null), 3500);
        }
      };

      // When the user finishes speaking, Octo automatically receives the transcribed question!
      recognition.onend = () => {
        setIsListening(false);
        const captured = transcriptRef.current.trim();
        if (captured) {
          transcriptRef.current = '';
          setLiveTranscript('');
          setInput('');
          sendMessage(captured);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setSpeechError('Voice input unavailable. Please type your message.');
      setTimeout(() => setSpeechError(null), 3500);
    }
  };

  // Explicit Done / Send Voice Question
  const handleDoneListeningAndSend = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    const captured = transcriptRef.current.trim() || input.trim();
    if (captured) {
      transcriptRef.current = '';
      setLiveTranscript('');
      setInput('');
      sendMessage(captured);
    }
  };

  // Cancel Voice Input
  const handleCancelListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    transcriptRef.current = '';
    setLiveTranscript('');
    setInput('');
    setIsListening(false);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'open_planner') {
      stopSpeaking();
      onClose();
      onOpenItineraryPlanner();
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'octo',
        text: "Chat cleared! Ask me anything about Andaman travel or how to use this app.",
        timestamp: Date.now(),
      },
    ]);
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, scrollToBottom]);

  // Clean speech & recognition on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch {}
        setIsListening(false);
      }
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, isListening, stopSpeaking]);

  useEffect(() => {
    try {
      localStorage.setItem('emerald_octo_voice_output', String(voiceOutputEnabled));
    } catch {}
  }, [voiceOutputEnabled]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Slide-Up Container */}
      <div
        className={`w-full max-w-lg bg-white dark:bg-[#052440] rounded-t-3xl sm:rounded-3xl border border-teal-100 dark:border-[#0d3b61] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded ? 'h-[92vh]' : 'h-[80vh] sm:h-[650px]'
        }`}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <OctoAvatar size={38} mood="waving" showHiBubble={false} />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-teal-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base font-['Outfit'] tracking-tight">
                  Octo AI Assistant
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-slate-950" /> Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-teal-200">
                Voice & chat companion for Andaman & this app
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Voice Output Toggle */}
            <button
              onClick={() => {
                if (currentlySpeakingId) stopSpeaking();
                setVoiceOutputEnabled(!voiceOutputEnabled);
              }}
              className={`p-1.5 rounded-xl transition-colors ${
                voiceOutputEnabled
                  ? 'bg-white/20 text-emerald-200 hover:text-white'
                  : 'text-teal-200/60 hover:text-white hover:bg-white/10'
              }`}
              title={voiceOutputEnabled ? 'Voice responses ON (Click to mute)' : 'Voice responses OFF (Click to unmute)'}
            >
              {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Expand Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-teal-100 hover:text-white transition-colors hidden sm:inline-flex"
              title={isExpanded ? 'Restore' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Reset Chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl hover:bg-white/20 text-teal-100 hover:text-white transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-white/20 text-teal-100 hover:text-white transition-colors ml-1 cursor-pointer"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Speech Error Banner */}
        {speechError && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 text-xs flex items-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="flex-1">{speechError}</span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/60 dark:bg-[#021526] scrollbar-thin">
          {messages.map((msg) => {
            const isSpeakingThis = currentlySpeakingId === msg.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'octo' && (
                  <div className="shrink-0 mt-0.5">
                    <OctoAvatar size={32} mood={isSpeakingThis ? 'talking' : 'waving'} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#052440] text-slate-800 dark:text-slate-100 rounded-tl-none border border-teal-100 dark:border-[#0d3b61]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Audio Speaker Button for Octo messages */}
                  {msg.sender === 'octo' && (
                    <div className="mt-2 pt-2 border-t border-teal-100/60 dark:border-[#0d3b61]/60 flex items-center justify-between">
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSpeakingThis
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-[#083256]'
                        }`}
                        title={isSpeakingThis ? 'Stop speaking' : 'Listen to voice answer'}
                      >
                        {isSpeakingThis ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-amber-600" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Quick action buttons */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-teal-100 dark:border-[#0d3b61] flex flex-wrap gap-1.5">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(qa.action)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-[#021526] hover:bg-teal-100 dark:hover:bg-[#083256] text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-[#0d3b61] shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <span>{qa.label}</span>
                          <ArrowRight className="w-3 h-3 text-teal-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-[#0d3b61] flex items-center justify-center shrink-0 mt-1 text-teal-800 dark:text-teal-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <OctoAvatar size={32} mood="thinking" />
              <div className="bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] rounded-2xl rounded-tl-none p-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>Octo is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Live Voice Listening & Transcription Banner */}
        {isListening && (
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-teal-500/10 border-t border-teal-200/60 dark:border-[#0d3b61] flex flex-col gap-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-semibold">
                {/* Audio wave animated bars */}
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-1 bg-red-500 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-amber-500 rounded-full animate-pulse h-4" />
                  <span className="w-1 bg-teal-500 rounded-full animate-pulse h-2.5" />
                  <span className="w-1 bg-cyan-500 rounded-full animate-pulse h-4" />
                </div>
                <span>
                  {liveTranscript ? 'Transcribing your question...' : 'Listening... Speak your question now'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(liveTranscript || input) && (
                  <button
                    type="button"
                    onClick={handleDoneListeningAndSend}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send to Octo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancelListening}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cancel voice input"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {liveTranscript && (
              <div className="text-xs bg-white/80 dark:bg-[#021526]/80 backdrop-blur-xs p-2 rounded-xl border border-teal-200/50 dark:border-[#0d3b61] text-slate-800 dark:text-slate-100 flex items-start gap-1.5 shadow-xs">
                <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">You:</span>
                <span className="italic break-words">"{liveTranscript}"</span>
              </div>
            )}
          </div>
        )}

        {/* Input Bar with Voice Input (Mic) and Send */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="p-2.5 bg-white dark:bg-[#052440] border-t border-teal-100 dark:border-[#0d3b61] flex items-center gap-2"
        >
          {/* Voice Chat Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer relative group ${
              isListening
                ? 'bg-red-500 text-white ring-4 ring-red-400/40 shadow-red-500/30'
                : 'bg-slate-100 dark:bg-[#021526] hover:bg-teal-50 dark:hover:bg-[#0d3b61] text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-[#0d3b61]'
            }`}
            title={isListening ? 'Click to stop & send transcribed question' : 'Click mic to speak your question'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              </>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening... transcribing your speech...'
                : 'Ask anything about Andaman or this app...'
            }
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
            title="Send Question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
