import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import QuestionnaireScreen from './screens/QuestionnaireScreen';
import Concept2Screen from './screens/Concept2Screen';
import Concept3Screen from './screens/Concept3Screen';
import Concept4Screen from './screens/Concept4Screen';
import Concept5Screen from './screens/Concept5Screen';
import Concept6Screen from './screens/Concept6Screen';
import Concept7Screen from './screens/Concept7Screen';
import Concept8Screen from './screens/Concept8Screen';

const getRoute = () => {
  const path = window.location.pathname;
  if (path.startsWith('/concept-8')) return 'concept-8';
  if (path.startsWith('/concept-7')) return 'concept-7';
  if (path.startsWith('/concept-6')) return 'concept-6';
  if (path.startsWith('/concept-5')) return 'concept-5';
  if (path.startsWith('/concept-4')) return 'concept-4';
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

  if (route === 'concept-8') {
    return <Concept2Screen />;
  }

  if (route === 'concept-7') {
    return <Concept7Screen />;
  }

  if (route === 'concept-6') {
    return <Concept6Screen />;
  }

  if (route === 'concept-5') {
    return <Concept5Screen />;
  }

  if (route === 'concept-4') {
    return <Concept4Screen />;
  }

  if (route === 'concept-3') {
    return <Concept3Screen />;
  }

  if (route === 'concept-2') {
    return <Concept8Screen />;
  }

  return <QuestionnaireScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
