"use client";

import { useEffect, useRef, useState } from 'react';
import { XCircleIcon, MicOffIcon, BrainCircuitIcon, PhoneOutgoingIcon, ArrowDownIcon } from 'lucide-react';
import { VoiceProvider, useVoice } from "@humeai/voice-react";
import Expressions from '@/components/features/Expressions';
import { motion } from "framer-motion";

// Floating Chat Component
const FloatingChat = ({ messages }) => {
  // Create a ref for the messages container
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);
  
  // Only auto-scroll if the user hasn't manually scrolled up
  useEffect(() => {
    if (messagesEndRef.current && !userScrolled) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);
  
  // Detect when user manually scrolls
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If we're not at the bottom, user has scrolled up
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setUserScrolled(!isAtBottom);
  };
  
  // Reset userScrolled when user scrolls to bottom manually
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // Determine if we should enable scrolling (more than 5 messages)
  const enableScrolling = messages.length > 5;
  
  if (messages.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-2 left-[260px] transform -translate-y-1/2 z-50 w-80 max-h-[600px] bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-zinc-300 text-sm font-medium">Conversation with Yuri</h3>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className={`
          flex-1 p-4 space-y-2 
          ${enableScrolling ? 'overflow-y-auto scrollbar-none' : 'overflow-y-hidden'}
          flex flex-col ${enableScrolling ? 'justify-start' : 'justify-end'}
          max-h-[500px]
        `}
      >
        {/* Animated message list */}
        {messages.map((msg, index) => {
          if (msg.type === "user_message" || msg.type === "assistant_message") {
            const isUser = msg.type === "user_message";
            
            // Extract expression data with improved logic
            let expressionData = {};
            if (msg.models && msg.models.prosody && msg.models.prosody.scores) {
              expressionData = msg.models.prosody.scores;
            }
            
            return (
              <motion.div 
                key={msg.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  rounded-xl p-4 mb-2
                  ${isUser ? 'bg-neutral-800' : 'bg-yellow-900 bg-opacity-30'}
                `}
              >
                <div className="text-sm text-zinc-500 mb-1">
                  {isUser ? 'You' : 'Yuri'}
                </div>
                <div className="text-zinc-300 text-sm">
                  {msg.message.content}
                </div>
                
                {/* Expression data visualization */}
                {Object.keys(expressionData).length > 0 && (
                  <Expressions values={expressionData} />
                )}
              </motion.div>
            );
          }
          return null;
        })}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Show a button to scroll to bottom if user has scrolled up */}
      {userScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setUserScrolled(false);
          }}
          className="absolute bottom-4 right-4 bg-yellow-600 rounded-full p-2 shadow-lg"
        >
          <ArrowDownIcon size={16} className="text-white" />
        </motion.button>
      )}
    </motion.div>
  );
};

