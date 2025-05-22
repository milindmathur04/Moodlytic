import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />
      
      {/* Animated gradient orbs */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-purple-200/20 via-pink-200/20 to-orange-200/20 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-orange-200/20 via-pink-200/20 to-purple-200/20 blur-3xl animate-float-slower" />
      
      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-blue-200/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 rounded-full bg-purple-200/10 blur-3xl animate-float-reverse" />
    </div>
  );
}