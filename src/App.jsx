import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/landingPage/Header';   

function App() {
  return (
    <div className="relative"> 
      <Header />
      
      <main>
      
        
        <Outlet />
      </main>
      
    
    </div>
  );
}

export default App;