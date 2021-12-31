import React from 'react';
import { Button, SafeAreaView, StyleSheet } from 'react-native';
import { Navigation } from 'react-native-navigation';

const App = () => (
  <SafeAreaView style={styles.container}>
    <Button
      title="Animated Two Columns"
      onPress={() => {
        Navigation.push('Main', {
          component: {
            name: 'AnimatedTwoColumns',
            options: { topBar: { title: { text: 'Animated Two Columns' } } },
          },
        });
      }}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
