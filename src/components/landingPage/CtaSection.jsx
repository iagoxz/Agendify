import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function CtaSection() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (currentUser) {
      if (userProfile?.role === 'empresario') {
        navigate('/admin/appointments');
      } else {
        navigate('/meus-agendamentos');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="py-20 md:py-24 bg-black"> 
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Pronto para Simplificar seus Agendamentos?
        </h2>
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
          Junte-se a centenas de empresas que já estão otimizando seu tempo e melhorando o atendimento com nossa plataforma.
        </p>
        <button 
          onClick={handleCtaClick}
          className="bg-white text-black font-bold text-lg px-10 py-4 rounded-lg hover:bg-gray-200 hover:scale-105 transform transition-all duration-300 ease-in-out shadow-lg"
        >
          {currentUser ? 'Acessar meu Painel' : 'Crie sua Conta Gratuita'}
        </button>
      </div>
    </section>
  );
}

export default CtaSection;