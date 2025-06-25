import { useNavigation } from 'expo-router';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function StartScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate('game/GameScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          Bem-vindo ao 2048
        </Text>

        <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
          Deslize para combinar os blocos!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
            Iniciar Jogo
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#776e65',
    marginBottom: 20,
    width: '100%',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#776e65',
    marginBottom: 40,
    width: '100%',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f67c5f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
  },
});
