import React from 'react';
import {WelcomeScreen} from '@/components/screens/WelcomeScreen';

export default function AuthIndexScreen() {
  const handleGetStarted = () => {
    console.log('User clicked Get Started');
  };

  return <WelcomeScreen onGetStarted={handleGetStarted} />;
}