import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const daysOfWeek = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const defaultAvailability = {
  monday:    { active: true, startTime: '09:00', endTime: '18:00' },
  tuesday:   { active: true, startTime: '09:00', endTime: '18:00' },
  wednesday: { active: true, startTime: '09:00', endTime: '18:00' },
  thursday:  { active: true, startTime: '09:00', endTime: '18:00' },
  friday:    { active: true, startTime: '09:00', endTime: '18:00' },
  saturday:  { active: false, startTime: '10:00', endTime: '14:00' },
  sunday:    { active: false, startTime: '09:00', endTime: '18:00' },
};

function AdminAvailabilityPage() {
  const { currentUser } = useAuth();
  const backgroundImageUrl = '/backgrounds/bg.png';
  
  const [availability, setAvailability] = useState(defaultAvailability);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAvailability = useCallback(async () => {
    if (currentUser) {
      setLoading(true);
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      const docSnap = await getDoc(businessDocRef);

      if (docSnap.exists() && docSnap.data().availability) {
        setAvailability(prev => ({ ...defaultAvailability, ...docSnap.data().availability }));
      } else {
        setAvailability(defaultAvailability);
      }
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Você precisa estar logado.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const businessDocRef = doc(db, 'businesses', currentUser.uid);
      await updateDoc(businessDocRef, {
        availability: availability,
      });
      setSuccess('Horários de funcionamento salvos com sucesso!');
    } catch (err) {
      console.error("Erro ao salvar disponibilidade:", err);
      setError('Ocorreu um erro ao salvar os horários. Tente novamente.');
    }
    setSaving(false);
  };

  if (!currentUser) {
    return (
      <section
        className="min-h-screen bg-cover bg-center bg-fixed relative flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})`, paddingTop: '6rem' }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
        <div className="relative z-10 text-center bg-white/90 p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-gray-800">Acesso Negado</h1>
            <p className="mt-2 text-gray-600">Você precisa fazer login para acessar esta página.</p>
            <Link to="/login" className="mt-4 inline-block bg-black text-white px-6 py-2 rounded-md">
                Fazer Login
            </Link>
        </div>
      </section>
    );
  }
  
  return (
    <section
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold text-white">Horários de Funcionamento</h1>
             <Link to="/admin/services" className="text-sm text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors">
                 &larr; Voltar para Serviços
             </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-6">Defina os dias e horários em que sua empresa estará aberta para agendamentos. Desmarque os dias em que não há expediente.</p>
          {loading ? <p>Carregando horários...</p> : (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {Object.entries(daysOfWeek).map(([dayKey, dayName]) => (
                <div key={dayKey} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 border rounded-md">
                  <div className="md:col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      id={`active-${dayKey}`}
                      checked={availability[dayKey]?.active ?? false}
                      onChange={(e) => handleAvailabilityChange(dayKey, 'active', e.target.checked)}
                      className="h-5 w-5 rounded text-black focus:ring-black"
                    />
                    <label htmlFor={`active-${dayKey}`} className="ml-3 font-medium text-gray-800">{dayName}</label>
                  </div>
                  <div className={`md:col-span-3 grid grid-cols-2 gap-4 ${!availability[dayKey]?.active ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                      <label htmlFor={`start-${dayKey}`} className="block text-sm text-gray-600">Início</label>
                      <input
                        type="time"
                        id={`start-${dayKey}`}
                        value={availability[dayKey]?.startTime ?? '09:00'}
                        onChange={(e) => handleAvailabilityChange(dayKey, 'startTime', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        disabled={!availability[dayKey]?.active}
                      />
                    </div>
                    <div>
                      <label htmlFor={`end-${dayKey}`} className="block text-sm text-gray-600">Fim</label>
                      <input
                        type="time"
                        id={`end-${dayKey}`}
                        value={availability[dayKey]?.endTime ?? '18:00'}
                        onChange={(e) => handleAvailabilityChange(dayKey, 'endTime', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        disabled={!availability[dayKey]?.active}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4">
                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}
                <button type="submit" disabled={saving}
                  className="w-full bg-black text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminAvailabilityPage;