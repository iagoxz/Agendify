function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Esta plataforma transformou a maneira como gerenciamos nossos agendamentos. Simples e eficiente!",
      name: "Ana Silva",
      company: "Beleza Pura Studio",
    },
    {
      quote: "A redução de faltas foi notável após começarmos a usar os lembretes automáticos. Recomendo!",
      name: "Carlos Moura",
      company: "Consultório Dr. Carlos",
    },
    {
      quote: "Meus clientes adoram a facilidade de agendar online. A interface é muito intuitiva.",
      name: "Juliana Costa",
      company: "Espaço Zen Terapias",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-200">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            A satisfação de quem usa nossa plataforma é nosso maior orgulho.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8"> 
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white/30 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20"
            >
              <p className="text-gray-700 text-center italic mb-6">"{testimonial.quote}"</p>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;