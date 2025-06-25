import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const GRID_SIZE = 4;
const RANKING_KEY = 'top5Ranking';

function getEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function addRandomTile(grid) {
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push({ row: r, col: c });
    }
  }
  if (emptyCells.length === 0) return grid;
  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function slide(row, scoreRef) {
  const arr = row.filter(val => val !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      scoreRef.value += arr[i];
      arr[i + 1] = 0;
    }
  }
  return arr.filter(val => val !== 0);
}

function moveLeft(grid, scoreRef) {
  return grid.map(row => {
    const newRow = slide(row, scoreRef);
    while (newRow.length < GRID_SIZE) newRow.push(0);
    return newRow;
  });
}

function moveRight(grid, scoreRef) {
  return grid.map(row => {
    const reversed = [...row].reverse();
    const newRow = slide(reversed, scoreRef);
    while (newRow.length < GRID_SIZE) newRow.push(0);
    return newRow.reverse();
  });
}

function transpose(grid) {
  return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
}

function moveUp(grid, scoreRef) {
  const transposed = transpose(grid);
  const moved = moveLeft(transposed, scoreRef);
  return transpose(moved);
}

function moveDown(grid, scoreRef) {
  const transposed = transpose(grid);
  const moved = moveRight(transposed, scoreRef);
  return transpose(moved);
}

function gridsAreEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function hasValidMoves(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val === 0) return true;
      const right = c < GRID_SIZE - 1 ? grid[r][c + 1] : null;
      const down = r < GRID_SIZE - 1 ? grid[r + 1]?.[c] : null;
      if (val === right || val === down) return true;
    }
  }
  return false;
}

export default function GameScreen() {
  const [grid, setGrid] = useState(getEmptyGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [isTop5, setIsTop5] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const init = async () => {
      const saved = await AsyncStorage.getItem('highScore');
      if (saved) setHighScore(parseInt(saved));

      const storedRanking = await AsyncStorage.getItem(RANKING_KEY);
      if (storedRanking) {
        setRanking(JSON.parse(storedRanking));
      }

      const startGrid = addRandomTile(addRandomTile(getEmptyGrid()));
      setGrid(startGrid);
    };
    init();
  }, []);

  useEffect(() => {
    if (gameOver) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // verificar se score entra no top 5
      const newList = [...ranking, { name: '', score }];
      const topSorted = newList.sort((a, b) => b.score - a.score).slice(0, 5);
      const isInTop5 = topSorted.some(entry => entry.score === score && entry.name === '');
      setIsTop5(isInTop5);
    } else {
      fadeAnim.setValue(0);
      setPlayerName('');
    }
  }, [gameOver]);

  const saveRanking = async () => {
    const newList = [...ranking, { name: playerName || 'Anônimo', score }];
    const sorted = newList.sort((a, b) => b.score - a.score).slice(0, 5);
    setRanking(sorted);
    await AsyncStorage.setItem(RANKING_KEY, JSON.stringify(sorted));
    resetGame();
  };

  const resetGame = () => {
    setGrid(addRandomTile(addRandomTile(getEmptyGrid())));
    setScore(0);
    setGameOver(false);
    setIsTop5(false);
    setPlayerName('');
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 20 || Math.abs(dy) > 20,
    onPanResponderRelease: (_, { dx, dy }) => {
      if (gameOver) return;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      let newGrid = grid;
      const scoreRef = { value: 0 };

      if (absDx > absDy) {
        newGrid = dx > 0 ? moveRight(grid, scoreRef) : moveLeft(grid, scoreRef);
      } else {
        newGrid = dy > 0 ? moveDown(grid, scoreRef) : moveUp(grid, scoreRef);
      }

      if (!gridsAreEqual(grid, newGrid)) {
        newGrid = addRandomTile(newGrid);
        const newScore = score + scoreRef.value;
        setGrid(newGrid);
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          AsyncStorage.setItem('highScore', newScore.toString());
        }
        if (!hasValidMoves(newGrid)) {
          setGameOver(true);
        }
      }
    },
  });

  const renderGrid = () =>
    grid.map((row, rIdx) => (
      <View key={rIdx} style={styles.row}>
        {row.map((val, cIdx) => (
          <View key={cIdx} style={styles.tile}>
            <Text style={styles.tileText} numberOfLines={1} adjustsFontSizeToFit>
              {val !== 0 ? val : ''}
            </Text>
          </View>
        ))}
      </View>
    ));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>2048</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText} numberOfLines={1} adjustsFontSizeToFit>
            Score: {score}
          </Text>
          <Text style={styles.scoreText} numberOfLines={1} adjustsFontSizeToFit>
            High Score: {highScore}
          </Text>
        </View>

        <View style={styles.grid}>{renderGrid()}</View>

        {gameOver && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            {isTop5 ? (
              <>
                <Text style={styles.gameOverText} numberOfLines={1} adjustsFontSizeToFit>
                  Você entrou no ranking!
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome"
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={saveRanking} style={styles.resetButton}>
                  <Text style={styles.resetButtonText} numberOfLines={1} adjustsFontSizeToFit>
                    Salvar e Reiniciar
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.gameOverText} numberOfLines={1} adjustsFontSizeToFit>
                  Game Over
                </Text>
                <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
                  <Text style={styles.resetButtonText} numberOfLines={1} adjustsFontSizeToFit>
                    Reiniciar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        )}

        <View style={styles.rankingBox}>
          <Text style={styles.rankingTitle} numberOfLines={1} adjustsFontSizeToFit>
            Ranking TOP 5
          </Text>
          {ranking.map((entry, i) => (
            <Text key={i} style={styles.rankingItem} numberOfLines={1} adjustsFontSizeToFit>
              {i + 1}. {entry.name} - {entry.score}
            </Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8ef' },
  title: { fontSize: 36, fontWeight: 'bold', marginTop: 40, textAlign: 'center', color: '#776e65' },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#776e65',
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    backgroundColor: '#bbada0',
    padding: 5,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  row: { flexDirection: 'row' },
  tile: {
    width: 70,
    height: 70,
    backgroundColor: '#cdc1b4',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  tileText: {
    fontWeight: 'bold',
    color: '#776e65',
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    width: '100%',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    width: '80%',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
  },
  resetButton: {
    backgroundColor: '#f67c5f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  rankingBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  rankingItem: {
    fontSize: 16,
    color: '#444',
  },
});
