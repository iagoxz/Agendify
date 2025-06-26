# Agendify - Sistema de Agendamento Moderno 🚀

Agendify é uma aplicação web, para fornecer uma solução moderna e intuitiva de agendamento para empresas de diversos segmentos. O projeto foca em uma interface limpa, funcional e com funcionalidades tanto para o cliente final quanto para o administrador da empresa.

![image](https://github.com/user-attachments/assets/3f45cbdb-b882-4af3-a9c1-d3c86138e1fb)


## ✨ Funcionalidades Principais

Este projeto foi construído de forma que permite uma experiência completa para os dois tipos de usuários da plataforma.

![{5EE5401B-DF8D-4DE7-8CA5-972049E5751B}](https://github.com/user-attachments/assets/bdff59f8-7926-477c-8c8b-4670e63c1b70)


### Para Clientes
- **Cadastro de Cliente:** Sistema de registro simples e rápido.
- **Visualização de Empresas:** Navegação para páginas de serviços de empresas específicas através de URLs amigáveis (slugs).
- **Listagem de Serviços:** Visualização clara dos serviços oferecidos por uma empresa, com detalhes como descrição, duração e preço.
- **Fluxo de Agendamento Completo:**
    - Calendário interativo (`react-day-picker`) para seleção de data.
    - Cálculo de horários disponíveis em tempo real, baseado na disponibilidade da empresa e em agendamentos já existentes.
    - Modal de confirmação antes de finalizar o agendamento.
- **"Meus Agendamentos":** Uma página pessoal para o cliente visualizar seus agendamentos futuros e passados, com a opção de cancelar.
- **Notificações por E-mail:** Recebimento de um e-mail de confirmação automático após cada agendamento bem-sucedido.

### Para Empresários (Administradores)
- **Cadastro de Empresa:** Sistema de registro diferenciado que captura o nome da empresa e gera uma URL (slug) única e amigável.
- **Painel Administrativo:** Área de gerenciamento centralizada com navegação intuitiva através de um menu dropdown.
- **Gerenciamento de Serviços (CRUD Completo):**
    - Adicionar, listar, **editar** e **excluir** serviços.
    - A gestão é exclusiva para os serviços da sua própria empresa.
- **Gerenciamento de Disponibilidade:** Interface para configurar os horários de funcionamento para cada dia da semana.
- **Agenda de Agendamentos:** Visualização de todos os agendamentos recebidos em uma tabela organizada, com a opção de cancelar um agendamento.
- **Link Compartilhável:** Funcionalidade para copiar facilmente a URL da sua página de serviços para divulgação aos clientes.

## ⚙️ Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas e populares no ecossistema JavaScript/React.

- **Frontend:**
    - **React:** Biblioteca principal para a construção da interface de usuário.
    - **Vite:** Ferramenta de build extremamente rápida para o ambiente de desenvolvimento.
    - **Tailwind CSS:** Framework CSS utility-first para estilização rápida, moderna e responsiva.
- **Navegação:**
    - **React Router DOM:** Para gerenciamento de rotas e navegação na aplicação (SPA).
- **Backend como Serviço (BaaS):**
    - **Firebase:**
        - **Authentication:** Para o sistema completo de autenticação (cadastro, login, logout) e gerenciamento de usuários.
        - **Firestore:** Banco de dados NoSQL para armazenar todos os dados da aplicação (usuários, empresas, serviços, agendamentos, disponibilidade).
- **Estado Global:**
    - **React Context API:** Para gerenciar o estado de autenticação globalmente (saber quem está logado e sua função).
- **UI & Componentes:**
    - **`react-day-picker`:** Biblioteca para o calendário interativo de agendamento.
    - **`date-fns`:** Para manipulação robusta e confiável de datas.
- **Notificações:**
    - **EmailJS:** Para envio de e-mails transacionais (confirmação de agendamento) diretamente do frontend, sem a necessidade de um servidor de backend.

## 🚀 Como Executar o Projeto Localmente

Para rodar este projeto na sua máquina, siga os passos abaixo.

### Pré-requisitos
- **Node.js:** Versão 16 ou superior.
- **npm** ou **yarn:** Gerenciador de pacotes.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Este projeto requer chaves de API para se conectar ao Firebase и ao EmailJS.

    * Crie um arquivo chamado `.env` na raiz do seu projeto.
    * Copie e cole o conteúdo abaixo no arquivo `.env`, substituindo os valores pelos da sua própria conta.

    ```env
    # Chaves do Firebase (Encontre no Console do Firebase > Configurações do Projeto > Seus apps)
    VITE_FIREBASE_API_KEY=SUA_API_KEY_AQUI
    VITE_FIREBASE_AUTH_DOMAIN=SEU_DOMINIO_DE_AUTENTICACAO_AQUI
    VITE_FIREBASE_PROJECT_ID=SEU_ID_DE_PROJETO_AQUI
    VITE_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET_AQUI
    VITE_FIREBASE_MESSAGING_SENDER_ID=SEU_SENDER_ID_AQUI
    VITE_FIREBASE_APP_ID=SEU_APP_ID_AQUI

    # Chaves do EmailJS (Encontre no seu painel do EmailJS)
    VITE_EMAILJS_SERVICE_ID=SEU_SERVICE_ID_AQUI
    VITE_EMAILJS_TEMPLATE_ID=SEU_TEMPLATE_ID_AQUI
    VITE_EMAILJS_PUBLIC_KEY=SUA_PUBLIC_KEY_AQUI
    ```
    **Importante:** Adicione o arquivo `.env` ao seu `.gitignore` para não expor suas chaves!

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## 🔮 Melhorias Futuras e Próximos Passos

A aplicação está funcional, mas ainda em fase de desenvolvimento:
- [ ] **Visão de Calendário para o Admin:** Transformar a lista de agendamentos do admin em uma agenda visual com `react-big-calendar`.
- [ ] **Diretório de Empresas:** Criar uma página onde clientes possam buscar e descobrir as empresas cadastradas na plataforma.
- [ ] **Notificações Avançadas:** Implementar e-mails de lembrete (24h antes) e de cancelamento.
- [ ] **Gerenciamento de Status:** Permitir que o admin mude o status de um agendamento para "Concluído" ou "Não Compareceu".
- [ ] **Feedback de UI:** Substituir os `alert()` por notificações "toast" mais elegantes para uma melhor experiência do usuário.
- [ ] **Interfaces Novas para melhor navegaçao** Adicionar uma interface de "Empresas visitadas" para melhor navegaçao de usuario pelas empresas.

---
Feito com ❤️ por Iago - github.com/iagoxz - linkedin.com/in/iagomoura-dev/
