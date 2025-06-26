import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function MyAppointmentsPage() {
  const { currentUser } = useAuth();
  const backgroundImageUrl = '/backgrounds/bg.png';
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setError('');
      const appointmentsRef = collection(db, 'appointments');

      const q = query(
        appointmentsRef,
        where('clientId', '==', currentUser.uid),
        orderBy('appointmentTime', 'desc') 
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        if (querySnapshot.empty) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        
        const appointmentsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const appointment = { id: docSnapshot.id, ...docSnapshot.data() };
          
          if (appointment.businessId) {
            try {
   
              const businessDocRef = doc(db, 'businesses', appointment.businessId);
              const businessSnap = await getDoc(businessDocRef); 

              if (businessSnap.exists()) { 
                appointment.businessName = businessSnap.data().name; 
              } else {
                appointment.businessName = 'Empresa Desconhecida';
              }
            } catch (e) {
                console.error("Erro ao buscar detalhes da empresa:", e);
                appointment.businessName = 'Erro ao carregar nome';
            }
          }
          return appointment;
        }));

        setAppointments(appointmentsData);
        setLoading(false);
      }, (err) => {
        console.error("Erro ao buscar agendamentos: ", err);
        setError("Não foi possível carregar seus agendamentos.");
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <section className="min-h-screen flex items-center justify-center" style={{paddingTop: '6rem'}}>
        <div className="text-center">
            <h1 className="text-2xl font-bold">Acesso Negado</h1>
            <p className="mt-2 text-gray-600">Você precisa fazer login para ver seus agendamentos.</p>
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
        <h1 className="text-3xl font-bold text-white mb-8 text-center md:text-left">Meus Agendamentos</h1>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          {loading && <p className="text-center py-8">Carregando seus agendamentos...</p>}
          {error && <p className="text-red-600 text-center py-8">{error}</p>}
          {!loading && appointments.length === 0 && (
            <p className="text-center text-gray-500 py-16">Você ainda não fez nenhum agendamento.</p>
          )}
          {!loading && appointments.length > 0 && (
            <ul className="space-y-4">
              {appointments.map(appt => (
                <li key={appt.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm font-semibold text-gray-500">{appt.businessName || 'Carregando...'}</p>
                      <p className="text-lg font-bold text-gray-800">{appt.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {appt.appointmentTime ? format(appt.appointmentTime.toDate(), "eeee, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : 'Data inválida'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {appt.status === 'confirmed' ? 'Confirmado' : appt.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default MyAppointmentsPage;