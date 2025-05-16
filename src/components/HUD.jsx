import { useState, useEffect, useRef } from 'react';

function HUD({ profile }) {
  const [command, setCommand] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const speechRecognition = useRef(null);
  const commandInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAlreadySubscribed = localStorage.getItem('subscribed') === 'true';
      setIsSubscribed(isAlreadySubscribed);
      
      // Set up speech recognition if available
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setCommand(transcript);
          handleCommandSubmit(transcript);
          setIsMicActive(false);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsMicActive(false);
        };
        
        recognition.onend = () => {
          setIsMicActive(false);
        };
        
        speechRecognition.current = recognition;
      }
    }
    
    // Custom event listener for object clicks from the game
    window.addEventListener('objectClicked', handleObjectClick);
    window.addEventListener('verbClicked', handleVerbClick);
    window.addEventListener('levelComplete', handleLevelComplete);
    
    // Set initial suggestions based on profile
    const seeksBoy = profile?.seeks === 'Boyfriend';
    const characterType = seeksBoy ? 'boy' : 'girl';
    setSuggestions(['go to tree', `go to ${characterType}`, `talk to ${characterType}`]);
    
    return () => {
      window.removeEventListener('objectClicked', handleObjectClick);
      window.removeEventListener('verbClicked', handleVerbClick);
      window.removeEventListener('levelComplete', handleLevelComplete);
    };
  }, [profile]);
  
  // Listen for game events to update suggestions
  const handleObjectClick = (e) => {
    const { objectName } = e.detail;
    if (objectName) {
      setCommand(prev => {
        const words = prev.split(' ').filter(Boolean);
        // If first word is a verb and there's no object yet
        if (words.length === 1 && isVerb(words[0])) {
          return `${words[0]} ${objectName}`;
        } 
        // Otherwise replace/append the object
        return objectName;
      });
      commandInputRef.current?.focus();
    }
  };
  
  const handleVerbClick = (e) => {
    const { verb } = e.detail;
    if (verb) {
      setCommand(prev => {
        const words = prev.split(' ').filter(Boolean);
        // If there's already an object but no verb
        if (words.length === 1 && !isVerb(words[0])) {
          return `${verb} ${words[0]}`;
        }
        // Otherwise replace/set the verb
        return verb;
      });
      commandInputRef.current?.focus();
    }
  };
  
  const handleLevelComplete = (e) => {
    const { level } = e.detail;
    if (level === 3) {
      setShowPaywall(true);
    }
  };
  
  const toggleMic = () => {
    if (isMicActive) {
      speechRecognition.current?.stop();
      setIsMicActive(false);
    } else {
      if (speechRecognition.current) {
        speechRecognition.current.start();
        setIsMicActive(true);
      } else {
        setFeedback({
          success: false,
          message: 'Speech recognition not supported in your browser',
          translation: '',
          correction: ''
        });
      }
    }
  };
  
  const handleCommandSubmit = (cmd = command) => {
    if (!cmd.trim()) return;
    
    // Log for debugging
    console.log('Submitting command:', cmd);
    
    // Send command to game with a short delay to ensure the game is ready
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('commandSubmitted', { 
        detail: { command: cmd } 
      }));
    }, 50);
    
    // Handle specific commands for better feedback
    const lowerCmd = cmd.toLowerCase().trim();
    const seeksBoy = profile?.seeks === 'Boyfriend';
    const characterType = seeksBoy ? 'boy' : 'girl';
    
    if (lowerCmd === 'go to tree' || lowerCmd === 'go tree' || 
        lowerCmd === 'go to the tree' || lowerCmd === 'move to tree') {
      setFeedback({
        success: true,
        message: 'Great! Your character is moving to the tree.',
        translation: 'Go to the tree',
        correction: ''
      });
    } else if (lowerCmd.includes('go') && lowerCmd.includes(characterType) ||
               lowerCmd.includes('move') && lowerCmd.includes(characterType)) {
      setFeedback({
        success: true,
        message: `Your character is moving to the ${characterType}.`,
        translation: `Go to the ${characterType}`,
        correction: ''
      });
    } else if (lowerCmd.includes('talk') && lowerCmd.includes(characterType) ||
               lowerCmd.includes('ask') && lowerCmd.includes(characterType)) {
      setFeedback({
        success: true,
        message: `You are talking to the ${characterType}.`,
        translation: `Talk to the ${characterType}`,
        correction: ''
      });
    } else {
      // For other commands, simulate a response
      simulateCommandResponse(cmd);
    }
    
    // Clear the command
    setCommand('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    }
  };
  
  const isVerb = (word) => {
    const verbs = ["go", "walk", "move", "pick", "talk", "ask", "give", "take"];
    return verbs.includes(word.toLowerCase());
  };
  
  const simulateCommandResponse = (cmd) => {
    // This is a stub - in a real implementation, this would be handled by the game logic
    // or by the OpenAI API
    const response = {
      success: Math.random() > 0.3, // 70% success rate for demo
      message: '',
      translation: cmd,
      correction: ''
    };
    
    if (response.success) {
      response.message = 'Great job! That was correct.';
    } else {
      response.message = 'Not quite right.';
      
      // Set appropriate correction based on command language
      const profile = window.game?.registry?.get('profile');
      const targetLanguage = profile?.targetLanguage || 'Spanish';
      
      if (targetLanguage === 'Spanish') {
        if (cmd.toLowerCase().includes('tree')) {
          response.correction = 'Ve al árbol';
        } else if (cmd.toLowerCase().includes('girl')) {
          response.correction = 'Ve a la chica';
        } else if (cmd.toLowerCase().includes('boy')) {
          response.correction = 'Ve al chico';
        }
      }
    }
    
    setFeedback(response);
  };
  
  const handleSubscribe = () => {
    localStorage.setItem('subscribed', 'true');
    setIsSubscribed(true);
    setShowPaywall(false);
    
    // Notify the game that the user has subscribed
    window.dispatchEvent(new CustomEvent('userSubscribed'));
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 bg-gray-800 bg-opacity-90 border-t border-gray-700">
      {feedback && (
        <div className={`feedback-panel mb-2 p-2 rounded ${feedback.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className={`${feedback.success ? 'text-green-800' : 'text-red-800'} text-sm`}>
            {feedback.message}
          </p>
          <p className="text-gray-700 text-xs mt-1">Translation: {feedback.translation}</p>
          {feedback.correction && (
            <p className="text-blue-700 text-xs mt-1">Correction: {feedback.correction}</p>
          )}
        </div>
      )}
      
      {/* Suggestions */}
      {suggestions.length > 0 && !feedback && (
        <div className="bg-gray-700 p-1 mb-1 rounded text-white text-xs">
          <p>Try typing: {suggestions.map(s => <span key={s} className="bg-gray-600 px-2 py-1 rounded mr-2 cursor-pointer" onClick={() => setCommand(s)}>{s}</span>)}</p>
        </div>
      )}
      
      <div className="flex items-center">
        <input
          ref={commandInputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a command like 'go to tree'..."
          className="command-input flex-grow p-1 text-sm"
        />
        <button 
          onClick={toggleMic}
          className={`btn-mic ml-2 p-1 ${isMicActive ? 'bg-red-700 animate-pulse' : 'bg-red-500'}`}
          aria-label="Toggle microphone"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button
          onClick={() => handleCommandSubmit()}
          className="btn ml-2 p-1 px-2 text-sm"
        >
          Submit
        </button>
      </div>
      
      {/* Paywall Modal */}
      {showPaywall && !isSubscribed && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Level 4</h2>
            <p className="text-gray-700 mb-6">
              Subscribe to LoveLingo Premium to unlock the final level and have an AI-powered infinite chat with your virtual partner!
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleSubscribe}
                className="btn bg-pink-600 hover:bg-pink-700"
              >
                Subscribe Now - Just $9.99/month
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HUD; 