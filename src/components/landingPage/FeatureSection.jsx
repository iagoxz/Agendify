function FeatureSection() {

      const features = [
      {
        title: "Calendario interativo",
        description: "Visualize e gerencie seus horários com um calendário fácil de usar.",
      },
      {
        title: "Agendamento Online Facil",
        description: "Seus clientes podem agendar serviços 24/7 de qualquer dispositivo.",
      },
      {
        title: "Notificações Automáticas",
        description: "Receba lembretes e notificações instantâneas sobre novos agendamentos.",
      },
      {
        title: "Painel Administrativo",
        description: "Gerencie seus serviços, clientes e configurações em um só lugar.",
      },
    ];
  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold gray-800">
            Funcionalidades Pensadas para Você
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Tudo o que você precisa para otimizar seus agendamentos.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg 
             transition-all duration-300 ease-in-out 
             hover:shadow-1 xl hover:-translate-y-1 hover:scale-105">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-700 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}

export default FeatureSection;