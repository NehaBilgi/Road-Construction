import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Machine,
  TripLog,
  FuelDispenseLog,
  RoadLayerYieldCalculation,
  SiteExpenseVoucher,
  PettyCashWallet,
  DailyProgressReport,
  OfflineSyncQueueItem,
  UserRole,
  RoadProjectProfile,
  MachineOperationalStatus,
  PavementLayerType
} from '../types/roadERP';
import {
  CURRENT_ROAD_PROJECT,
  INITIAL_ROAD_FLEET,
  INITIAL_TRIP_LOGS,
  INITIAL_FUEL_LOGS,
  INITIAL_YIELD_CALCULATIONS,
  INITIAL_EXPENSE_VOUCHERS,
  INITIAL_PETTY_CASH_WALLETS,
  INITIAL_DPR
} from '../data/mockRoadData';

interface RoadERPContextType {
  // Project & User Role
  project: RoadProjectProfile;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;

  // Offline Engine
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  syncQueue: OfflineSyncQueueItem[];
  triggerManualSync: () => void;
  clearSyncQueue: () => void;

  // Machine Fleet
  machines: Machine[];
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  updateMachineStatus: (id: string, status: MachineOperationalStatus) => void;
  updateMachineHMR: (id: string, newHMR: number, newKMR?: number) => void;

  // Trip & Haulage
  trips: TripLog[];
  addTripLog: (trip: Omit<TripLog, 'id' | 'tripSlipNumber' | 'syncStatus'>) => void;
  deleteTripLog: (id: string) => void;

  // Fuel Management
  fuelLogs: FuelDispenseLog[];
  addFuelLog: (log: Omit<FuelDispenseLog, 'id' | 'voucherChallanNo' | 'syncStatus' | 'isAbnormalSpike' | 'specificFuelConsumption' | 'runDifference' | 'totalCost'>) => void;
  deleteFuelLog: (id: string) => void;

  // Road Yield Calculator
  yieldCalculations: RoadLayerYieldCalculation[];
  saveYieldCalculation: (calc: Omit<RoadLayerYieldCalculation, 'id' | 'updatedAt' | 'actualMaterialReceivedTons' | 'actualTripsReceivedCount' | 'varianceTons' | 'variancePercentage' | 'yieldStatus'>) => void;
  recalculateYieldWithActuals: (layerId: string) => void;

  // Expenses & Petty Cash
  expenses: SiteExpenseVoucher[];
  addExpenseVoucher: (voucher: Omit<SiteExpenseVoucher, 'id' | 'voucherNumber' | 'syncStatus'>) => void;
  updateExpenseStatus: (id: string, status: SiteExpenseVoucher['status']) => void;
  deleteExpenseVoucher: (id: string) => void;
  pettyCashWallets: PettyCashWallet[];
  refillPettyCash: (walletId: string, amount: number) => void;

  // DPR Reports
  dprReports: DailyProgressReport[];
  generateTodayDPR: () => DailyProgressReport;

  // Reset & Clear Data
  clearAllData: () => void;
  resetToSampleData: () => void;

  // Global KPIs
  kpis: {
    totalFleetCount: number;
    activeFleetCount: number;
    idleFleetCount: number;
    breakdownFleetCount: number;
    fleetUtilizationRate: number;
    totalMaterialTonsLaidToday: number;
    totalTripsLoggedToday: number;
    totalFuelBurnedLitresToday: number;
    totalFuelCostINR: number;
    totalSiteExpensesINR: number;
    averageCostPerKmINR: number;
    flaggedFuelAnomaliesCount: number;
  };
}

const RoadERPContext = createContext<RoadERPContextType | undefined>(undefined);

