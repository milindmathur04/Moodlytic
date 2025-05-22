import React from 'react';
import { SignUpForm } from './auth/SignUpForm';
import { Card } from './ui/Card';
import { Background } from './ui/Background';
import { APP_NAME, APP_DESCRIPTION } from '../constants/app';

export function SignUpPage() {
  return (
    <div className="min-h-screen ios-safe-area px-4 py-8 relative overflow-hidden">
      <Background />
      
      <Card className="max-w-md mx-auto mt-12 p-8 bg-white/80 backdrop-blur-sm">
        <div className="text-center space-y-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Join {APP_NAME}
            </h1>
            <p className="text-ios-body text-ios-gray mt-2">
              {APP_DESCRIPTION}
            </p>
          </div>
        </div>
        
        <SignUpForm />
      </Card>
    </div>
  );
}