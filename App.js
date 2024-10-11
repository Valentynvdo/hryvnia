import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import WalletButton from './WalletButton';  // Створимо кнопку далі

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json">
      <div>
        <h1>Підключи Ton гаманець</h1>
        <WalletButton />
      </div>
    </TonConnectUIProvider>
  );
}

export default App;
