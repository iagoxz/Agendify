/* eslint-disable no-useless-escape */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from '../../lib/firebase';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

function RegisterPage() {
  const backgroundImageUrl = '/backgrounds/bg.png';
  
  const [userRole, setUserRole] = useState('cliente');
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const generateUniqueSlug = async (initialSlug) => {
    const businessesRef = collection(db, 'businesses');
    let finalSlug = initialSlug;
    let counter = 2;
    
    let slugExists = true;
    while(slugExists) {
        const q = query(businessesRef, where('slug', '==', finalSlug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            slugExists = false;
        } else {
            finalSlug = `${initialSlug}-${counter}`;
            counter++;
        }
    }
    return finalSlug;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (userRole === 'empresario' && !companyName) {
      setError('O nome da empresa é obrigatório para empresários.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: name,
        email: email,
        role: userRole,
        createdAt: new Date(),
      });

      if (userRole === 'empresario') {
        const initialSlug = slugify(companyName);
        const uniqueSlug = await generateUniqueSlug(initialSlug);
        
        const businessDocRef = doc(db, 'businesses', user.uid);
        await setDoc(businessDocRef, {
          name: companyName,
          slug: uniqueSlug,
          adminUid: user.uid,
          createdAt: new Date(),
        });
      }

      console.log('Usuário e perfil criados com sucesso!');
      setLoading(false);
      navigate('/login');

    } catch (firebaseError) {
      console.error("Erro no cadastro:", firebaseError);
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative py-20 px-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Criar Nova Conta</h2>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setUserRole('cliente')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${userRole === 'cliente' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Sou Cliente
          </button>
          <button
            type="button"
            onClick={() => setUserRole('empresario')}
            className={`px-6 py-2 rounded-md font-semibold transition-colors ${userRole === 'empresario' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Sou Empresário
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {userRole === 'empresario' && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input type="text" id="companyName" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                required={userRole === 'empresario'}
                className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
                placeholder="Ex: Barbearia do Zé"
                disabled={loading} />
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
            <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
              placeholder="Seu nome completo"
              disabled={loading} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Seu Email</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
              placeholder="seuemail@exemplo.com"
              disabled={loading} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Sua Senha</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg border-gray-300 focus:border-black focus:ring-black shadow-sm transition-colors"
              placeholder="Mínimo 6 caracteres"
              disabled={loading} />
          </div>

          {error && <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
          
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md disabled:opacity-50">
             {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-8">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-black hover:underline">
            Entre
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;