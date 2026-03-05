import { AppRegistry } from 'react-native';
import App from './src/App';

// Register the app for web
AppRegistry.registerComponent('TreatmentSelection', () => App);

// Run the app
AppRegistry.runApplication('TreatmentSelection', {
  rootTag: document.getElementById('root'),
});
