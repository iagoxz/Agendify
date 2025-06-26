import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const { currentUser, userProfile, businessProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
      setIsDropdownOpen(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleCopyLink = () => {
    if (!businessProfile?.slug) return;

    const link = `${window.location.origin}/empresa/${businessProfile.slug}/servicos`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess('Copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
      console.error('Erro ao copiar link: ', err);
      alert('Não foi possível copiar o link.');
    });
  };

  const AdminPanelLinks = ({ isMobile = false }) => (
    <>
      <Link to="/admin/appointments" className={isMobile ? "text-2xl text-white hover:text-gray-300" : "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"} onClick={closeMobileMenu}>Agenda</Link>
      <Link to="/admin/services" className={isMobile ? "text-2xl text-white hover:text-gray-300" : "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"} onClick={closeMobileMenu}>Serviços</Link>
      <Link to="/admin/availability" className={isMobile ? "text-2xl text-white hover:text-gray-300" : "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"} onClick={closeMobileMenu}>Disponibilidade</Link>
    </>
  );

  // eslint-disable-next-line no-unused-vars
  const renderNavLinks = (isMobile) => {
    if (!currentUser) 

    if (userProfile?.role === 'empresario') {
      return isMobile ? (
        <>
          <AdminPanelLinks isMobile={true} />
          <hr className="w-48 border-gray-700" />
          <button onClick={handleCopyLink} className="text-2xl text-white hover:text-gray-300">{copySuccess || 'Copiar Link'}</button>
          <div className="pt-8"><button onClick={handleLogout} className="text-lg bg-white text-black px-6 py-2 rounded-md font-semibold">Sair</button></div>
        </>
      ) : (
        <>
          <span className="text-white text-sm">Olá, {currentUser.displayName}</span>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              Painel <span className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>&#9662;</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <AdminPanelLinks />
                <hr className="my-1 border-gray-200" />
                <button onClick={handleCopyLink} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{copySuccess || 'Copiar Link da Empresa'}</button>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-200">Sair</button>
        </>
      );
    }
    
    if (userProfile?.role === 'cliente') { /* ... links do cliente ... */ }
  };


  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-4 md:py-6">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">Agend<span className="text-gray-400">ify</span></Link>
        <nav className="hidden md:flex items-center space-x-4">
            {currentUser ? (
            <>
              {userProfile?.role === 'empresario' && 
                <>
                <span className="text-white text-sm">Olá, {currentUser.displayName}</span>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                    Painel <span className={`ml-1 text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>&#9662;</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <AdminPanelLinks />
                      <hr className="my-1 border-gray-200" />
                      <button onClick={handleCopyLink} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{copySuccess || 'Copiar Link da Empresa'}</button>
                    </div>
                  )}
                </div>
                </>
              }
              {userProfile?.role === 'cliente' && 
                <Link to="/meus-agendamentos" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Meus Agendamentos</Link>
              }
              <button onClick={handleLogout} className="bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-200">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
              <Link to="/register" className="bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-200">Criar Conta</Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Abrir ou fechar menu" className="relative z-50">
            {isMobileMenuOpen ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg> )}
          </button>
        </div>
      </div>
      <div onClick={closeMobileMenu} className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <nav onClick={(e) => e.stopPropagation()} className="w-full h-full flex flex-col items-center justify-center space-y-8">
            {currentUser ? (
              <>
                {userProfile?.role === 'empresario' && 
                  <div className="text-center space-y-8">
                    <AdminPanelLinks isMobile={true} />
                    <hr className="w-48 border-gray-700" />
                    <button onClick={handleCopyLink} className="text-2xl text-white hover:text-gray-300">{copySuccess || 'Copiar Link'}</button>
                  </div>
                }
                {userProfile?.role === 'cliente' && (
                  <Link to="/meus-agendamentos" className="text-2xl text-white hover:text-gray-300" onClick={closeMobileMenu}>Meus Agendamentos</Link>
                )}
                <div className="pt-8">
                  <button onClick={handleLogout} className="text-lg bg-white text-black px-6 py-2 rounded-md font-semibold">Sair</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-2xl text-white hover:text-gray-300" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="text-2xl bg-white text-black px-6 py-2 rounded-md font-semibold" onClick={closeMobileMenu}>Criar Conta</Link>
              </>
            )}
        </nav>
      </div>
    </header>
  );
}

export default Header;