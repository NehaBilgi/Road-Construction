import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';

import { Header } from './components/navigation/Header';
import { Sidebar } from './components/navigation/Sidebar';

import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { VendorAdvancesModule } from './components/VendorAdvancesModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';
import { InstallAppButton } from './components/InstallAppButton';
import { ThemeToggle } from './components/ThemeToggle';
import { UserManagementModule } from './components/configuration/UserManagementModule';

import { ProductsMasterModule } from './components/building/ProductsMasterModule';
import { BuildingReportsModule } from './components/building/BuildingReportsModule';
import { BuildingAlertsModule } from './components/building/BuildingAlertsModule';
import { BuildingMaterialCategoriesModule } from './components/categories/BuildingMaterialCategoriesModule';
import { RoadMaterialCategoriesModule } from './components/categories/RoadMaterialCategoriesModule';
import { RCCCalculators } from './components/calculator/RCCCalculators';
import { AttendancePayrollModule } from './components/building/AttendancePayrollModule';

import {
  AlertTriangle,
  RotateCcw,
  Archive,
  Compass
} from 'lucide-react';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; errorText: string; }

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error.message || 'Unknown render error' };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">Dashboard Encountered an Error</h1>
          <p className="text-xs text-slate-400 max-w-lg font-mono bg-[#121927] p-3 rounded-xl border border-[#1E293B] text-left overflow-x-auto">
            {this.state.errorText}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
                window.location.reload();
              }}
              className="px-4 py-2 bg-[#162032] hover:bg-[#1f2d47] border border-[#2b3a58] text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Choose Another Site
            </button>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <RotateCcw className="w-4 h-4" /> Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GenericView: React.FC<{ title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; }> = ({ title, subtitle, icon: Icon }) => (
  <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-4 font-sans text-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="p-8 rounded-2xl bg-[#080d19] border border-[#182643] text-center text-slate-400 text-xs">
      {title} telemetry and operations active on site.
    </div>
  </div>
);

export const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets = [],
    currentUser,
    userRole,
    appDomain,
    setAppDomain
  } = useERP() as any;

  const currentRoleStr = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRoleStr === 'SUPER_ADMIN' || currentRoleStr === 'ADMIN' || currentRoleStr.includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    if (!isAdmin) return userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
    try {
      const saved = sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
      if (saved === 'ROAD' || saved === 'BUILDING') return saved;
    } catch {}
    return null;
  });

  const [hasSelectedSite, setHasSelectedSite] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) {
      const fixedDomain = userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
      if (projectType !== fixedDomain) {
        setProjectType(fixedDomain);
        if (setAppDomain) setAppDomain(fixedDomain);
        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', fixedDomain);
      }
    } else if (appDomain && appDomain !== 'BOTH' && (appDomain === 'ROAD' || appDomain === 'BUILDING')) {
      setProjectType(appDomain);
      sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', appDomain);
    }
  }, [userScope, isAdmin, appDomain, projectType, setAppDomain]);

  if (!isAuthenticated) return <LoginPage />;

  if (!projectType && isAdmin) {
    return (
      <ProjectTypeSelectionPage
        onSelectProjectType={(type) => {
          setProjectType(type);
          if (setAppDomain) setAppDomain(type);
          sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', type);
        }}
      />
    );
  }

  const activeDomain = projectType || (userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD');
  const safeSiteSheets = Array.isArray(siteSheets) ? siteSheets : [];

  if (!hasSelectedSite || !selectedSiteId || safeSiteSheets.length === 0) {
    return (
      <SiteSelectionPage
        projectType={activeDomain}
        onSelectSite={(siteId) => {
          setSelectedSiteId(siteId);
          setHasSelectedSite(true);
          sessionStorage.setItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION', 'true');
        }}
        onBackToDomainSelect={
          isAdmin
            ? () => {
                setProjectType(null);
                setHasSelectedSite(false);
                sessionStorage.removeItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
                sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 relative h-[calc(100vh-56px)] overflow-hidden">
        <div className="hidden lg:block h-full shrink-0 w-64">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            projectType={activeDomain}
            isAdminUser={isAdmin}
            onSwitchDomain={
              isAdmin
                ? () => {
                    const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                    setProjectType(next);
                    if (setAppDomain) setAppDomain(next);
                    sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                  }
                : undefined
            }
          />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 max-w-[260px] w-full bg-[#0D111D] h-full flex flex-col z-50 shadow-2xl">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                projectType={activeDomain}
                isAdminUser={isAdmin}
                onSwitchDomain={
                  isAdmin
                    ? () => {
                        const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                        setProjectType(next);
                        if (setAppDomain) setAppDomain(next);
                        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                      }
                    : undefined
                }
                onClose={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-56px)] scrollbar-thin scrollbar-thumb-[#1E293B]">
          <div className="max-w-7xl mx-auto pb-12 w-full overflow-x-hidden">
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && (
              <RoadSitesManagerModule projectType={activeDomain} onNavigateTab={setActiveTab} />
            )}

            {activeDomain === 'ROAD' && (
              <>
                {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
                {activeTab === 'vendor-advances' && <VendorAdvancesModule />}
                {activeTab === 'diesel' && <DieselFuelManagementModule />}
                {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
                {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
                {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
                {activeTab === 'categories' && <RoadMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
              </>
            )}

            {activeDomain === 'BUILDING' && (
              <>
                {activeTab === 'products' && <ProductsMasterModule />}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'building_calculator' && <RCCCalculators />}
                {activeTab === 'categories' && <BuildingMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
                {activeTab === 'reports' && <BuildingReportsModule />}
                {activeTab === 'alerts' && <BuildingAlertsModule onNavigateTab={setActiveTab} />}
                {activeTab === 'attendance-salary' && <AttendancePayrollModule />}
                {activeTab === 'yearly-archive' && (
                  <GenericView title="Yearly Archive" subtitle="Annual building records" icon={Archive} />
                )}
                {activeTab.startsWith('custom-') && (
                  <GenericView
                    title={activeTab.replace('custom-', '').toUpperCase()}
                    subtitle="Custom Site Module"
                    icon={Compass}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <ERPProvider>
        <RoadERPProvider>
          <AppContent />
        </RoadERPProvider>
      </ERPProvider>
    </AppErrorBoundary>
  );
};

export default App;
