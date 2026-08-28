import { useState, useEffect } from 'react';
import { Layout, type TabId } from './components/Layout';
import { ImportRuns } from './components/ImportRuns';
import { TierLab } from './components/TierLab';
import { ResearchQueue } from './components/ResearchQueue';
import { CellBudget } from './components/CellBudget';
import { StonesPanel } from './components/StonesPanel';
import { CardsPanel } from './components/CardsPanel';
import { BuildState } from './components/BuildState';
import { TournamentHistory } from './components/TournamentHistory';
import { PerksWikiPanel } from './components/PerksWikiPanel';
import { syncReferenceData } from './domain/refDataService';
import { initAuth } from './domain/authService';
import { initSyncEngine } from './domain/syncEngine';
import { getAllRunsIDB } from './domain/db/indexedDB';
import { useStore } from './domain/store';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('runs');

  useEffect(() => {
    // 1. Initialize Supabase anonymous session & adoption checks
    initAuth();

    // 2. Initialize sync engine listeners (window focus, online/offline)
    initSyncEngine();

    // 3. Background sync of reference data
    syncReferenceData();

    // 4. Hydrate runs from IndexedDB if store has not loaded them
    getAllRunsIDB()
      .then((idbRuns) => {
        if (idbRuns && idbRuns.length > 0) {
          const storeRuns = useStore.getState().runs;
          if (storeRuns.length === 0) {
            useStore.setState({ runs: idbRuns });
          }
        }
      })
      .catch(console.warn);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'runs':
        return <ImportRuns />;
      case 'tier-lab':
        return <TierLab />;
      case 'research-queue':
        return <ResearchQueue />;
      case 'cell-budget':
        return <CellBudget />;
      case 'stones':
        return <StonesPanel />;
      case 'cards':
        return <CardsPanel />;
      case 'build-state':
        return <BuildState />;
      case 'tournament':
        return <TournamentHistory />;
      case 'perks-wiki':
        return <PerksWikiPanel />;
      default:
        return <ImportRuns />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-fadeIn">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
