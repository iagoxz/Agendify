import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Modal from '../../components/common/Modal';

function AdminAppointmentsPage() {
  const { currentUser } = useAuth();
  const backgroundImageUrl = '/backgrounds/bg.png';
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setError('');
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('businessId', '==', currentUser.uid),
        orderBy('appointmentTime', 'asc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const appointmentsData = [];
        querySnapshot.forEach(doc => {
          appointmentsData.push({ id: doc.id, ...doc.data() });
        });
        setAppointments(appointmentsData);
        setLoading(false);
      }, (err) => {
        console.error("Erro ao buscar agendamentos: ", err);
        if (err.code === 'failed-precondition') {
          setError("Índice do Firestore necessário para esta consulta. Verifique o console do navegador.");
        } else {
          setError("Não foi possível carregar os agendamentos.");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const openCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setError('');
    try {
      const appointmentDocRef = doc(db, 'appointments', appointmentToCancel.id);
      await updateDoc(appointmentDocRef, {
        status: 'cancelled_by_admin'
      });
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      setError('Ocorreu um erro ao cancelar. Tente novamente.');
    }
    setIsCancelling(false);
    setShowCancelModal(false);
    setAppointmentToCancel(null);
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
          <h1 className="text-3xl font-bold text-white">Agenda de Agendamentos</h1>
          <Link to="/admin/services" className="text-sm text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors">
            &larr; Gerenciar Serviços
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          {loading && <p className="text-center py-8">Carregando agenda...</p>}
          {error && <p className="text-center text-red-600 py-8">{error}</p>}
          {!loading && appointments.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nenhum agendamento encontrado.</p>
          )}
          {!loading && appointments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data e Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map(appt => {
                     const appointmentDate = appt.appointmentTime.toDate();
                     const isUpcoming = isFuture(appointmentDate);
                     return (
                        <tr key={appt.id}>
                             <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm font-medium text-gray-900">
                                     {format(appointmentDate, 'PPP', { locale: ptBR })}
                                 </div>
                                 <div className="text-sm text-gray-500">
                                     {format(appointmentDate, 'p', { locale: ptBR })}
                                 </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{appt.clientName}</div>
                                 <div className="text-sm text-gray-500">{appt.clientEmail}</div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{appt.serviceName}</td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                     ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                     (appt.status && appt.status.includes('cancelled') ? 'bg-red-100 text-red-800' : 
                                     'bg-gray-100 text-gray-800')}`}>
                                     {appt.status === 'confirmed' ? 'Confirmado' : 
                                      appt.status === 'cancelled' ? 'Cancelado (Cliente)' :
                                      appt.status === 'cancelled_by_admin' ? 'Cancelado (Você)' :
                                      appt.status}
                                 </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                 {appt.status === 'confirmed' && isUpcoming && (
                                     <button onClick={() => openCancelModal(appt)} className="text-red-600 hover:text-red-900">
                                         Cancelar
                                     </button>
                                 )}
                             </td>
                        </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelAppointment}
          title="Cancelar Agendamento"
          confirmText={isCancelling ? "Cancelando..." : "Sim, Cancelar"}
          cancelText="Não"
        >
          <p>Tem certeza que deseja cancelar o agendamento de <span className="font-semibold">{appointmentToCancel?.clientName}</span> para o serviço <span className="font-semibold">{appointmentToCancel?.serviceName}</span>?</p>
          {appointmentToCancel && (
             <p className="text-sm text-gray-600 mt-2">
               Agendado para: {format(appointmentToCancel.appointmentTime.toDate(), "dd/MM/yyyy 'às' HH:mm")}
             </p>
          )}
        </Modal>
      </div>
    </section>
  );
}

export default AdminAppointmentsPage;