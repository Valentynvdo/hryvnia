import React from 'react';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

function App() {
  return (
    <TonConnectUIProvider>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to Your App</h1>
        <TonConnectButton />
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
