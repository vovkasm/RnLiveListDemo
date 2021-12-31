import React from 'react';
import {Button, SafeAreaView} from 'react-native';
import {Navigation} from 'react-native-navigation';

const App = () => (
  <SafeAreaView style={{flex: 1}}>
    <Button
      title="Animated Two Columns"
      onPress={() => {
        Navigation.push('Main', {
          component: {
            name: 'AnimatedTwoColumns',
            options: {topBar: {title: {text: 'Animated Two Columns'}}},
          },
        });
      }}
    />
  </SafeAreaView>
);

export default App;
