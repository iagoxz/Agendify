import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';

function BusinessServicesPage() {
  const { businessSlug } = useParams();
  const backgroundImageUrl = '/backgrounds/bg.png';
  
  const [services, setServices] = useState([]);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!businessSlug) {
      setError("Slug da empresa não fornecido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setServices([]);
    setBusinessDetails(null);

    const fetchBusinessAndServices = async () => {
      try {
        const businessesRef = collection(db, 'businesses');
        const businessQuery = query(businessesRef, where('slug', '==', businessSlug), limit(1));
        const businessSnapshot = await getDocs(businessQuery);

        if (businessSnapshot.empty) {
          setError('Empresa não encontrada.');
          setLoading(false);
          return;
        }

        const businessDoc = businessSnapshot.docs[0];
        const foundBusinessDetails = { id: businessDoc.id, ...businessDoc.data() };
        setBusinessDetails(foundBusinessDetails);
        
        const actualBusinessId = businessDoc.id;

        const servicesCollectionRef = collection(db, 'services');
        const servicesQuery = query(
          servicesCollectionRef,
          where('businessId', '==', actualBusinessId),
          where('isActive', '==', true),
          orderBy('name', 'asc')
        );

        const unsubscribeServices = onSnapshot(servicesQuery, (querySnapshot) => {
          const servicesData = [];
          querySnapshot.forEach((doc) => {
            servicesData.push({ id: doc.id, ...doc.data() });
          });
          setServices(servicesData);
          setLoading(false);
        }, (err) => {
          console.error(`Erro ao buscar serviços para ${businessSlug}: `, err);
          if (err.code === 'failed-precondition') {
            setError("Erro ao buscar dados. Pode ser necessário criar um índice no Firestore. Verifique o console do navegador para um link.");
          } else {
            setError("Erro ao carregar lista de serviços.");
          }
          setLoading(false);
        });
        
        return unsubscribeServices;

      } catch (err) {
        console.error("Erro geral ao buscar empresa e serviços: ", err);
        setError("Ocorreu um erro ao carregar a página da empresa.");
        setLoading(false);
      }
    };

    let unsubscribe = () => {};
    fetchBusinessAndServices().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });
    
    return () => unsubscribe();

  }, [businessSlug]);

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24 md:pt-28">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Serviços Disponíveis
        </h1>
        {businessDetails && <p className="text-xl text-gray-300 text-center mb-10">de {businessDetails.name}</p>}
        {!businessDetails && !loading && !error && <p className="text-xl text-gray-300 text-center mb-10">Carregando nome da empresa...</p>}

        {loading && <p className="text-center text-white">Carregando...</p>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
        
        {!loading && services.length === 0 && !error && (
          <p className="text-center text-xl text-gray-300">
            Nenhum serviço ativo encontrado para esta empresa ou a empresa não foi encontrada.
          </p>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">{service.name}</h2>
                  <p className="text-gray-700 text-sm mb-4 h-20 overflow-y-auto custom-scrollbar">{service.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duração:</span> {service.duration} min
                    </p>
                    <p className="text-lg text-green-700 font-bold mt-1">
                      R$ {Number(service.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/agendar/empresa/${businessSlug}/servico/${service.id}`}
                  className="w-full mt-4 bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md text-center"
                >
                  Agendar Agora
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BusinessServicesPage;