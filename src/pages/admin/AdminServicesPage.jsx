import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';

function AdminServicesPage() {
  const { currentUser } = useAuth();
  const backgroundImageUrl = '/backgrounds/bg.png';

  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingServiceId, setCurrentEditingServiceId] = useState(null);

  const resetFormAndMode = () => {
    setServiceName('');
    setDescription('');
    setDuration('');
    setPrice('');
    setIsEditing(false);
    setCurrentEditingServiceId(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('Você precisa estar logado para gerenciar serviços.');
      return;
    }
    setLoading(true);
    setFormError('');
    setFormSuccess('');
    setActionError('');
    setActionSuccess('');

    if (!serviceName || !description || !duration || !price) {
      setFormError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    const serviceData = {
      name: serviceName,
      description: description,
      duration: parseInt(duration),
      price: parseFloat(price),
      businessId: currentUser.uid,
    };

    try {
      if (isEditing && currentEditingServiceId) {
        const serviceDocRef = doc(db, 'services', currentEditingServiceId);
        await updateDoc(serviceDocRef, {
          ...serviceData,
          updatedAt: serverTimestamp()
        });
        setActionSuccess('Serviço atualizado com sucesso!');
      } else {
        const servicesCollectionRef = collection(db, 'services');
        await addDoc(servicesCollectionRef, {
          ...serviceData,
          isActive: true,
          createdAt: serverTimestamp(),
        });
        setFormSuccess('Serviço adicionado com sucesso!');
      }
      resetFormAndMode();
    } catch (error) {
      console.error("Erro ao salvar serviço: ", error);
      setFormError(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} serviço. Tente novamente.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      setLoadingServices(true);
      const servicesCollectionRef = collection(db, 'services');
      const q = query(
        servicesCollectionRef,
        where('businessId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const servicesData = [];
        querySnapshot.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() });
        });
        setServices(servicesData);
        setLoadingServices(false);
      }, (error) => {
        console.error("Erro ao buscar serviços: ", error);
        if (error.code === 'failed-precondition') {
          setActionError("Erro ao buscar dados. Pode ser necessário criar um índice no Firestore. Verifique o console do navegador para um link.");
        } else {
          setActionError("Erro ao carregar lista de serviços.");
        }
        setLoadingServices(false);
      });
      return () => unsubscribe();
    } else {
      setServices([]);
      setLoadingServices(false);
    }
  }, [currentUser]);

  const handleStartEdit = (service) => {
    setIsEditing(true);
    setCurrentEditingServiceId(service.id);
    setServiceName(service.name);
    setDescription(service.description);
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setFormError('');
    setFormSuccess('');
    setActionError('');
    setActionSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteConfirmationModal = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
    setActionError('');
    setActionSuccess('');
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setActionError('');
    setActionSuccess('');
    try {
      const serviceDocRef = doc(db, 'services', serviceToDelete.id);
      await deleteDoc(serviceDocRef);
      setActionSuccess('Serviço excluído com sucesso!');
    } catch (error) {
      console.error("Erro ao excluir serviço: ", error);
      setActionError('Erro ao excluir serviço. Tente novamente.');
    }
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  if (!currentUser) {
    return (
      <section
        className="min-h-screen bg-cover bg-center bg-fixed relative"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
        <div className="relative z-10 container mx-auto px-4 py-8 pt-24 md:pt-28 text-center">
          <p className="text-white text-xl">Você precisa estar logado para gerenciar serviços.</p>
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
          <h1 className="text-3xl font-bold text-white">Gerenciar Meus Serviços</h1>
          <Link 
            to="/admin/appointments" 
            className="text-sm text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md transition-colors"
          >
            Ver Agenda &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            {isEditing ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </h2>
          {formError && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{formError}</p>}
          {formSuccess && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{formSuccess}</p>}
          
          <form onSubmit={handleSubmitService} className="space-y-4">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
              <input type="text" id="serviceName" value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm" required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
                <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm" required />
              </div>
            </div>
           
            <div className="flex space-x-3">
              <button type="submit" disabled={loading}
                className="flex-grow bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {loading ? (isEditing ? 'Atualizando...' : 'Adicionando...') : (isEditing ? 'Atualizar Serviço' : 'Adicionar Serviço')}
              </button>
              {isEditing && (
                <button type="button" onClick={resetFormAndMode}
                  className="flex-shrink-0 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Serviços Cadastrados</h2>
          {actionError && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{actionError}</p>}
          {actionSuccess && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{actionSuccess}</p>}
          {loadingServices && <p>Carregando serviços...</p>}
          {!loadingServices && services.length === 0 && <p>Você ainda não cadastrou nenhum serviço.</p>}
          {!loadingServices && services.length > 0 && (
            <ul className="space-y-4">
              {services.map(service => (
                <li key={service.id} className="p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex gap-4 items-center mt-2 text-sm">
                        <span className="text-gray-700">Duração: {service.duration} min</span>
                        <span className="text-green-600 font-semibold">R$ {Number(service.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleStartEdit(service)}
                        className="text-blue-600 hover:text-blue-800 text-sm p-1"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                      <button
                        onClick={() => openDeleteConfirmationModal(service)}
                        className="text-red-600 hover:text-red-800 text-sm p-1"
                        title="Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setServiceToDelete(null);
          }}
          onConfirm={handleDeleteService}
          title="Confirmar Exclusão"
          confirmText="Excluir"
        >
          <p>Tem certeza que deseja excluir o serviço "<span className="font-semibold">{serviceToDelete?.name}</span>"?</p>
          <p className="text-sm text-gray-500 mt-2">Esta ação não pode ser desfeita.</p>
        </Modal>

      </div>
    </section>
  );
}

export default AdminServicesPage;