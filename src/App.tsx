import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import QuestionnaireScreen from './screens/QuestionnaireScreen';
import Concept2Screen from './screens/Concept2Screen';
import Concept3Screen from './screens/Concept3Screen';

const getRoute = () => {
  const path = window.location.pathname;
  if (path.startsWith('/concept-3')) return 'concept-3';
  if (path.startsWith('/concept-2')) return 'concept-2';
  return 'concept-1';
};

const App = () => {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === 'concept-3') {
    return <Concept3Screen />;
  }

  if (route === 'concept-2') {
    return <Concept2Screen />;
  }

  return <QuestionnaireScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
