import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { FinanceProvider } from './context/FinanceContext';
import { SettingsProvider } from './context/SettingsContext';

import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Income from './components/Income';
import TagsManager from './components/TagsManager';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'expenses': return <Expenses />;
      case 'income': return <Income />;
      case 'tags': return <TagsManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <SettingsProvider>
      <FinanceProvider>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--notion-bg)', color: 'var(--notion-text)' }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {renderContent()}
          </main>
        </div>
      </FinanceProvider>
    </SettingsProvider>
  );
}

export default App;
