import { useState, useEffect } from 'react';
import blueImage from "../../static/blue.png";

const Loading = () => {
  const [dots, setDots] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    console.log("theme: ", savedTheme);
    if (savedTheme==="dark") {
      setDarkMode(true);
    }

    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots + 1) % 4); 
    }, 500);  

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadingText = "Loading" + ".".repeat(dots);

  return (
    <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-gray-900' : 'white'}`}>
      <div className="text-center">
        <img src={blueImage} alt="Loading" className="w-32 h-32 mx-auto mb-4" />
        <p className={`text-xl font-medium ${darkMode ? 'text-blue-500' : 'text-blue-500'}`}>
          {loadingText}
        </p>
        
      </div>
    </div>
  );
};

export default Loading;
