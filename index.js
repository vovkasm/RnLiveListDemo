import { Navigation } from 'react-native-navigation';

import App from './App';
import AnimatedTwoColumns from './AnimatedTwoColumns';

Navigation.registerComponent('App', () => App);
Navigation.registerComponent('AnimatedTwoColumns', () => AnimatedTwoColumns);

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        id: 'Main',
        children: [
          {
            component: {
              name: 'App',
              options: { topBar: { title: { text: 'RN Demo' } } },
            },
          },
        ],
      },
    },
  });
});
