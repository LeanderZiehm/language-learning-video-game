import { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';

function App() {
  const [profile, setProfile] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  useEffect(() => {
    // const savedProfile = localStorage.getItem('profile');
    // if (savedProfile) {
    //   setProfile(JSON.parse(savedProfile));
    //   handleStartGame();
    // }
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
  };
  
  const handleSaveProfile = (profileData) => {
    localStorage.setItem('profile', JSON.stringify(profileData));
    setProfile(profileData);
    handleStartGame();
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden flex flex-col w-full">
      {!gameStarted ? (
        <IntroForm onSaveProfile={handleSaveProfile} savedProfile={profile} />
      ) : (
        <div className="game-container flex flex-col h-screen w-full">
          <div className="flex-grow flex w-full h-full overflow-hidden">
            <GameCanvas profile={profile} className="w-full h-full" />
          </div>
          <HUD profile={profile} />
        </div>
      )}
    </div>
  );
}

function IntroForm({ onSaveProfile, savedProfile }) {
  const languages = [
    "Spanish", "French", "German", "Italian", "Portuguese", 
    "Japanese", "Chinese", "Korean", "Russian"
  ];
  
  const [seeks, setSeeks] = useState(savedProfile?.seeks || 'Girlfriend');
  const [targetLanguage, setTargetLanguage] = useState(savedProfile?.targetLanguage || '');
  const [nativeLanguage, setNativeLanguage] = useState(savedProfile?.nativeLanguage || '');
  const [email, setEmail] = useState(savedProfile?.email || '');
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    // if (!targetLanguage) newErrors.targetLanguage = 'Please select a target language';
    // if (!nativeLanguage) newErrors.nativeLanguage = 'Please select your native language';
    // if (!email) newErrors.email = 'Please enter your email';
    // if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSaveProfile({
      seeks,
      targetLanguage,
      nativeLanguage,
      email
    });
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center pixel-text text-pink-500">
          LoveLingo
        </h1>
        <p className="mb-6 text-center">
          Learn a language through a romantic adventure!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">I'm seeking a:</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Girlfriend"
                  checked={seeks === 'Girlfriend'}
                  onChange={(e) => setSeeks(e.target.value)}
                  className="mr-2"
                />
                Girlfriend
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Boyfriend"
                  checked={seeks === 'Boyfriend'}
                  onChange={(e) => setSeeks(e.target.value)}
                  className="mr-2"
                />
                Boyfriend
              </label>
            </div>
          </div>
          
          <div>
            <label className="block mb-2">
              Target language:
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="">Select language</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            {errors.targetLanguage && (
              <p className="text-red-500 text-sm mt-1">{errors.targetLanguage}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">
              Native language:
            </label>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="">Select language</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
              <option value="English">English</option>
            </select>
            {errors.nativeLanguage && (
              <p className="text-red-500 text-sm mt-1">{errors.nativeLanguage}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold transition duration-200"
          >
            Start Adventure
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;