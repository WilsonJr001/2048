cat << 'EOF' > README.md
# 🎮 Jogo 2048 - React Native + Expo + SQLite

Este é um clone mobile do famoso jogo **2048**, desenvolvido em **React Native** com **Expo Router** e banco de dados local via **SQLite**. O jogo inclui lógica original de movimentação e fusão dos blocos, além de ranking local persistente com nomes dos 5 maiores jogadores.

---

## ✨ Funcionalidades

- ✅ Swipe em todas as direções para mover blocos
- ✅ Tiles se fundem ao colidir (como no 2048 original)
- ✅ Pontuação atual e recorde
- ✅ Detecção de fim de jogo
- ✅ Animação de Game Over com opção de reinício
- ✅ Ranking local com os 5 maiores scores e nomes
- ✅ Banco de dados local com SQLite (via expo-sqlite)
- ✅ Interface adaptável (responsiva, sem corte de textos)

---

## 🧪 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) – banco de dados local
- [Animated API](https://reactnative.dev/docs/animated) – para transições de game over
- [PanResponder](https://reactnative.dev/docs/panresponder) – para capturar gestos de swipe

---

## 📲 Como Instalar e Rodar o App

### Pré-requisitos

- Node.js
- Expo CLI instalado globalmente

\`\`\`bash
npm install -g expo-cli
\`\`\`

### Passos:

1. Clone o projeto:

\`\`\`bash
git clone https://github.com/seu-usuario/2048-react-native.git
cd 2048-react-native
\`\`\`

2. Instale as dependências:

\`\`\`bash
npm install
\`\`\`

3. Rode o projeto com Expo:

\`\`\`bash
npx expo start
\`\`\`

4. Abra no celular com o app do **Expo Go** (ou use um emulador Android/iOS).

---

## 📁 Estrutura do Projeto

\`\`\`
app/
├── index.jsx             # Tela inicial
└── game/
    ├── GameScreen.jsx    # Tela principal com tabuleiro e lógica do jogo
    └── database.js       # Arquivo com lógica do SQLite (CRUD do ranking)
\`\`\`

---

## 🧠 Como Jogar

- **Objetivo**: Alcance o número 2048 combinando blocos de mesmo valor.
- **Controles**: deslize para cima, baixo, esquerda ou direita.
- O jogo termina quando não há mais movimentos possíveis.
- Se sua pontuação entrar no Top 5, você pode digitar seu nome para ser salvo no ranking.

---

## 🗃️ Banco de Dados (SQLite)

O app usa `expo-sqlite` para salvar e consultar localmente o ranking dos 5 melhores jogadores. A tabela possui:

- \`id\` (inteiro, autoincremento)
- \`name\` (texto)
- \`score\` (inteiro)

As funções de leitura, inserção e ordenação estão no arquivo `database.js`.

---

## 📸 Screenshots (opcional)

Adicione aqui imagens do seu app rodando, caso deseje.

---

## 🔧 Melhorias Futuras

- [ ] Adicionar cores e animações aos tiles
- [ ] Compartilhamento do score final
- [ ] Tema escuro/claro
- [ ] Ranking global (via backend)
- [ ] Modo desafio com tempo ou movimentos limitados

---

## 👨‍💻 Autor

Desenvolvido por **Wilson Júnior** com auxílio do ChatGPT.

---

## 📄 Licença

Este projeto é livre para fins educacionais e pessoais.
EOF