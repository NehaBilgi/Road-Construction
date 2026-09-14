import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  WorkType,
  UserRole,
  User,
  Project,
  Site,
  RoadSection,
  BuildingFloor,
  MaterialItem,
  StockLedgerEntry,
  MaterialConsumptionRecord,
  VehicleTrip,
  MachineryRecord,
  MachineryLog,
  DieselLog,
  Worker,
  AttendanceRecord,
  LabourPaymentSheet,
  DailyRoadProduction,
  DailyBuildingProduction,
  BOQItem,
  MeasurementBookEntry,
  BBSItem,
  AuditLogEntry,
  ERPNotification,
  ApprovalStatus,
  SiteMatrixSheet,
  SiteMatrixRow,
  SiteExpenseRecord
} from '../types/erp';
import {
  INITIAL_PROJECTS,
  INITIAL_ROAD_SECTIONS,
  INITIAL_BUILDING_FLOORS,
  INITIAL_MATERIALS,
  INITIAL_STOCK_LEDGER,
  INITIAL_CONSUMPTION_RECORDS,
  INITIAL_VEHICLE_TRIPS,
  INITIAL_MACHINERY_LOGS,
  INITIAL_DIESEL_LOGS,
  INITIAL_WORKERS,
  INITIAL_ATTENDANCE,
  INITIAL_ROAD_PRODUCTION,
  INITIAL_BUILDING_PRODUCTION,
  INITIAL_BOQ,
  INITIAL_MEASUREMENTS,
  INITIAL_BBS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SITE_SHEETS,
  INITIAL_SITE_EXPENSES,
  INITIAL_HAULAGE_TRIPS,
  INITIAL_DIESEL_LOGS_SAMPLE,
  INITIAL_SITE_EXPENSES_SAMPLE
} from '../data/initialData';

export interface ManagedUser extends User {
  username: string;
  password?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: '123',
    name: 'Habibulla Bilgi (Director)',
    email: 'habibullabilgiabu@gmail.com',
    role: 'Admin' as any,
    status: 'ACTIVE'
  },
  {
    id: 'usr-mgr-1',
    username: 'manager',
    password: '123',
    name: 'Neha (Inventory Manager)',
    email: 'manager@plant.com',
    role: 'Inventory Manager' as any,
    status: 'ACTIVE'
  },
  {
    id: 'usr-store-1',
    username: 'keeper',
    password: '123',
    name: 'Ibrahim (Store Keeper)',
    email: 'keeper@plant.com',
    role: 'Store Keeper' as any,
    status: 'ACTIVE'
  },
  {
    id: 'usr-store-2',
    username: 'ibrahim',
    password: '123',
    name: 'Ibrahim Site Incharge',
    email: 'ibrahim@bilgi.com',
    role: 'Store Keeper' as any,
    status: 'ACTIVE'
  },
  {
    id: 'usr-mgr-2',
    username: 'neha',
    password: '123',
    name: 'Neha Bilgi (Accounts & Ops)',
    email: 'neha@bilgi.com',
    role: 'Inventory Manager' as any,
    status: 'ACTIVE'
  },
  {
    id: 'usr-aud-1',
    username: 'auditor',
    password: '123',
    name: 'Auditor User',
    email: 'auditor@plant.com',
    role: 'Auditor' as any,
    status: 'ACTIVE'
  }
];

export interface AddRoadSiteInput {
  projectId?: string;
  siteName: string;
  siteCode?: string;
  location: string;
  supervisor: string;
  startChainageKm?: number;
  endChainageKm?: number;
  carriagewayWidthMeters?: number;
  carriagewayType?: string;
  vehicles?: string[];
  projectType?: 'ROAD' | 'BUILDING';
  category?: 'ROAD' | 'BUILDING' | string;
  buildingFloors?: string;
}

interface ERPContextType {
  isAuthenticated: boolean;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  userRole: UserRole | string;
  setUserRole: (role: UserRole | string) => void;

  usersList: ManagedUser[];
  addManagedUser: (user: Omit<ManagedUser, 'id'>) => void;
  updateManagedUser: (id: string, user: Partial<ManagedUser>) => void;
  deleteManagedUser: (id: string) => void;

  workType: WorkType | null;
  setWorkType: (type: WorkType | null) => void;

  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedSiteId: string;
  setSelectedSiteId: (id: string) => void;
  currentProject: Project | undefined;
  currentSite: Site | undefined;

