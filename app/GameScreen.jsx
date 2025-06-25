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
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

const GRID_SIZE = 4;

// Banco de Dados (SQLite)
async function openDb() {
  return SQLite.openDatabaseAsync('game2048.db');
}

async function initDB() {
  const db = await openDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ranking (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, score INTEGER NOT NULL);
  `);
  const highScoreResult = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', 'highScore');
  if (!highScoreResult) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', 'highScore', '0');
  }
}

async function getHighScoreFromDB() {
  const db = await openDb();
  const result = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', 'highScore');
  return result ? parseInt(result.value, 10) : 0;
}

async function updateHighScoreInDB(score) {
  const db = await openDb();
  await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', score.toString(), 'highScore');
}

async function getRankingFromDB() {
  const db = await openDb();
  return await db.getAllAsync('SELECT * FROM ranking ORDER BY score DESC LIMIT 5');
}

async function saveRankingToDB(playerName, score) {
    const db = await openDb();
    const newId = Crypto.randomUUID();
    await db.runAsync(
      'INSERT INTO ranking (id, name, score) VALUES (?, ?, ?)',
      newId,
      playerName || 'Anônimo',
      score
    );
    const allScores = await db.getAllAsync('SELECT id FROM ranking ORDER BY score DESC');
    if (allScores.length > 5) {
        const idsToDelete = allScores.slice(5).map(item => item.id);
        const placeholders = idsToDelete.map(() => '?').join(',');
        await db.runAsync(`DELETE FROM ranking WHERE id IN (${placeholders})`, ...idsToDelete);
    }
}

// Lógica do Jogo
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
      await initDB();
      const initialHighScore = await getHighScoreFromDB();
      setHighScore(initialHighScore);
      const initialRanking = await getRankingFromDB();
      setRanking(initialRanking);
      const startGrid = addRandomTile(addRandomTile(getEmptyGrid()));
      setGrid(startGrid);
    };
    init().catch(err => console.error("Erro ao inicializar o jogo:", err));
  }, []);

  useEffect(() => {
    if (gameOver) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      const topScores = [...ranking].sort((a, b) => b.score - a.score);
      const isLowScore = topScores.length >= 5 && score <= topScores[4].score;
      setIsTop5(!isLowScore);
    } else {
      fadeAnim.setValue(0);
      setPlayerName('');
    }
  }, [gameOver]);

  const saveRanking = async () => {
    await saveRankingToDB(playerName, score);
    const updatedRanking = await getRankingFromDB();
    setRanking(updatedRanking);
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
    onPanResponderRelease: async (_, { dx, dy }) => {
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
          await updateHighScoreInDB(newScore);
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
          <View key={cIdx} style={[styles.tile, getTileColor(val)]}>
            <Text style={[styles.tileText, getTileTextColor(val)]} numberOfLines={1} adjustsFontSizeToFit>
              {val !== 0 ? val : ''}
            </Text>
          </View>
        ))}
      </View>
    ));

  const getTileColor = (value) => {
    const colors = {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
      128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
    };
    return { backgroundColor: colors[value] || '#cdc1b4' };
  };
  const getTileTextColor = (value) => ({ color: value > 4 ? '#f9f6f2' : '#776e65' });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Text style={styles.title}>2048</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.scoreValue}>{highScore}</Text>
          </View>
        </View>
        <View style={styles.grid}>{renderGrid()}</View>
        {gameOver && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}> 
            {isTop5 ? (
              <>
                <Text style={styles.gameOverText} adjustsFontSizeToFit>Você entrou no ranking!</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome"
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={saveRanking} style={styles.resetButton}>
                  <Text style={styles.resetButtonText}>Salvar e Reiniciar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.gameOverText}>Game Over</Text>
                <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
                  <Text style={styles.resetButtonText}>Reiniciar</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        )}
        <View style={styles.rankingBox}>
          <Text style={styles.rankingTitle}>Ranking TOP 5</Text>
          {ranking.length > 0 ? ranking.map((entry, i) => (
            <Text key={entry.id} style={styles.rankingItem} numberOfLines={1}>
              {i + 1}. {entry.name} - {entry.score}
            </Text>
          )) : <Text style={styles.rankingItem}>Jogue para entrar no ranking!</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ef',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#776e65',
    marginBottom: 12,
    letterSpacing: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 12,
    marginBottom: 24,
  },
  scoreBox: {
    backgroundColor: '#bbada0',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#eee4da',
    marginBottom: 2,
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  grid: {
    backgroundColor: '#bbada0',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    width: 64,
    height: 64,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  tileText: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(238, 228, 218, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 24,
    borderRadius: 12,
  },
  gameOverText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#776e65',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    textAlign: 'center',
    marginBottom: 18,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resetButton: {
    backgroundColor: '#8f7a66',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
    marginTop: 6,
  },
  resetButtonText: {
    color: '#f9f6f2',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  rankingBox: {
    marginTop: 36,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f3ede6',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#776e65',
    letterSpacing: 1,
  },
  rankingItem: {
    fontSize: 16,
    color: '#776e65',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