export const RoadERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClearedSlate = typeof window !== 'undefined' && localStorage.getItem('ERP_DATA_CLEARED_SLATE') === 'true';
  const [project] = useState<RoadProjectProfile>(CURRENT_ROAD_PROJECT);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('SITE_ENGINEER');

  // Network Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem('road_erp_sync_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // State entities with LocalStorage persistence
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('road_erp_machines');
    return saved ? JSON.parse(saved) : INITIAL_ROAD_FLEET;
  });

  const [trips, setTrips] = useState<TripLog[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem('road_erp_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIP_LOGS;
  });

  const [fuelLogs, setFuelLogs] = useState<FuelDispenseLog[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem('road_erp_fuel_logs');
    return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
  });

  const [yieldCalculations, setYieldCalculations] = useState<RoadLayerYieldCalculation[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem('road_erp_yield_calcs');
    return saved ? JSON.parse(saved) : INITIAL_YIELD_CALCULATIONS;
  });

  const [expenses, setExpenses] = useState<SiteExpenseVoucher[]>(() => {
    if (isClearedSlate) return [];
    const saved = localStorage.getItem('road_erp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSE_VOUCHERS;
  });

  const [pettyCashWallets, setPettyCashWallets] = useState<PettyCashWallet[]>(() => {
    const saved = localStorage.getItem('road_erp_petty_cash');
    return saved ? JSON.parse(saved) : INITIAL_PETTY_CASH_WALLETS;
  });

  const [dprReports, setDprReports] = useState<DailyProgressReport[]>(() => {
    if (isClearedSlate) return [];
    return [INITIAL_DPR];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('road_erp_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('road_erp_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('road_erp_fuel_logs', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('road_erp_yield_calcs', JSON.stringify(yieldCalculations));
  }, [yieldCalculations]);

  useEffect(() => {
    localStorage.setItem('road_erp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('road_erp_petty_cash', JSON.stringify(pettyCashWallets));
  }, [pettyCashWallets]);

  useEffect(() => {
    localStorage.setItem('road_erp_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Machine Actions
  const addMachine = (machineData: Omit<Machine, 'id'>) => {
    const newMachine: Machine = {
      ...machineData,
      id: `m-${Date.now()}`
    };
    setMachines((prev) => [newMachine, ...prev]);

    if (!isOnline) {
      const queueItem: OfflineSyncQueueItem = {
        id: `sync-m-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'MACHINE_UPDATE',
        action: 'CREATE',
        payload: newMachine,
        retryCount: 0,
        status: 'QUEUED'
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
    }
  };

  const updateMachineStatus = (id: string, status: MachineOperationalStatus) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const updateMachineHMR = (id: string, newHMR: number, newKMR?: number) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              currentHMR: newHMR,
              currentKMR: newKMR !== undefined ? newKMR : m.currentKMR
            }
          : m
      )
    );
  };

  // Trip Logging with auto-sync status
  const addTripLog = (tripData: Omit<TripLog, 'id' | 'tripSlipNumber' | 'syncStatus'>) => {
    const seq = String(trips.length + 1).padStart(3, '0');
    const slipNo = `TRIP-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${seq}`;
    const newTrip: TripLog = {
      ...tripData,
      id: `trip-${Date.now()}`,
      tripSlipNumber: slipNo,
      syncStatus: isOnline ? 'SYNCED' : 'PENDING_OFFLINE'
    };

    setTrips((prev) => [newTrip, ...prev]);

    // Also update machine pavement section & active trip count
    if (newTrip.machineId) {
      setMachines((prev) =>
        prev.map((m) =>
          m.id === newTrip.machineId
            ? { ...m, pavementSectionAssigned: newTrip.formattedChainage, status: 'ACTIVE' }
            : m
        )
      );
    }

    // Auto update yield calculation match if layer exists
    updateYieldWithNewTrip(newTrip);

    if (!isOnline) {
      const queueItem: OfflineSyncQueueItem = {
        id: `sync-trip-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'TRIP',
        action: 'CREATE',
        payload: newTrip,
        retryCount: 0,
        status: 'QUEUED'
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
    }
  };

  const deleteTripLog = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to cross-match trips into Yield calculations
  const updateYieldWithNewTrip = (trip: TripLog) => {
    setYieldCalculations((prev) =>
      prev.map((calc) => {
        if (calc.layerType === trip.layerType) {
          const newActualTons = calc.actualMaterialReceivedTons + trip.netWeightTons;
          const newTripCount = calc.actualTripsReceivedCount + 1;
          const variance = newActualTons - calc.totalWeightTonsRequired;
          const variancePct = calc.totalWeightTonsRequired > 0 ? (variance / calc.totalWeightTonsRequired) * 100 : 0;
          let status: RoadLayerYieldCalculation['yieldStatus'] = 'IN_PROGRESS';
          if (newActualTons >= calc.totalWeightTonsRequired * 0.95 && newActualTons <= calc.totalWeightTonsRequired * 1.05) {
            status = 'OPTIMAL';
          } else if (newActualTons > calc.totalWeightTonsRequired * 1.05) {
            status = 'OVER_CONSUMPTION';
          }

          return {
            ...calc,
            actualMaterialReceivedTons: Number(newActualTons.toFixed(2)),
            actualTripsReceivedCount: newTripCount,
            varianceTons: Number(variance.toFixed(2)),
            variancePercentage: Number(variancePct.toFixed(2)),
            yieldStatus: status,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return calc;
      })
    );
  };

  // Fuel Dispense Logging with Meter Delta & Spike Detection
  const addFuelLog = (
    logData: Omit<
      FuelDispenseLog,
      | 'id'
      | 'voucherChallanNo'
      | 'syncStatus'
      | 'isAbnormalSpike'
      | 'specificFuelConsumption'
      | 'runDifference'
      | 'totalCost'
    >
  ) => {
    const targetMachine = machines.find((m) => m.id === logData.machineId);
    const benchmark = targetMachine ? targetMachine.averageConsumptionBenchmark : 15.0;
    const runDiff = Math.max(0.1, logData.currentMeterReading - logData.previousMeterReading);
    const totalCost = logData.litresDispensed * logData.ratePerLitre;

    // Specific Fuel Consumption calculation:
    // For HMR machines (L/hr): litres / hours_run
    // For KMR machines (km/L): kms_run / litres
    let sfc = 0;
    let isSpike = false;
    let deviationPct = 0;

    if (logData.meterType === 'HMR_HOURS') {
      sfc = Number((logData.litresDispensed / runDiff).toFixed(2));
      // In L/hr, higher than benchmark means excessive burn/theft
      if (benchmark > 0 && sfc > benchmark * 1.25) {
        isSpike = true;
        deviationPct = Number((((sfc - benchmark) / benchmark) * 100).toFixed(1));
      }
    } else {
      sfc = Number((runDiff / logData.litresDispensed).toFixed(2));
      // In km/L, lower than benchmark means excessive burn/theft
      if (benchmark > 0 && sfc < benchmark * 0.75) {
        isSpike = true;
        deviationPct = Number((((benchmark - sfc) / benchmark) * 100).toFixed(1));
      }
    }

    const seq = String(fuelLogs.length + 1).padStart(3, '0');
    const voucherNo = `FL-${logData.fuelSource.substring(0, 4)}-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${seq}`;

    const newFuelLog: FuelDispenseLog = {
      ...logData,
      id: `fuel-${Date.now()}`,
      voucherChallanNo: voucherNo,
      totalCost,
      runDifference: runDiff,
      specificFuelConsumption: sfc,
      benchmarkConsumption: benchmark,
      isAbnormalSpike: isSpike,
      spikeDeviationPercentage: deviationPct,
      syncStatus: isOnline ? 'SYNCED' : 'PENDING_OFFLINE'
    };

    setFuelLogs((prev) => [newFuelLog, ...prev]);

    // Update machine current fuel level and HMR/KMR
    if (targetMachine) {
      updateMachineHMR(
        targetMachine.id,
        logData.meterType === 'HMR_HOURS' ? logData.currentMeterReading : targetMachine.currentHMR,
        logData.meterType === 'KMR_ODOMETER' ? logData.currentMeterReading : targetMachine.currentKMR
      );
    }

    if (!isOnline) {
      const queueItem: OfflineSyncQueueItem = {
        id: `sync-fuel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'FUEL',
        action: 'CREATE',
        payload: newFuelLog,
        retryCount: 0,
        status: 'QUEUED'
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
    }
  };

  const deleteFuelLog = (id: string) => {
    setFuelLogs((prev) => prev.filter((f) => f.id !== id));
  };

  // Road Yield Calculator Save
  const saveYieldCalculation = (
    calcData: Omit<
      RoadLayerYieldCalculation,
      | 'id'
      | 'updatedAt'
      | 'actualMaterialReceivedTons'
      | 'actualTripsReceivedCount'
      | 'varianceTons'
      | 'variancePercentage'
      | 'yieldStatus'
    >
  ) => {
    // Find matching trips to calculate initial actuals
    const matchingTrips = trips.filter((t) => t.layerType === calcData.layerType);
    const actualTons = matchingTrips.reduce((sum, t) => sum + t.netWeightTons, 0);
    const actualTrips = matchingTrips.length;
    const variance = actualTons - calcData.totalWeightTonsRequired;
    const variancePct = calcData.totalWeightTonsRequired > 0 ? (variance / calcData.totalWeightTonsRequired) * 100 : 0;

    let status: RoadLayerYieldCalculation['yieldStatus'] = 'IN_PROGRESS';
    if (actualTons >= calcData.totalWeightTonsRequired * 0.95 && actualTons <= calcData.totalWeightTonsRequired * 1.05) {
      status = 'OPTIMAL';
    } else if (actualTons > calcData.totalWeightTonsRequired * 1.05) {
      status = 'OVER_CONSUMPTION';
    }

    const newCalc: RoadLayerYieldCalculation = {
      ...calcData,
      id: `yield-${Date.now()}`,
      actualMaterialReceivedTons: Number(actualTons.toFixed(2)),
      actualTripsReceivedCount: actualTrips,
      varianceTons: Number(variance.toFixed(2)),
      variancePercentage: Number(variancePct.toFixed(2)),
      yieldStatus: status,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setYieldCalculations((prev) => [newCalc, ...prev]);
  };

  const recalculateYieldWithActuals = (layerId: string) => {
    setYieldCalculations((prev) =>
      prev.map((calc) => {
        if (calc.id === layerId) {
          const matchingTrips = trips.filter((t) => t.layerType === calc.layerType);
          const actualTons = matchingTrips.reduce((sum, t) => sum + t.netWeightTons, 0);
          const actualTrips = matchingTrips.length;
          const variance = actualTons - calc.totalWeightTonsRequired;
          const variancePct = calc.totalWeightTonsRequired > 0 ? (variance / calc.totalWeightTonsRequired) * 100 : 0;
          let status: RoadLayerYieldCalculation['yieldStatus'] = 'IN_PROGRESS';
          if (actualTons >= calc.totalWeightTonsRequired * 0.95 && actualTons <= calc.totalWeightTonsRequired * 1.05) {
            status = 'OPTIMAL';
          } else if (actualTons > calc.totalWeightTonsRequired * 1.05) {
            status = 'OVER_CONSUMPTION';
          }

          return {
            ...calc,
            actualMaterialReceivedTons: Number(actualTons.toFixed(2)),
            actualTripsReceivedCount: actualTrips,
            varianceTons: Number(variance.toFixed(2)),
            variancePercentage: Number(variancePct.toFixed(2)),
            yieldStatus: status,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return calc;
      })
    );
  };

  // Expenses & Petty Cash
  const addExpenseVoucher = (
    voucherData: Omit<SiteExpenseVoucher, 'id' | 'voucherNumber' | 'syncStatus'>
  ) => {
    const seq = String(expenses.length + 1).padStart(3, '0');
    const voucherNo = `EXP-NH50-${new Date().getFullYear()}-${seq}`;

    const newVoucher: SiteExpenseVoucher = {
      ...voucherData,
      id: `exp-${Date.now()}`,
      voucherNumber: voucherNo,
      syncStatus: isOnline ? 'SYNCED' : 'PENDING_OFFLINE'
    };

    setExpenses((prev) => [newVoucher, ...prev]);

    // If paid via Petty Cash, deduct from supervisor's wallet
    if (voucherData.paymentMode === 'PETTY_CASH') {
      setPettyCashWallets((prev) =>
        prev.map((w) => {
          if (w.remainingBalance >= voucherData.amount) {
            return {
              ...w,
              spentAmount: w.spentAmount + voucherData.amount,
              remainingBalance: w.remainingBalance - voucherData.amount
            };
          }
          return w;
        })
      );
    }

    if (!isOnline) {
      const queueItem: OfflineSyncQueueItem = {
        id: `sync-exp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'EXPENSE',
        action: 'CREATE',
        payload: newVoucher,
        retryCount: 0,
        status: 'QUEUED'
      };
      setSyncQueue((prev) => [queueItem, ...prev]);
    }
  };

  const updateExpenseStatus = (id: string, status: SiteExpenseVoucher['status']) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const deleteExpenseVoucher = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const refillPettyCash = (walletId: string, amount: number) => {
    setPettyCashWallets((prev) =>
      prev.map((w) =>
        w.id === walletId
          ? {
              ...w,
              totalAllocatedBudget: w.totalAllocatedBudget + amount,
              remainingBalance: w.remainingBalance + amount,
              lastRefillDate: new Date().toISOString().substring(0, 10)
            }
          : w
      )
    );
  };

  // DPR Generator
  const generateTodayDPR = (): DailyProgressReport => {
    const today = new Date().toISOString().substring(0, 10);
    const todayTrips = trips.filter((t) => t.date === today || t.date === '2026-08-14');
    const todayFuel = fuelLogs.filter((f) => f.date === today || f.date === '2026-08-14');
    const todayExp = expenses.filter((e) => e.date === today || e.date === '2026-08-14');

    const totalTrips = todayTrips.length;
    const totalTons = todayTrips.reduce((sum, t) => sum + t.netWeightTons, 0);
    const totalFuelLitres = todayFuel.reduce((sum, f) => sum + f.litresDispensed, 0);
    const totalFuelCost = todayFuel.reduce((sum, f) => sum + f.totalCost, 0);
    const totalExp = todayExp.reduce((sum, e) => sum + e.amount, 0);

    const activeCount = machines.filter((m) => m.status === 'ACTIVE').length;
    const idleCount = machines.filter((m) => m.status === 'IDLE').length;
    const breakdownCount = machines.filter((m) => m.status === 'BREAKDOWN' || m.status === 'MAINTENANCE').length;

    const newDPR: DailyProgressReport = {
      id: `dpr-${Date.now()}`,
      reportDate: today,
      projectTitle: project.name,
      contractorName: 'Bilgi Infra Construction Pvt. Ltd.',
      weatherCondition: 'Sunny / Clear',
      workingHours: 11.5,
      totalTripsLogged: totalTrips,
      totalMaterialTonsLaid: Number(totalTons.toFixed(1)),
      totalFuelBurnedLitres: totalFuelLitres,
      totalFuelCostINR: totalFuelCost,
      activeFleetCount: activeCount,
      idleFleetCount: idleCount,
      breakdownFleetCount: breakdownCount,
      linearMetersPaved: 540,
      chainageCoverageSummary: `Covering stretch Ch. ${project.startChainageKm}+000 to Ch. ${project.endChainageKm}+000 with ${totalTrips} active haulage runs.`,
      totalSiteExpensesToday: totalExp,
      siteEngineerInCharge: 'Ibrahim (Senior Field Supervisor)',
      residentEngineerSignOff: 'K. S. Narayana (NHAI Authority Engineer)',
      criticalHindrancesOrRemarks: 'Daily progress recorded with offline-sync resilience. All asphalt laydown meets MoRTH Section 500 specifications.'
    };

    setDprReports((prev) => [newDPR, ...prev]);
    return newDPR;
  };

  // Sync Offline Queue to Online
  const triggerManualSync = () => {
    if (syncQueue.length === 0) return;
    // Simulate API batch sync
    setTimeout(() => {
      // Mark all pending offline trips, fuels, expenses as SYNCED
      setTrips((prev) => prev.map((t) => ({ ...t, syncStatus: 'SYNCED' })));
      setFuelLogs((prev) => prev.map((f) => ({ ...f, syncStatus: 'SYNCED' })));
      setExpenses((prev) => prev.map((e) => ({ ...e, syncStatus: 'SYNCED' })));
      setSyncQueue([]);
    }, 600);
  };

  const clearSyncQueue = () => {
    setSyncQueue([]);
  };

  // Reset & Clear Data
  const clearAllData = () => {
    setTrips([]);
    setFuelLogs([]);
    setExpenses([]);
    setYieldCalculations([]);
    setDprReports([]);
    setSyncQueue([]);
    try {
      localStorage.removeItem('road_erp_trips');
      localStorage.removeItem('road_erp_fuel_logs');
      localStorage.removeItem('road_erp_expenses');
      localStorage.removeItem('road_erp_yield_calcs');
      localStorage.removeItem('road_erp_sync_queue');
      localStorage.setItem('ERP_DATA_CLEARED_SLATE', 'true');
    } catch {
      // ignore
    }
  };

  const resetToSampleData = () => {
    setTrips(INITIAL_TRIP_LOGS);
    setFuelLogs(INITIAL_FUEL_LOGS);
    setExpenses(INITIAL_EXPENSE_VOUCHERS);
    setYieldCalculations(INITIAL_YIELD_CALCULATIONS);
    setMachines(INITIAL_ROAD_FLEET);
    setPettyCashWallets(INITIAL_PETTY_CASH_WALLETS);
    setDprReports([INITIAL_DPR]);
    setSyncQueue([]);
    try {
      localStorage.removeItem('ERP_DATA_CLEARED_SLATE');
      localStorage.removeItem('road_erp_trips');
      localStorage.removeItem('road_erp_fuel_logs');
      localStorage.removeItem('road_erp_expenses');
      localStorage.removeItem('road_erp_yield_calcs');
      localStorage.removeItem('road_erp_sync_queue');
    } catch {
      // ignore
    }
  };

  // Calculated KPIs
  const kpis = useMemo(() => {
    const totalFleetCount = machines.length;
    const activeFleetCount = machines.filter((m) => m.status === 'ACTIVE').length;
    const idleFleetCount = machines.filter((m) => m.status === 'IDLE').length;
    const breakdownFleetCount = machines.filter((m) => m.status === 'BREAKDOWN' || m.status === 'MAINTENANCE').length;
    const fleetUtilizationRate = totalFleetCount > 0 ? (activeFleetCount / totalFleetCount) * 100 : 0;

    const totalMaterialTonsLaidToday = trips.reduce((sum, t) => sum + t.netWeightTons, 0);
    const totalTripsLoggedToday = trips.length;
    const totalFuelBurnedLitresToday = fuelLogs.reduce((sum, f) => sum + f.litresDispensed, 0);
    const totalFuelCostINR = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const totalSiteExpensesINR = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Total Cost per KM calculation
    const totalCostAll = totalFuelCostINR + totalSiteExpensesINR;
    const completedLengthKm = 14.5; // current active stretch completed
    const averageCostPerKmINR = completedLengthKm > 0 ? totalCostAll / completedLengthKm : 0;

    const flaggedFuelAnomaliesCount = fuelLogs.filter((f) => f.isAbnormalSpike).length;

    return {
      totalFleetCount,
      activeFleetCount,
      idleFleetCount,
      breakdownFleetCount,
      fleetUtilizationRate: Number(fleetUtilizationRate.toFixed(1)),
      totalMaterialTonsLaidToday: Number(totalMaterialTonsLaidToday.toFixed(1)),
      totalTripsLoggedToday,
      totalFuelBurnedLitresToday,
      totalFuelCostINR,
      totalSiteExpensesINR,
      averageCostPerKmINR: Number(averageCostPerKmINR.toFixed(0)),
      flaggedFuelAnomaliesCount
    };
  }, [machines, trips, fuelLogs, expenses]);

  return (
    <RoadERPContext.Provider
      value={{
        project,
        currentUserRole,
        setCurrentUserRole,
        isOnline,
        setIsOnline,
        syncQueue,
        triggerManualSync,
        clearSyncQueue,
        machines,
        addMachine,
        updateMachineStatus,
        updateMachineHMR,
        trips,
        addTripLog,
        deleteTripLog,
        fuelLogs,
        addFuelLog,
        deleteFuelLog,
        yieldCalculations,
        saveYieldCalculation,
        recalculateYieldWithActuals,
        expenses,
        addExpenseVoucher,
        updateExpenseStatus,
        deleteExpenseVoucher,
        pettyCashWallets,
        refillPettyCash,
        dprReports,
        generateTodayDPR,
        clearAllData,
        resetToSampleData,
        kpis
      }}
    >
      {children}
    </RoadERPContext.Provider>
  );
};

export const useRoadERP = () => {
  const context = useContext(RoadERPContext);
  if (!context) {
    throw new Error('useRoadERP must be used within a RoadERPProvider');
  }
  return context;
};