  projects: Project[];
  addProject: (proj: Partial<Project>) => Project;
  updateProject: (id: string, proj: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSiteToProject: (projectId: string, siteName: string, location: string, supervisor: string) => void;
  deleteSite: (siteId: string) => void;
  addRoadSiteSection: (input: AddRoadSiteInput) => string;
  deleteRoadSiteSection: (siteId: string) => void;

  roadSections: RoadSection[];
  updateRoadLayerProgress: (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => void;
  buildingFloors: BuildingFloor[];
  updateBuildingFloor: (floorId: string, data: Partial<BuildingFloor>) => void;
  addBuildingFloor: (floor: Partial<BuildingFloor>) => void;

  materials: MaterialItem[];
  addMaterial: (item: Omit<MaterialItem, 'id'>) => void;
  updateMaterial: (id: string, data: Partial<MaterialItem>) => void;
  deleteMaterial: (id: string) => void;

  stockLedger: StockLedgerEntry[];
  addStockTransaction: (entry: Omit<StockLedgerEntry, 'id'>) => void;
  consumptionRecords: MaterialConsumptionRecord[];
  addConsumptionRecord: (rec: Omit<MaterialConsumptionRecord, 'id'>) => void;

  vehicleTrips: VehicleTrip[];
  addVehicleTrip: (trip: Omit<VehicleTrip, 'id'>) => void;
  deleteVehicleTrip: (tripId: string) => void;
  updateVehicleTripStatus: (tripId: string, status: ApprovalStatus) => void;

  siteSheets: SiteMatrixSheet[];
  setSiteSheets: React.Dispatch<React.SetStateAction<SiteMatrixSheet[]>>;
  updateSiteCellValue: (siteId: string, tabKey: string, rowId: string, vehicle: string, value: number) => void;
  updateSiteRowRate: (siteId: string, tabKey: string, rowId: string, rate: number) => void;
  addSiteSheetRow: (siteId: string, tabKey: string, date: string, item: string) => void;
  addSiteSheetVehicle: (siteId: string, vehicleNumber: string) => void;
  deleteSiteSheetVehicle: (siteId: string, vehicleNumber: string) => void;
  addSiteSheetTab: (siteId: string, tabKey: string, label: string, defaultRate: number, unit: string) => void;

  siteExpenses: SiteExpenseRecord[];
  addSiteExpense: (exp: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => void;
  deleteSiteExpense: (id: string) => void;
  updateSiteExpenseStatus: (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => void;

  machinery: MachineryRecord[];
  addMachinery: (machine: Omit<MachineryRecord, 'id'>) => void;
  deleteMachinery: (id: string) => void;
  clearAllMachinery: () => void;
  machineryLogs: MachineryLog[];
  addMachineryLog: (log: Omit<MachineryLog, 'id'>) => void;

  dieselLogs: DieselLog[];
  addDieselLog: (log: Omit<DieselLog, 'id'>) => void;
  deleteDieselLog: (logId: string) => void;

  workers: Worker[];
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (rec: Omit<AttendanceRecord, 'id'>) => void;
  bulkAddAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  markAttendancePaid: (attendanceId: string, ref: string) => void;
  paymentSheets: LabourPaymentSheet[];

  roadProductions: DailyRoadProduction[];
  addRoadProduction: (prod: Omit<DailyRoadProduction, 'id'>) => void;
  buildingProductions: DailyBuildingProduction[];
  addBuildingProduction: (prod: Omit<DailyBuildingProduction, 'id'>) => void;
  boqItems: BOQItem[];
  addBOQItem: (item: Omit<BOQItem, 'id'>) => void;
  updateBOQItem: (id: string, data: Partial<BOQItem>) => void;
  measurements: MeasurementBookEntry[];
  addMeasurementEntry: (entry: Omit<MeasurementBookEntry, 'id'>) => void;
  bbsItems: BBSItem[];
  addBBSItem: (item: Omit<BBSItem, 'id'>) => void;
  deleteBBSItem: (id: string) => void;

  notifications: ERPNotification[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (module: string, transactionId: string, action: AuditLogEntry['action'], details: string, prev?: string, next?: string) => void;
  clearAllData: () => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
  mobileSiteMode: boolean;
  setMobileSiteMode: (active: boolean) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'CONSTRUCTION_PRO_ERP_STORAGE_V7';
const DELETED_SITES_KEY = 'CONSTRUCTION_PRO_DELETED_SITE_IDS_V7';

const safeGetJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    return fallback;
  }
};

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auto-reset mobile/desktop local cache if version changes to ensure sync across devices
  useEffect(() => {
    try {
      const CURRENT_DATA_VERSION = 'v8_universal_sync_fix';
      const savedVersion = localStorage.getItem('CONSTRUCTION_PRO_DATA_VERSION');
      if (savedVersion !== CURRENT_DATA_VERSION) {
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_TRIPS');
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS');
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES');
        localStorage.setItem('CONSTRUCTION_PRO_DATA_VERSION', CURRENT_DATA_VERSION);
        window.location.reload();
      }
    } catch {
      // ignore
    }
  }, []);

  const [usersList, setUsersList] = useState<ManagedUser[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_USER_ACCOUNTS', DEFAULT_MANAGED_USERS)
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_USER_ACCOUNTS', JSON.stringify(usersList));
  }, [usersList]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const sessionAuth = sessionStorage.getItem(LOCAL_STORAGE_KEY + '_AUTH');
      return sessionAuth ? JSON.parse(sessionAuth) : false;
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_USER', DEFAULT_MANAGED_USERS[0])
  );

  const [userRole, setUserRole] = useState<UserRole | string>(() => currentUser?.role || 'Admin');

  const login = (username: string, password?: string): { success: boolean; message?: string } => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const matchedUser = usersList.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.email.toLowerCase() === cleanUser
    );

    if (!matchedUser) {
      return { success: false, message: 'User not registered. Please contact administrator.' };
    }

    if (matchedUser.status === 'INACTIVE') {
      return { success: false, message: 'Your account is deactivated. Contact administrator.' };
    }

    if (matchedUser.password && cleanPass !== matchedUser.password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const usr: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role as any
    };

    setCurrentUser(usr);
    setUserRole(matchedUser.role as any);
    setIsAuthenticated(true);

    sessionStorage.setItem(LOCAL_STORAGE_KEY + '_AUTH', JSON.stringify(true));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_USER', JSON.stringify(usr));
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(LOCAL_STORAGE_KEY + '_AUTH');
  };

