import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import QuestionnaireScreen from './screens/QuestionnaireScreen';
import Concept9Screen from './screens/Concept9Screen';
import PhotoCaptureScreen from './screens/PhotoCaptureScreen';

const getRoute = () => {
  const path = window.location.pathname;
  if (path.startsWith('/treatment-selection-2')) return 'treatment-selection-2';
  if (path.startsWith('/photo-capture/camera')) return 'photo-capture-camera';
  if (path.startsWith('/photo-capture/upload')) return 'photo-capture-upload';
  if (path.startsWith('/photo-capture')) return 'photo-capture';
  return 'treatment-selection-1';
};

const App = () => {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route === 'treatment-selection-2') {
    return <Concept9Screen />;
  }

  if (route === 'photo-capture' || route === 'photo-capture-upload' || route === 'photo-capture-camera') {
    return <PhotoCaptureScreen />;
  }

  return <QuestionnaireScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