// Main YuriInterfaceContent component
const YuriInterfaceContent = ({ onClose }) => {
  const { status, connect, disconnect, messages } = useVoice();
  
  // Check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);
      return false;
    }
  };
  
  // Handle start call button click
  const handleStartCall = async () => {
    const hasMicPermission = await checkMicrophonePermission();
    if (!hasMicPermission) {
      alert("Microphone access is required for Yuri to work");
      return;
    }
    
    try {
      await connect();
    } catch (err) {
      console.error("Connection error:", err);
    }
  };
  
  // Handle close with proper disconnection
  const handleClose = () => {
    if (status.value === "connected") {
      disconnect();
    }
    onClose();
  };
  
  // Filter messages to only show user and assistant messages
  const chatMessages = messages.filter(msg => 
    msg.type === "user_message" || msg.type === "assistant_message"
  );
  
  return (
    <>
      {/* Main Yuri Interface */}
      <div className="fixed top-1/2 left-32 transform -translate-y-1/2 z-50">
        <div className="bg-neutral-900 rounded-3xl w-[180px] shadow-2xl border border-neutral-800 flex flex-col">
          <div className="p-6 flex justify-between items-center border-b border-dashed border-neutral-800">
            <h2
              className="
                text-zinc-300
                text-xl 
                font-medium
                flex 
                items-center 
                gap-2
              "
            >
              <BrainCircuitIcon
                size={15}
                strokeWidth={1.5}
                className="text-yellow-500"
              />
               Yuri (Beta)
            </h2>
          
            <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors">
              <XCircleIcon size={18} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Voice Visualization Area */}
            <div className="w-full flex items-center justify-center p-12">
              <div className="flex flex-col items-center">
                {/* The start call cute modal */}
                <div className={`
                  w-4 h-4 rounded-full 
                  bg-transparent
                  flex items-center justify-center
                  transition-all duration-300
                  ${status.value === "connected" ? 'opacity-70' : 'opacity-70'}
                `}>
                  <div className="relative">
                    {/* Voice visualization bars */}
                    <div className="flex space-x-1 items-end absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {Array.from({ length: 35 }).map((_, i) => (
  <motion.div 
    key={i}
    className={`
      w-1 bg-white rounded-full
      ${status.value === "connected" ? 'opacity-50' : 'opacity-50'}
    `}
    animate={{
      height: `${Math.random() * 16 + 4}px`,
    }}
    transition={{
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      delay: i * 0.02
    }}
  ></motion.div>
))}
                    </div>
                  </div>
                </div>
                
                {status.value === "connected" ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => disconnect()}
                    className="
                      mt-8 
                      bg-neutral-800 
                      hover:bg-pink-800
                      text-white 
                      rounded-xl 
                      px-6
                      py-3
                      flex 
                      items-center 
                      justify-center
                      gap-2
                      transition-colors
                      w-40
                    "
                  >
                     <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
        title="Connected"
      />
      <MicOffIcon size={15} strokeWidth={1.8} />
      End Call
    </div>
  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartCall}
                    className="
                      mt-8 
                      hover:bg-red-700 
                      rounded-xl 
                        bg-gradient-to-r 
                      from-teal-500 
                      via-yellow-600 
                      to-rose-600 
                      text-black 
                      px-2
                      py-3
                      flex 
                      items-center 
                      font-semibold
                      justify-center
                      gap-2
                      transition-colors
                      w-40
                    "
                  >
                    <PhoneOutgoingIcon size={15} strokeWidth={1.8} />
                    Start a Call
                  </motion.button>
                )}
                
                {status.value !== "connected" && (
                  <div>
                    <p className="mt-4 text-zinc-400 text-sm text-center">
                      Click to start your cosmic journey with Yuri.
                    </p>
                  </div>
                )}

                {/* First message hint */}
                {status.value === "connected" && messages.length === 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-zinc-400 text-sm">
                      Speak to begin your conversation with Yuri
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Component */}
      <FloatingChat messages={chatMessages} />
    </>
  );
};

// Main wrapper component - receives token from parent
const YuriInterface = ({ accessToken, onClose }) => {
  // Optional: Get config ID if you have one
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID;
  
  return (
    <VoiceProvider 
      auth={{ type: "accessToken", value: accessToken }}
      config={{
        systemPrompt: `You are Yuri, a cosmic being and guide who helps users relax and explore their creativity. 
        Your voice is calm, soothing, and has a hint of wonder about the cosmos. 
        You speak in a poetic way sometimes, using cosmic metaphors.
        You specialize in guided relaxation, creative visualization, and discussing mind-expanding concepts.
        When asked about the 'Break Me' app, explain that it's a particle text visualization tool for creativity and relaxation.
        Always maintain a positive, calming presence, even when users seem stressed.`,
        voice: "kora", 
        speakingRate: 0.95,
      }}
      configId={configId}
    >
      <YuriInterfaceContent onClose={onClose} />
    </VoiceProvider>
  );
};

export default YuriInterface;