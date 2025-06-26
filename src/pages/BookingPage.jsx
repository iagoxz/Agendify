import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ptBR } from 'date-fns/locale';
import { format, getDay, parse, addMinutes, startOfDay, endOfDay } from 'date-fns';
import Modal from '../components/common/Modal';
import emailjs from '@emailjs/browser';

function BookingPage() {
  const { businessSlug, serviceId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const backgroundImageUrl = '/backgrounds/bg.png';

  const [service, setService] = useState(null);
  const [business, setBusiness] = useState(null);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const businessesRef = collection(db, 'businesses');
        const businessQuery = query(businessesRef, where('slug', '==', businessSlug), limit(1));
        const businessSnapshot = await getDocs(businessQuery);
        if (businessSnapshot.empty) throw new Error("Empresa não encontrada.");
        const businessDoc = businessSnapshot.docs[0];
        const businessData = { id: businessDoc.id, ...businessDoc.data() };
        setBusiness(businessData);
        const serviceDocRef = doc(db, 'services', serviceId);
        const serviceSnap = await getDoc(serviceDocRef);
        if (!serviceSnap.exists() || serviceSnap.data().businessId !== businessData.id) {
          throw new Error("Serviço não encontrado ou não pertence a esta empresa.");
        }
        setService({ id: serviceSnap.id, ...serviceSnap.data() });
      } catch (err) {
        console.error("Erro ao carregar dados da página de agendamento:", err);
        setError(err.message);
      }
      setLoading(false);
    };
    if (businessSlug && serviceId) {
      fetchInitialData();
    }
  }, [businessSlug, serviceId]);

  useEffect(() => {
    if (!selectedDate || !business?.availability || !service?.duration) {
      setAvailableTimes([]);
      return;
    }
    const calculateTimes = async () => {
      setLoadingTimes(true);
      setAvailableTimes([]);
      setError('');
      try {
        const dayOfWeekIndex = getDay(selectedDate);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeekName = dayNames[dayOfWeekIndex];
        const availabilityForDay = business.availability[dayOfWeekName];
        if (!availabilityForDay || !availabilityForDay.active) {
          setLoadingTimes(false);
          return;
        }
        const serviceDuration = service.duration;
        const startTime = parse(availabilityForDay.startTime, 'HH:mm', selectedDate);
        const endTime = parse(availabilityForDay.endTime, 'HH:mm', selectedDate);
        const allSlots = [];
        let currentTime = startTime;
        while (currentTime < endTime) {
          allSlots.push(format(currentTime, 'HH:mm'));
          currentTime = addMinutes(currentTime, serviceDuration);
        }
        const appointmentsRef = collection(db, 'appointments');
        const startOfSelectedDay = startOfDay(selectedDate);
        const endOfSelectedDay = endOfDay(selectedDate);
        const existingAppointmentsQuery = query(
          appointmentsRef,
          where('businessId', '==', business.id),
          where('appointmentTime', '>=', startOfSelectedDay),
          where('appointmentTime', '<=', endOfSelectedDay)
        );
        const querySnapshot = await getDocs(existingAppointmentsQuery);
        const bookedTimes = new Set();
        querySnapshot.forEach(doc => {
          const appointment = doc.data();
          let occupiedTime = appointment.appointmentTime.toDate();
          const appointmentDuration = appointment.duration;
          for (let i = 0; i < appointmentDuration; i += serviceDuration) {
            bookedTimes.add(format(occupiedTime, 'HH:mm'));
            occupiedTime = addMinutes(occupiedTime, serviceDuration);
          }
        });
        const finalAvailableTimes = allSlots.filter(slot => !bookedTimes.has(slot));
        setAvailableTimes(finalAvailableTimes);
      } catch (err) {
        console.error("Erro ao calcular horários:", err);
        if (err.code === 'failed-precondition') {
          setError("Índice do Firestore necessário. Por favor, verifique o console do navegador para o link de criação.");
        } else {
          setError("Não foi possível carregar os horários disponíveis.");
        }
      } finally {
        setLoadingTimes(false);
      }
    };
    calculateTimes();
  }, [selectedDate, business, service]);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowConfirmationModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para fazer um agendamento.');
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }
    if (!selectedDate || !selectedTime || !business || !service) {
      setError('Informações incompletas para realizar o agendamento.');
      return;
    }
    setIsBooking(true);
    setError('');
    try {
      const [hour, minute] = selectedTime.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
      const appointmentTimestamp = Timestamp.fromDate(appointmentDate);

      await addDoc(collection(db, 'appointments'), {
        businessId: business.id,
        serviceId: service.id,
        serviceName: service.name,
        duration: service.duration,
        price: service.price,
        clientId: currentUser.uid,
        clientName: currentUser.displayName,
        clientEmail: currentUser.email,
        appointmentTime: appointmentTimestamp,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });

      const templateParams = {
        client_name: currentUser.displayName,
        client_email: currentUser.email,
        service_name: service.name,
        business_name: business.name,
        appointment_date: format(appointmentDate, 'PPP', { locale: ptBR }),
        appointment_time: selectedTime,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setShowConfirmationModal(false);
      alert('Seu agendamento foi confirmado com sucesso! Verifique seu e-mail.');
      navigate('/meus-agendamentos');

    } catch (err) {
      console.error("Erro ao confirmar agendamento ou enviar e-mail:", err);
      setError('Ocorreu um erro. Seu agendamento pode não ter sido confirmado. Tente novamente.');
    }
    setIsBooking(false);
  };

  const disabledDays = { before: new Date() };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-white text-xl">Carregando dados para agendamento...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-red-500 text-xl">{error}</p>
    </div>
  );
  if (!service || !business) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-white text-xl">Não foi possível carregar os dados.</p>
    </div>
  );

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 md:pt-28">
        <div className="bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Agendar Serviço</h1>
            <p className="text-xl font-semibold text-gray-700 mt-2">{service.name}</p>
            <p className="text-gray-600">Duração: {service.duration} min • Preço: R$ {Number(service.price).toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">1. Escolha uma data</h2>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                locale={ptBR}
                className="rounded-md"
              />
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">2. Escolha um horário</h2>
              {selectedDate ? (
                <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {loadingTimes ? <p className="col-span-full text-center text-gray-500">Buscando horários...</p> : (
                    availableTimes.length > 0 ? (
                      availableTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`rounded-md py-2 px-3 text-sm font-semibold transition-colors ${selectedTime === time ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-500' : 'bg-black text-white hover:bg-gray-700'}`}
                        >
                          {time}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500">Nenhum horário disponível para esta data.</p>
                    )
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-10">Selecione uma data no calendário para ver os horários.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmBooking}
        title="Confirmar Agendamento"
        confirmText={isBooking ? "Confirmando..." : "Confirmar e Agendar"}
        showCancel={!isBooking}
        showConfirm={!isBooking}
      >
        {isBooking ? (
          <p className="text-center">Aguarde, estamos confirmando seu horário...</p>
        ) : (
          <div>
            <p>Você está prestes a agendar o serviço:</p>
            <p className="font-semibold text-lg my-2">{service.name}</p>
            <p>Para o dia <span className="font-semibold">{selectedDate && format(selectedDate, 'PPP', { locale: ptBR })}</span></p>
            <p>Às <span className="font-semibold">{selectedTime}</span>.</p>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </div>
        )}
      </Modal>
    </section>
  );
}

export default BookingPage;