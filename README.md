# MedicLembrete 💊

Aplicativo mobile para ajudar pessoas em tratamento médico contínuo a nunca esquecerem de tomar seus remédios, com controle de estoque integrado.

---

## Sobre o projeto

O MedicLembrete resolve um problema simples e recorrente: pacientes esquecem de tomar remédios no horário certo, não sabem se já tomaram a dose do dia e só percebem que o estoque acabou quando a cartela está vazia.

O app centraliza o controle de medicamentos de forma simples e confiável — o usuário cadastra seus remédios uma única vez e o app cuida do restante.

---

## Funcionalidades

- Cadastro de remédios com nome, dosagem, horário e frequência
- Lembretes push nos horários configurados, mesmo com o app fechado
- Confirmação de dose direto na notificação ("Tomei" / "Adiar")
- Histórico de doses do dia com status (tomada, pendente, ignorada)
- Controle de estoque com decremento automático por dose confirmada
- Alerta quando o estoque está chegando ao fim
- Login com Google (OAuth 2.0)
- Funciona offline — todos os dados ficam no dispositivo

---

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile (Android + iOS) | React Native + Expo |
| Banco local | SQLite via `expo-sqlite` |
| Notificações | `expo-notifications` + Firebase Cloud Messaging |
| Autenticação | Google Sign-In via `expo-auth-session` |
| Backend / API | ASP.NET Core Web API (.NET 10) |
| Banco servidor | SQL Server / PostgreSQL |

> **MVP:** o backend não é utilizado na Fase 1. Toda a lógica roda localmente no dispositivo.

---

## Estrutura do repositório

```
mediclembrete/
├── mobile/          # Projeto Expo (React Native)
│   ├── app/         # Telas e navegação
│   ├── components/  # Componentes reutilizáveis
│   ├── services/    # SQLite, notificações, autenticação
│   └── assets/      # Imagens e fontes
├── api/             # Projeto ASP.NET Core Web API (Layered Architecture)
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   └── Data/
└── docs/            # Documentação do projeto
```

---

## Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) LTS
- [.NET 10 SDK](https://dotnet.microsoft.com)
- [Expo Go](https://expo.dev/go) instalado no celular
- Git

### Frontend (mobile)

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR code com o Expo Go no celular. O app abre em segundos.

### Backend (API)

> O backend não é necessário para rodar o MVP.

```bash
cd api
dotnet restore
dotnet run
```

A API sobe em `https://localhost:5001` por padrão.

---

## Roadmap

| Fase | Descrição | Status |
|---|---|---|
| Fase 1 — MVP | Cadastro, lembretes, confirmação de dose, estoque, login Google | 🚧 Em desenvolvimento |
| Fase 2 — Polimento | Onboarding, acessibilidade, temas claro/escuro | 📋 Planejado |
| Fase 3 — Qualidade | Testes automatizados, otimizações | 📋 Planejado |
| Fase 4 — Lançamento | Google Play + App Store | 📋 Planejado |

---

## Licença

Projeto pessoal — uso livre para fins de aprendizado.