  const addManagedUser = (userData: Omit<ManagedUser, 'id'>) => {
    const newUser: ManagedUser = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsersList((prev) => [newUser, ...prev]);
  };

  const updateManagedUser = (id: string, updated: Partial<ManagedUser>) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
    );
  };

  const deleteManagedUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  const [workType, setWorkType] = useState<WorkType | null>('ROAD');
  const [mobileSiteMode, setMobileSiteMode] = useState<boolean>(false);

  const [deletedSiteIds, setDeletedSiteIds] = useState<string[]>(() =>
    safeGetJSON(DELETED_SITES_KEY, [])
  );

  const [projects, setProjects] = useState<Project[]>(() => {
    const purged: string[] = safeGetJSON(DELETED_SITES_KEY, []);
    const base: Project[] = safeGetJSON(LOCAL_STORAGE_KEY + '_PROJECTS', INITIAL_PROJECTS);
    return base.map((p) => ({
      ...p,
      sites: (p.sites || []).filter((s) => !purged.includes(s.id))
    }));
  });

  const [siteSheets, setSiteSheets] = useState<SiteMatrixSheet[]>(() => {
    const purged: string[] = safeGetJSON(DELETED_SITES_KEY, []);
    const base: SiteMatrixSheet[] = safeGetJSON(LOCAL_STORAGE_KEY + '_SITE_SHEETS', INITIAL_SITE_SHEETS);
    return base.filter((s) => !purged.includes(s.siteId));
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_SELECTED_PROJ', projects[0]?.id || 'proj-ongoing-1')
  );

  const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
    const saved = safeGetJSON(LOCAL_STORAGE_KEY + '_SELECTED_SITE', '');
    if (saved && siteSheets.some((s) => s.siteId === saved)) return saved;
    return siteSheets[0]?.siteId || 'site-ongoing-1';
  });

  const [roadSections, setRoadSections] = useState<RoadSection[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_ROAD_SECTIONS', INITIAL_ROAD_SECTIONS)
  );

  const [buildingFloors, setBuildingFloors] = useState<BuildingFloor[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_BUILDING_FLOORS', INITIAL_BUILDING_FLOORS)
  );

  const [materials, setMaterials] = useState<MaterialItem[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_MATERIALS', INITIAL_MATERIALS)
  );

  const addMaterial = (itemData: Omit<MaterialItem, 'id'>) => {
    const newId = `mat-${Date.now()}`;
    setMaterials((prev) => [{ ...itemData, id: newId }, ...prev]);
  };

  const updateMaterial = (id: string, data: Partial<MaterialItem>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_STOCK_LEDGER', INITIAL_STOCK_LEDGER)
  );

  const [consumptionRecords, setConsumptionRecords] = useState<MaterialConsumptionRecord[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_CONSUMPTION', INITIAL_CONSUMPTION_RECORDS)
  );

  const [vehicleTrips, setVehicleTrips] = useState<VehicleTrip[]>(() => {
    const saved = safeGetJSON(LOCAL_STORAGE_KEY + '_TRIPS', INITIAL_HAULAGE_TRIPS);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_HAULAGE_TRIPS;
  });

  const [machinery, setMachinery] = useState<MachineryRecord[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_MACHINERY', [])
  );

  const addMachinery = (machineData: Omit<MachineryRecord, 'id'>) => {
    const newId = `mch-${Date.now()}`;
    setMachinery((prev) => [{ ...machineData, id: newId }, ...prev]);
  };

  const deleteMachinery = (machineId: string) => {
    setMachinery((prev) => prev.filter((m) => m.id !== machineId));
  };

  const clearAllMachinery = () => {
    setMachinery([]);
    localStorage.setItem(LOCAL_STORAGE_KEY + '_MACHINERY', JSON.stringify([]));
  };

  const [machineryLogs, setMachineryLogs] = useState<MachineryLog[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS', INITIAL_MACHINERY_LOGS)
  );

  const [dieselLogs, setDieselLogs] = useState<DieselLog[]>(() => {
    const saved = safeGetJSON(LOCAL_STORAGE_KEY + '_DIESEL_LOGS', INITIAL_DIESEL_LOGS_SAMPLE);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_DIESEL_LOGS_SAMPLE;
  });

  const [workers, setWorkers] = useState<Worker[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_WORKERS', INITIAL_WORKERS)
  );

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_ATTENDANCE', INITIAL_ATTENDANCE)
  );

  const [paymentSheets, setPaymentSheets] = useState<LabourPaymentSheet[]>([]);

  const [roadProductions, setRoadProductions] = useState<DailyRoadProduction[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_ROAD_PROD', INITIAL_ROAD_PRODUCTION)
  );

  const [buildingProductions, setBuildingProductions] = useState<DailyBuildingProduction[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_BLDG_PROD', INITIAL_BUILDING_PRODUCTION)
  );

  const [boqItems, setBOQItems] = useState<BOQItem[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_BOQ', INITIAL_BOQ)
  );

  const [measurements, setMeasurements] = useState<MeasurementBookEntry[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_MEASUREMENTS', INITIAL_MEASUREMENTS)
  );

  const [bbsItems, setBBSItems] = useState<BBSItem[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_BBS', INITIAL_BBS)
  );

  const [notifications, setNotifications] = useState<ERPNotification[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_NOTIFS', INITIAL_NOTIFICATIONS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    safeGetJSON(LOCAL_STORAGE_KEY + '_AUDIT', INITIAL_AUDIT_LOGS)
  );

  const [siteExpenses, setSiteExpenses] = useState<SiteExpenseRecord[]>(() => {
    const saved = safeGetJSON(LOCAL_STORAGE_KEY + '_SITE_EXPENSES', INITIAL_SITE_EXPENSES_SAMPLE);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_SITE_EXPENSES_SAMPLE;
  });

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const currentSite = currentProject?.sites?.find((s) => s.id === selectedSiteId) || currentProject?.sites?.[0];

  const handleSelectProjectId = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      if (p.sites?.length > 0) {
        setSelectedSiteId(p.sites[0].id);
      }
      if (workType && p.type !== workType) {
        setWorkType(p.type);
      }
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_PROJECTS', JSON.stringify(projects));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ROAD_SECTIONS', JSON.stringify(roadSections));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BUILDING_FLOORS', JSON.stringify(buildingFloors));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MATERIALS', JSON.stringify(materials));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_STOCK_LEDGER', JSON.stringify(stockLedger));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_CONSUMPTION', JSON.stringify(consumptionRecords));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_TRIPS', JSON.stringify(vehicleTrips));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MACHINERY', JSON.stringify(machinery));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS', JSON.stringify(machineryLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS', JSON.stringify(dieselLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_WORKERS', JSON.stringify(workers));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ATTENDANCE', JSON.stringify(attendanceRecords));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_ROAD_PROD', JSON.stringify(roadProductions));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BLDG_PROD', JSON.stringify(buildingProductions));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BOQ', JSON.stringify(boqItems));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_MEASUREMENTS', JSON.stringify(measurements));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_BBS', JSON.stringify(bbsItems));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_NOTIFS', JSON.stringify(notifications));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_AUDIT', JSON.stringify(auditLogs));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SITE_SHEETS', JSON.stringify(siteSheets));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES', JSON.stringify(siteExpenses));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SELECTED_PROJ', JSON.stringify(selectedProjectId));
      localStorage.setItem(LOCAL_STORAGE_KEY + '_SELECTED_SITE', JSON.stringify(selectedSiteId));
      localStorage.setItem(DELETED_SITES_KEY, JSON.stringify(deletedSiteIds));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [
    projects,
    roadSections,
    buildingFloors,
    materials,
    stockLedger,
    consumptionRecords,
    vehicleTrips,
    machinery,
    machineryLogs,
    dieselLogs,
    workers,
    attendanceRecords,
    roadProductions,
    buildingProductions,
    boqItems,
    measurements,
    bbsItems,
    notifications,
    auditLogs,
    siteSheets,
    siteExpenses,
    selectedProjectId,
    selectedSiteId,
    deletedSiteIds
  ]);

  const addAuditLog = (
    module: string,
    transactionId: string,
    action: AuditLogEntry['action'],
    details: string,
    prev?: string,
    next?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const entry: AuditLogEntry = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: now,
      userEmail: currentUser?.email || 'admin@site.com',
      userName: currentUser?.name || 'Administrator',
      module,
      transactionId,
      action,
      previousValue: prev,
      newValue: next,
      details
    };
    setAuditLogs((prevLogs) => [entry, ...prevLogs]);
  };

  const addStockTransaction = (entryData: Omit<StockLedgerEntry, 'id'>) => {
    const newId = 'stk-' + Date.now();
    const newEntry: StockLedgerEntry = { ...entryData, id: newId };
    setStockLedger((prev) => [newEntry, ...prev]);

    setMaterials((prevMats) =>
      prevMats.map((mat) => {
        if (mat.id === entryData.materialId) {
          const qtyDiff = (entryData.quantityIn || 0) - (entryData.quantityOut || 0);
          const updatedStock = Math.max(0, (mat.currentStockTotal || 0) + qtyDiff);
          return { ...mat, currentStockTotal: updatedStock };
        }
        return mat;
      })
    );
    addAuditLog('Inventory Ledger', newId, 'CREATE', `Stock ${entryData.type}: ${entryData.materialName}`);
  };

  const addConsumptionRecord = (rec: Omit<MaterialConsumptionRecord, 'id'>) => {
    const newId = 'con-' + Date.now();
    const newRec: MaterialConsumptionRecord = { ...rec, id: newId };
    setConsumptionRecords((prev) => [newRec, ...prev]);
  };

  const addProject = (projData: Partial<Project>): Project => {
    const newId = 'proj-' + Date.now();
    const newProj: Project = {
      id: newId,
      name: projData.name || 'New Construction Project',
      code: projData.code || 'PRJ-' + Math.floor(1000 + Math.random() * 9000),
      type: projData.type || workType || 'ROAD',
      client: projData.client || 'Government Infra',
      location: projData.location || 'Site Location, India',
      startDate: projData.startDate || new Date().toISOString().substring(0, 10),
      expectedCompletion: projData.expectedCompletion || '2027-12-31',
      contractValue: projData.contractValue || 85000000,
      estimatedCost: projData.estimatedCost || 72000000,
      actualCost: 0,
      forecastFinalCost: projData.estimatedCost || 72000000,
      profitOrLoss: (projData.contractValue || 85000000) - (projData.estimatedCost || 72000000),
      progressPercent: 0,
      projectManager: projData.projectManager || 'Er. Anand Patil',
      siteEngineer: projData.siteEngineer || 'Er. Habibulla Bilgi',
      supervisor: projData.supervisor || 'Ibrahim',
      status: 'Active',
      sites: projData.sites && projData.sites.length > 0 ? projData.sites : [
        { id: 'site-' + Date.now(), projectId: newId, name: 'Ongoing Highway Site', code: 'S1', location: 'Main Stretch', supervisor: 'Supervisor' }
      ],
      totalRoadKm: projData.type === 'ROAD' ? (projData.totalRoadKm || 15) : undefined,
      totalBuiltUpSqFt: projData.type === 'BUILDING' ? (projData.totalBuiltUpSqFt || 50000) : undefined,
      description: projData.description || 'Project created in ERP.'
    };

    setProjects((prev) => [newProj, ...prev]);
    setSelectedProjectId(newId);
    if (newProj.sites.length > 0) {
      setSelectedSiteId(newProj.sites[0].id);
    }
    return newProj;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const addSiteToProject = (projectId: string, siteName: string, location: string, supervisor: string) => {
    const newSiteId = 'site-' + Date.now();
    const newSite: Site = {
      id: newSiteId,
      projectId,
      name: siteName,
      code: 'ST-' + Math.floor(100 + Math.random() * 900),
      location,
      supervisor
    };
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, sites: [...p.sites, newSite] } : p)));
  };

  const deleteSite = (siteId: string) => {
    deleteRoadSiteSection(siteId);
  };

  const deleteRoadSiteSection = (siteId: string) => {
    const updatedDeleted = Array.from(new Set([...deletedSiteIds, siteId]));
    setDeletedSiteIds(updatedDeleted);
    localStorage.setItem(DELETED_SITES_KEY, JSON.stringify(updatedDeleted));

    setSiteSheets((prev) => {
      const remaining = prev.filter((s) => s.siteId !== siteId);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_SITE_SHEETS', JSON.stringify(remaining));
      } catch (err) {
        console.error(err);
      }
      return remaining;
    });

    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        sites: (p.sites || []).filter((s) => s.id !== siteId)
      }))
    );

    setRoadSections((prev) => prev.filter((s) => s.siteId !== siteId));
    setBuildingFloors((prev) => prev.filter((f) => f.siteId !== siteId));
    setSiteExpenses((prev) => prev.filter((e) => e.siteId !== siteId));
    setVehicleTrips((prev) => prev.filter((t) => t.siteId !== siteId));

    if (selectedSiteId === siteId) {
      const nextRemaining = siteSheets.filter((s) => s.siteId !== siteId);
      if (nextRemaining.length > 0) {
        setSelectedSiteId(nextRemaining[0].siteId);
      } else {
        setSelectedSiteId('');
        sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
      }
    }
  };

  const addRoadSiteSection = (input: AddRoadSiteInput): string => {
    const targetProjId = input.projectId || selectedProjectId || (projects[0]?.id || 'proj-ongoing-1');
    const newSiteId = 'site-' + Date.now();
    const vehicleList = input.vehicles?.length ? input.vehicles : ['8797', '7352', '7353', '9579', '9580'];

    const newSite: Site = {
      id: newSiteId,
      projectId: targetProjId,
      name: input.siteName,
      code: input.siteCode || 'ST-' + Math.floor(100 + Math.random() * 900),
      location: input.location,
      supervisor: input.supervisor
    };

    setProjects((prev) =>
      prev.map((p) => (p.id === targetProjId ? { ...p, sites: [...p.sites, newSite] } : p))
    );

    const newSheet: any = {
      siteId: newSiteId,
      siteName: input.siteName,
      location: input.location,
      supervisor: input.supervisor,
      startChainageKm: input.startChainageKm || 0,
      endChainageKm: input.endChainageKm || 0,
      projectType: input.projectType || input.category || 'ROAD',
      category: input.category || input.projectType || 'ROAD',
      buildingFloors: input.buildingFloors || '',
      monthTitle: 'AUGUST',
      year: 2026,
      vehicles: vehicleList,
      tabs: []
    };

    setSiteSheets((prev) => [...prev, newSheet]);
    setSelectedSiteId(newSiteId);
    return newSiteId;
  };

  const updateRoadLayerProgress = (sectionId: string, layerId: string, completedMeters: number, actualQty: number) => {
    setRoadSections((prev) =>
      prev.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            layers: sec.layers.map((lay) =>
              lay.id === layerId
                ? {
                    ...lay,
                    completedLengthMeters: completedMeters,
                    progressPercent: Math.min(100, Math.round((completedMeters / sec.totalLengthMeters) * 100)),
                    actualQtyUsed: actualQty
                  }
                : lay
            )
          };
        }
        return sec;
      })
    );
  };

  const updateBuildingFloor = (floorId: string, data: Partial<BuildingFloor>) => {
    setBuildingFloors((prev) => prev.map((f) => (f.id === floorId ? { ...f, ...data } : f)));
  };

  const addBuildingFloor = (floorData: Partial<BuildingFloor>) => {
    const newId = 'fl-' + Date.now();
    const newFloor: BuildingFloor = {
      id: newId,
      projectId: floorData.projectId || selectedProjectId,
      siteId: floorData.siteId || selectedSiteId,
      buildingName: floorData.buildingName || 'Tower A',
      floorLevel: floorData.floorLevel || 'Floor Level',
      levelIndex: floorData.levelIndex || 1,
      builtUpAreaSqFt: floorData.builtUpAreaSqFt || 10000,
      plannedCost: floorData.plannedCost || 15000000,
      actualCost: 0,
      progressPercent: 0,
      status: 'Not Started',
      rccElementsCount: floorData.rccElementsCount || 20
    };
    setBuildingFloors((prev) => [...prev, newFloor]);
  };

  const addVehicleTrip = (tripData: Omit<VehicleTrip, 'id'>) => {
    const newId = 'trip-' + Date.now();
    setVehicleTrips((prev) => [{ ...tripData, id: newId }, ...prev]);
  };

  const deleteVehicleTrip = (tripId: string) => {
    setVehicleTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const updateVehicleTripStatus = (tripId: string, status: ApprovalStatus) => {
    setVehicleTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, approvalStatus: status } : t)));
  };

  const addMachineryLog = (logData: Omit<MachineryLog, 'id'>) => {
    const newId = 'mlog-' + Date.now();
    setMachineryLogs((prev) => [{ ...logData, id: newId }, ...prev]);
  };

  const addDieselLog = (logData: Omit<DieselLog, 'id'>) => {
    const newId = 'dsl-' + Date.now();
    setDieselLogs((prev) => [{ ...logData, id: newId }, ...prev]);
  };

  const deleteDieselLog = (logId: string) => {
    setDieselLogs((prev) => prev.filter((d) => d.id !== logId));
  };

  const addAttendanceRecord = (recData: Omit<AttendanceRecord, 'id'>) => {
    const newId = 'att-' + Date.now();
    setAttendanceRecords((prev) => [{ ...recData, id: newId }, ...prev]);
  };

  const bulkAddAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newEntries = records.map((r, idx) => ({ ...r, id: `att-${Date.now()}-${idx}` }));
    setAttendanceRecords((prev) => [...newEntries, ...prev]);
  };

  const markAttendancePaid = (attendanceId: string, ref: string) => {
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, isPaid: true, paymentRef: ref } : a))
    );
  };

  const addRoadProduction = (prodData: Omit<DailyRoadProduction, 'id'>) => {
    setRoadProductions((prev) => [{ ...prodData, id: 'prod-rd-' + Date.now() }, ...prev]);
  };

  const addBuildingProduction = (prodData: Omit<DailyBuildingProduction, 'id'>) => {
    setBuildingProductions((prev) => [{ ...prodData, id: 'prod-bg-' + Date.now() }, ...prev]);
  };

  const addBOQItem = (itemData: Omit<BOQItem, 'id'>) => {
    setBOQItems((prev) => [{ ...itemData, id: 'boq-' + Date.now() }, ...prev]);
  };

  const updateBOQItem = (id: string, data: Partial<BOQItem>) => {
    setBOQItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const addMeasurementEntry = (entryData: Omit<MeasurementBookEntry, 'id'>) => {
    setMeasurements((prev) => [{ ...entryData, id: 'mb-' + Date.now() }, ...prev]);
  };

  const addBBSItem = (itemData: Omit<BBSItem, 'id'>) => {
    setBBSItems((prev) => [{ ...itemData, id: 'bbs-' + Date.now() }, ...prev]);
  };

  const deleteBBSItem = (id: string) => {
    setBBSItems((prev) => prev.filter((b) => b.id !== id));
  };

  const updateSiteCellValue = (siteId: string, tabKey: string, rowId: string, vehicle: string, value: number) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            return {
              ...tab,
              rows: tab.rows.map((row) => {
                if (row.id !== rowId) return row;
                const vVals = { ...row.vehicleValues, [vehicle]: Math.max(0, value) };
                const total = Object.values(vVals).reduce<number>((a, b) => a + (Number(b) || 0), 0);
                return { ...row, vehicleValues: vVals, total };
              })
            };
          })
        };
      })
    );
  };

  const updateSiteRowRate = (siteId: string, tabKey: string, rowId: string, rate: number) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            return {
              ...tab,
              rows: tab.rows.map((row) => (row.id === rowId ? { ...row, ratePerUnitOrTrip: rate } : row))
            };
          })
        };
      })
    );
  };

  const addSiteSheetRow = (siteId: string, tabKey: string, date: string, item: string) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          tabs: sheet.tabs.map((tab) => {
            if (tab.tabKey !== tabKey) return tab;
            const vVals: Record<string, number> = {};
            (sheet.vehicles || []).forEach((v) => {
              vVals[v] = 0;
            });
            const newRow: SiteMatrixRow = {
              id: `row-${siteId}-${tabKey}-${Date.now()}`,
              dayNumber: tab.rows.length + 1,
              date,
              item: item || tab.label,
              vehicleValues: vVals,
              total: 0,
              ratePerUnitOrTrip: tab.defaultRate,
              unit: tab.unit
            };
            return { ...tab, rows: [...tab.rows, newRow] };
          })
        };
      })
    );
  };

  const addSiteSheetVehicle = (siteId: string, vehicleNumber: string) => {
    const cleanNum = vehicleNumber.trim().toUpperCase();
    if (!cleanNum) return;
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId || sheet.vehicles.includes(cleanNum)) return sheet;
        return {
          ...sheet,
          vehicles: [...sheet.vehicles, cleanNum],
          tabs: sheet.tabs.map((tab) => ({
            ...tab,
            rows: tab.rows.map((row) => ({
              ...row,
              vehicleValues: { ...row.vehicleValues, [cleanNum]: 0 }
            }))
          }))
        };
      })
    );
  };

  const deleteSiteSheetVehicle = (siteId: string, vehicleNumber: string) => {
    const cleanNum = vehicleNumber.trim().toUpperCase();
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId) return sheet;
        return {
          ...sheet,
          vehicles: sheet.vehicles.filter((v) => v !== cleanNum),
          tabs: sheet.tabs.map((tab) => ({
            ...tab,
            rows: tab.rows.map((row) => {
              const updatedValues = { ...row.vehicleValues };
              delete updatedValues[cleanNum];
              return {
                ...row,
                vehicleValues: updatedValues
              };
            })
          }))
        };
      })
    );
  };

  const addSiteSheetTab = (siteId: string, tabKey: string, label: string, defaultRate: number, unit: string) => {
    setSiteSheets((prevSheets) =>
      (prevSheets || []).map((sheet) => {
        if (sheet.siteId !== siteId || sheet.tabs.some((t) => t.tabKey === tabKey)) return sheet;
        return {
          ...sheet,
          tabs: [...sheet.tabs, { id: `tab-${Date.now()}`, tabKey, label, unit, defaultRate, rows: [] }]
        };
      })
    );
  };

  const addSiteExpense = (expData: Omit<SiteExpenseRecord, 'id' | 'createdAt'>) => {
    const newId = 'exp-' + Date.now();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setSiteExpenses((prev) => [{ ...expData, id: newId, createdAt: now }, ...prev]);
  };

  const deleteSiteExpense = (id: string) => {
    setSiteExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSiteExpenseStatus = (id: string, status: 'PAID' | 'PENDING' | 'APPROVED') => {
    setSiteExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearAllData = () => {
    setStockLedger([]);
    setConsumptionRecords([]);
    setVehicleTrips([]);
    setMachinery([]);
    setDieselLogs([]);
    setMachineryLogs([]);
    setAttendanceRecords([]);
    setPaymentSheets([]);
    setRoadProductions([]);
    setBuildingProductions([]);
    setMeasurements([]);
    setBBSItems([]);
    setSiteExpenses([]);
    setNotifications([]);

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_TRIPS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_MACHINERY');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_DIESEL_LOGS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_SITE_EXPENSES');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_STOCK_LEDGER');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_CONSUMPTION');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_ATTENDANCE');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_ROAD_PROD');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_BLDG_PROD');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_MEASUREMENTS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_BBS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_NOTIFS');
      localStorage.removeItem(LOCAL_STORAGE_KEY + '_MACHINERY_LOGS');
    } catch {
      // ignore
    }
  };

  const resetToSampleData = () => {
    localStorage.removeItem(DELETED_SITES_KEY);
    setDeletedSiteIds([]);
    setProjects(INITIAL_PROJECTS);
    setRoadSections(INITIAL_ROAD_SECTIONS);
    setBuildingFloors(INITIAL_BUILDING_FLOORS);
    setMaterials(INITIAL_MATERIALS);
    setStockLedger(INITIAL_STOCK_LEDGER);
    setConsumptionRecords(INITIAL_CONSUMPTION_RECORDS);
    setVehicleTrips(INITIAL_HAULAGE_TRIPS);
    setMachinery([]);
    setMachineryLogs(INITIAL_MACHINERY_LOGS);
    setDieselLogs(INITIAL_DIESEL_LOGS_SAMPLE);
    setWorkers(INITIAL_WORKERS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setRoadProductions(INITIAL_ROAD_PRODUCTION);
    setBuildingProductions(INITIAL_BUILDING_PRODUCTION);
    setBOQItems(INITIAL_BOQ);
    setMeasurements(INITIAL_MEASUREMENTS);
    setBBSItems(INITIAL_BBS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSiteSheets(INITIAL_SITE_SHEETS);
    setSiteExpenses(INITIAL_SITE_EXPENSES_SAMPLE);
  };

  const exportDatabaseJSON = () => {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        projects,
        roadSections,
        materials,
        stockLedger,
        vehicleTrips,
        machinery,
        dieselLogs,
        siteSheets,
        siteExpenses,
        deletedSiteIds,
        usersList
      },
      null,
      2
    );
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.projects) setProjects(data.projects);
      if (data.siteSheets) setSiteSheets(data.siteSheets);
      if (data.materials) setMaterials(data.materials);
      if (data.deletedSiteIds) setDeletedSiteIds(data.deletedSiteIds);
      if (data.usersList) setUsersList(data.usersList);
      if (data.machinery) setMachinery(data.machinery);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        usersList,
        addManagedUser,
        updateManagedUser,
        deleteManagedUser,
        workType,
        setWorkType,
        selectedProjectId,
        setSelectedProjectId: handleSelectProjectId,
        selectedSiteId,
        setSelectedSiteId,
        currentProject,
        currentSite,
        projects,
        addProject,
        updateProject,
        deleteProject,
        addSiteToProject,
        deleteSite,
        addRoadSiteSection,
        deleteRoadSiteSection,
        roadSections,
        updateRoadLayerProgress,
        buildingFloors,
        updateBuildingFloor,
        addBuildingFloor,
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        stockLedger,
        addStockTransaction,
        consumptionRecords,
        addConsumptionRecord,
        vehicleTrips,
        addVehicleTrip,
        deleteVehicleTrip,
        updateVehicleTripStatus,
        siteSheets,
        setSiteSheets,
        updateSiteCellValue,
        updateSiteRowRate,
        addSiteSheetRow,
        addSiteSheetVehicle,
        deleteSiteSheetVehicle,
        addSiteSheetTab,
        siteExpenses,
        addSiteExpense,
        deleteSiteExpense,
        updateSiteExpenseStatus,
        machinery,
        addMachinery,
        deleteMachinery,
        clearAllMachinery,
        machineryLogs,
        addMachineryLog,
        dieselLogs,
        addDieselLog,
        deleteDieselLog,
        workers,
        attendanceRecords,
        addAttendanceRecord,
        bulkAddAttendance,
        markAttendancePaid,
        paymentSheets,
        roadProductions,
        addRoadProduction,
        buildingProductions,
        addBuildingProduction,
        boqItems,
        addBOQItem,
        updateBOQItem,
        measurements,
        addMeasurementEntry,
        bbsItems,
        addBBSItem,
        deleteBBSItem,
        notifications,
        markNotificationRead,
        auditLogs,
        addAuditLog,
        clearAllData,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
        mobileSiteMode,
        setMobileSiteMode
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

export default ERPContext;
