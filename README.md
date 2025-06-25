cat << 'EOF' > README.md
# 🎮 Jogo 2048 - React Native + Expo

Este é um clone mobile do famoso jogo **2048**, desenvolvido usando **React Native** com **Expo Router**. O jogo é simples, viciante e traz recursos como pontuação, ranking local dos 5 melhores jogadores e animação de Game Over.

## ✨ Funcionalidades

- ✅ Movimentação por gestos (swipe)
- ✅ Tiles que se fundem (lógica original do 2048)
- ✅ Pontuação e recorde (Highscore)
- ✅ Animação de Game Over
- ✅ Salvamento de ranking com os 5 maiores scores
- ✅ Input do nome ao entrar no ranking
- ✅ Tela inicial com botão de começar jogo
- ✅ Design responsivo com prevenção de corte de texto

---

## 🧪 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) para salvar ranking e recordes
- [Animated API](https://reactnative.dev/docs/animated) para animações de tela

---

## 📲 Instalação e Execução

### Pré-requisitos

- Node.js instalado
- Expo CLI instalada globalmente  
  \`\`\`bash
  npm install -g expo-cli
  \`\`\`

### Passos para rodar:

1. Clone o repositório:

   \`\`\`bash
   git clone https://github.com/seu-usuario/2048-react-native.git
   cd 2048-react-native
   \`\`\`

2. Instale as dependências:

   \`\`\`bash
   npm install
   \`\`\`

3. Rode o app com o Expo:

   \`\`\`bash
   npx expo start
   \`\`\`

4. Escaneie o QR Code com o app do Expo no seu celular (ou use um emulador Android/iOS).

---

## 📁 Estrutura de Pastas

\`\`\`
app/
├── index.jsx           # Tela inicial do jogo
└── game/
    └── GameScreen.jsx  # Tela principal com o tabuleiro
\`\`\`

---

## 🧠 Como Jogar

- **Objetivo**: combine blocos iguais para atingir o número 2048.
- **Controles**: deslize o dedo para mover os blocos (direita, esquerda, cima ou baixo).
- **Fim de Jogo**: ocorre quando não há mais movimentos possíveis.
- Se sua pontuação for uma das 5 maiores, você poderá digitar seu nome e entrar no ranking local!

---

## 📸 Screenshots (opcional)

Você pode adicionar imagens aqui se desejar mostrar a tela do app.

---

## 🛠️ To-Do (Sugestões futuras)

- [ ] Adicionar cores diferentes para cada tile (2, 4, 8, 16, etc.)
- [ ] Adicionar efeito de animação nos blocos ao se fundirem
- [ ] Suporte a temas claro/escuro
- [ ] Compartilhar score
- [ ] Integração com leaderboard online

---

## 🧑‍💻 Autor

Desenvolvido por **Wilson Júnior** com apoio do ChatGPT.

---

## 📄 Licença

Este projeto é livre para uso pessoal e educacional. Para uso comercial, personalize a licença de acordo com seu caso.
EOF