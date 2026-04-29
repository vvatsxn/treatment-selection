import React, { useState, useEffect } from 'react';
import QuestionnaireScreen from './screens/QuestionnaireScreen';
import Concept9Screen from './screens/Concept9Screen';
import PhotoCaptureScreen from './screens/PhotoCaptureScreen';
import PhotoCaptureScreen2 from './screens/PhotoCaptureScreen2';

// Phlo Clinic screens
import GettingStartedScreen from './screens/phlo/GettingStartedScreen';
import SignInScreen from './screens/phlo/SignInScreen';
import QuestionnaireFlowScreen from './screens/phlo/QuestionnaireFlowScreen';
import ProductSelectionScreen from './screens/phlo/ProductSelectionScreen';
import SupplyDurationScreen from './screens/phlo/SupplyDurationScreen';
import CheckoutScreen from './screens/phlo/CheckoutScreen';
import MyAccountScreen from './screens/phlo/MyAccountScreen';
import OrdersScreen from './screens/phlo/OrdersScreen';
import MyAccountScreenC1 from './screens/phlo/concept-1/MyAccountScreen';
import OrdersScreenC1 from './screens/phlo/concept-1/OrdersScreen';
import MyAccountScreenC2 from './screens/phlo/concept-2/MyAccountScreen';
import OrdersScreenC2 from './screens/phlo/concept-2/OrdersScreen';
import WeightLossHubScreen from './screens/phlo/WeightLossHubScreen';
import MyDetailsScreen from './screens/phlo/MyDetailsScreen';

const getRoute = () => {
  const path = window.location.pathname;

  // ── Phlo Clinic routes ────────────────────────────────────────────────────
  if (path.startsWith('/phlo/concept-1/my-account/orders')) return 'phlo-c1-orders';
  if (path.startsWith('/phlo/concept-1/my-account'))        return 'phlo-c1-my-account';
  if (path.startsWith('/phlo/concept-2/my-account/orders')) return 'phlo-c2-orders';
  if (path.startsWith('/phlo/concept-2/my-account'))        return 'phlo-c2-my-account';
  if (path.startsWith('/phlo/my-account/weight-loss-hub')) return 'phlo-weight-loss-hub';
  if (path.startsWith('/phlo/my-account/orders'))          return 'phlo-orders';
  if (path.startsWith('/phlo/my-account/details'))         return 'phlo-details';
  if (path.startsWith('/phlo/my-account'))                 return 'phlo-my-account';
  if (path.startsWith('/phlo/product-selection/supply'))   return 'phlo-supply';
  if (path.startsWith('/phlo/product-selection'))          return 'phlo-product-selection';
  if (path.startsWith('/phlo/questionnaire'))              return 'phlo-questionnaire';
  if (path.startsWith('/phlo/checkout'))                   return 'phlo-checkout';
  if (path.startsWith('/phlo/sign-in'))                    return 'phlo-sign-in';
  if (path.startsWith('/phlo/getting-started'))            return 'phlo-getting-started';
  if (path.startsWith('/phlo'))                            return 'phlo-getting-started';

  // ── Existing prototype routes ─────────────────────────────────────────────
  if (path.startsWith('/treatment-selection-2') || path.startsWith('/concept-2')) return 'treatment-selection-2';
  if (path.startsWith('/photo-capture-2'))                           return 'photo-capture-2';
  if (path.startsWith('/photo-capture/camera'))                      return 'photo-capture-camera';
  if (path.startsWith('/photo-capture/upload'))                      return 'photo-capture-upload';
  if (path.startsWith('/photo-capture/before-you-start'))            return 'photo-capture-before-you-start';
  if (path.startsWith('/photo-capture'))                             return 'photo-capture';

  return 'treatment-selection-1';
};

const App = () => {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Phlo Clinic ───────────────────────────────────────────────────────────
  if (route === 'phlo-getting-started')   return <GettingStartedScreen />;
  if (route === 'phlo-sign-in')           return <SignInScreen />;
  if (route === 'phlo-questionnaire')     return <QuestionnaireFlowScreen />;
  if (route === 'phlo-product-selection') return <ProductSelectionScreen />;
  if (route === 'phlo-supply')            return <SupplyDurationScreen />;
  if (route === 'phlo-checkout')          return <CheckoutScreen />;
  if (route === 'phlo-my-account')        return <MyAccountScreen />;
  if (route === 'phlo-orders')            return <OrdersScreen />;
  if (route === 'phlo-c1-my-account')    return <MyAccountScreenC1 />;
  if (route === 'phlo-c1-orders')        return <OrdersScreenC1 />;
  if (route === 'phlo-c2-my-account')    return <MyAccountScreenC2 />;
  if (route === 'phlo-c2-orders')        return <OrdersScreenC2 />;
  if (route === 'phlo-weight-loss-hub')   return <WeightLossHubScreen />;
  if (route === 'phlo-details')           return <MyDetailsScreen />;

  // ── Existing prototypes ───────────────────────────────────────────────────
  if (route === 'treatment-selection-2') return <Concept9Screen />;
  if (route === 'photo-capture-2')       return <PhotoCaptureScreen2 />;
  if (
    route === 'photo-capture' ||
    route === 'photo-capture-upload' ||
    route === 'photo-capture-camera' ||
    route === 'photo-capture-before-you-start'
  ) {
    return <PhotoCaptureScreen />;
  }

  return <QuestionnaireScreen />;
};

export default App;
