import { useState } from 'react';
import { Layout, type TabId } from './components/Layout';
import { ImportRuns } from './components/ImportRuns';
import { TierLab } from './components/TierLab';
import { UpgradeQueue } from './components/UpgradeQueue';
import { CellBudget } from './components/CellBudget';
import { BuildState } from './components/BuildState';
import { TournamentHistory } from './components/TournamentHistory';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('runs');

  const renderContent = () => {
    switch (activeTab) {
      case 'runs':
        return <ImportRuns />;
      case 'tier-lab':
        return <TierLab />;
      case 'upgrade-queue':
        return <UpgradeQueue />;
      case 'cell-budget':
        return <CellBudget />;
      case 'build-state':
        return <BuildState />;
      case 'tournament':
        return <TournamentHistory />;
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
