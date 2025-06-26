function BenefitsSection() {
  const benefits = [
    {
      title: "Otimize seu Tempo",
      description: "Reduza o tempo gasto com agendamentos manuais e foque no seu negócio.",
    },
    {
      title: "Melhore a Experiência do Cliente",
      description: "Ofereça conveniência com agendamentos online a qualquer hora e lugar.",
    },
    {
      title: "Reduza Não Comparecimentos",
      description: "Lembretes automáticos diminuem o número de faltas e otimizam sua agenda.",
    },
    {
      title: "Organização Centralizada",
      description: "Tenha todos os seus agendamentos e dados de clientes em uma única plataforma.",
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-black text-white"> 
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Transforme a Gestão da sua Agenda
          </h2>
          <p className="text-gray-300 mt-4 text-lg">
            Descubra como nossa plataforma pode impulsionar seus resultados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 "> 
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;