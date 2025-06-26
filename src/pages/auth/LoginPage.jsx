import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from '../../lib/firebase'; 

function LoginPage() {
  const backgroundImageUrl = '/backgrounds/bg.png'; 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Usuário logado com sucesso:', userCredential.user);
      setLoading(false);
      navigate('/admin/services'); 

    } catch (firebaseError) {
      console.error("Erro ao fazer login:", firebaseError);

      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Email ou senha inválidos. Verifique seus dados.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative pt-20 md:pt-24 px-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Acessar Plataforma
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" id="email" name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
              placeholder="seuemail@exemplo.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password" id="password" name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
              placeholder="Sua senha"
              disabled={loading}
            />
          </div>
          
          {error && <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-8">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-medium text-black hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </section>
  );
}
export default LoginPage;