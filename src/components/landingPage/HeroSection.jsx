import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function HeroSection() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const phrases = ["Impulse seu Negócio.", "Facilite Agendamentos."];
  const typingSpeed = 100;
  const erasingSpeed = 50;
  const pauseBetweenPhrases = 2000;

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let typingTimeout;

    if (isDeleting) {
      if (displayedText.length > 0) {
        typingTimeout = setTimeout(() => {
          setDisplayedText(prev => prev.substring(0, prev.length - 1));
        }, erasingSpeed);
      } else {
        setIsDeleting(false);
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }
    } else {
      const currentPhrase = phrases[phraseIndex];
      if (displayedText.length < currentPhrase.length) {
        typingTimeout = setTimeout(() => {
          setDisplayedText(prev => currentPhrase.substring(0, prev.length + 1));
        }, typingSpeed);
      } else {
        typingTimeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBetweenPhrases);
      }
    }

    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, phraseIndex, phrases, erasingSpeed]);


  const handleComeceAgoraClick = () => {
    if (currentUser) {
      if (userProfile?.role === 'empresario') {
        navigate('/admin/services');
      } else if (userProfile?.role === 'cliente') {
        navigate('/meus-agendamentos');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="bg-black text-white py-20 md:py-32">
      <div className="container mx-auto px-6 text-center md:text-left">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 h-32 md:h-48">
              Agende com Facilidade, <br />
              <span className="text-white inline-block min-h-[1.2em]">
                {displayedText}
              </span>
              <span className="animate-pulse">|</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Nossa plataforma moderna e intuitiva simplifica o agendamento para empresas de todos os segmentos.
            </p>
            <button
              onClick={handleComeceAgoraClick}
              className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Comece Agora
            </button>
          </div>
          <div className="hidden md:block">
            <img
              src="/illustrations/Schedule-bro.svg"
              alt="Ilustração da plataforma de agendamento"
              className="w-full h-auto max-w-xl mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;