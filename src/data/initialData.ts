import {
  Project,
  MaterialItem,
  StockLedgerEntry,
  MaterialConsumptionRecord,
  VehicleTrip,
  MachineryRecord,
  MachineryLog,
  DieselLog,
  Worker,
  AttendanceRecord,
  DailyRoadProduction,
  DailyBuildingProduction,
  BOQItem,
  MeasurementBookEntry,
  AuditLogEntry,
  ERPNotification,
  RoadSection,
  BuildingFloor,
  BBSItem,
  SiteMatrixSheet,
  SiteExpenseRecord
} from '../types/erp';

// ==========================================
// 1. Single Live Ongoing Highway Project
// ==========================================
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-ongoing-1',
    name: 'NH-48 Highway Widening & Realignment (Ongoing Package)',
    code: 'NH48-PKG3-ONGOING',
    type: 'ROAD',
    client: 'National Highways Authority of India (NHAI)',
    location: 'Main Highway Stretch (Ch. 0.000 to Ch. 15.000 km)',
    gpsCoordinates: { lat: 18.5204, lng: 73.8567 },
    startDate: '2026-01-10',
    expectedCompletion: '2027-12-31',
    contractValue: 85000000,
    estimatedCost: 72000000,
    actualCost: 0,
    forecastFinalCost: 72000000,
    profitOrLoss: 13000000,
    progressPercent: 15.0,
    projectManager: 'Er. Anand Patil',
    siteEngineer: 'Er. Habibulla Bilgi',
    supervisor: 'Ibrahim (Site Incharge)',
    status: 'Active',
    totalRoadKm: 15.0,
    description: 'Ongoing 4/6-lane highway execution including Subgrade/Murum, GSB, WMM, DBM, and BC layers with culvert drainage.',
    sites: [
      {
        id: 'site-ongoing-1',
        projectId: 'proj-ongoing-1',
        name: 'Ongoing Highway Site (Active Stretch)',
        code: 'SEC-ONGOING',
        location: 'Ch. 0.000 to Ch. 15.000 km',
        supervisor: 'Ibrahim'
      }
    ]
  }
];

// ==========================================
// 2. Ongoing Road Section & MoRTH Layers
// ==========================================
export const INITIAL_ROAD_SECTIONS: RoadSection[] = [
  {
    id: 'sec-ongoing-1',
    projectId: 'proj-ongoing-1',
    siteId: 'site-ongoing-1',
    name: 'Ongoing Highway Section (Ch 0+000 to 15+000)',
    startChainage: 0.0,
    endChainage: 15.0,
    totalLengthMeters: 15000,
    carriagewayWidthMeters: 7.5,
    shoulderWidthMeters: 1.5,
    layers: [
      {
        id: 'lay-emb-1',
        layerType: 'Subgrade / Murum',
        designThicknessMm: 500,
        completedChainageStart: 0.0,
        completedChainageEnd: 3.5,
        completedLengthMeters: 3500,
        progressPercent: 23.3,
        theoreticalQty: 104062,
        actualQtyUsed: 24500,
        varianceQty: 0,
        unit: 'Tonnes'
      },
      {
        id: 'lay-gsb-1',
        layerType: 'Granular Sub-Base (GSB)',
        designThicknessMm: 150,
        completedChainageStart: 0.0,
        completedChainageEnd: 2.0,
        completedLengthMeters: 2000,
        progressPercent: 13.3,
        theoreticalQty: 37968,
        actualQtyUsed: 5100,
        varianceQty: 0,
        unit: 'Tonnes'
      },
      {
        id: 'lay-wmm-1',
        layerType: 'Wet Mix Macadam (WMM)',
        designThicknessMm: 150,
        completedChainageStart: 0.0,
        completedChainageEnd: 0.0,
        completedLengthMeters: 0,
        progressPercent: 0.0,
        theoreticalQty: 39656,
        actualQtyUsed: 0,
        varianceQty: 0,
        unit: 'Tonnes'
      },
      {
        id: 'lay-dbm-1',
        layerType: 'Dense Bituminous Macadam (DBM)',
        designThicknessMm: 75,
        completedChainageStart: 0.0,
        completedChainageEnd: 0.0,
        completedLengthMeters: 0,
        progressPercent: 0.0,
        theoreticalQty: 20418,
        actualQtyUsed: 0,
        varianceQty: 0,
        unit: 'Tonnes'
      },
      {
        id: 'lay-bc-1',
        layerType: 'Bituminous Concrete (BC)',
        designThicknessMm: 40,
        completedChainageStart: 0.0,
        completedChainageEnd: 0.0,
        completedLengthMeters: 0,
        progressPercent: 0.0,
        theoreticalQty: 11025,
        actualQtyUsed: 0,
        varianceQty: 0,
        unit: 'Tonnes'
      }
    ]
  }
];

export const INITIAL_BUILDING_FLOORS: BuildingFloor[] = [];

// ==========================================
// 3. Materials & Fuel Registry
// ==========================================
export const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'mat-16', code: 'MAT-DSL-HSD', name: 'High Speed Diesel (HSD) Site Bowser', category: 'Fuel / Diesel', unit: 'Litres', standardRate: 92.5, minReorderLevel: 2000, currentStockTotal: 5000, storeLocation: 'Site Fuel Bowser' },
  { id: 'mat-oil-1', code: 'OIL-15W40', name: '15W/40 Engine Oil', category: 'Lubricants & Oils', unit: 'Litres', standardRate: 245, minReorderLevel: 50, currentStockTotal: 40, storeLocation: 'Site Store' },
  { id: 'mat-grs-1', code: 'GRS-EP2', name: 'Heavy Duty Grease EP-2', category: 'Lubricants & Oils', unit: 'Kg', standardRate: 320, minReorderLevel: 25, currentStockTotal: 20, storeLocation: 'Site Store' },
  { id: 'mat-12', code: 'MAT-GSB-GR1', name: 'Granular Sub-Base (GSB) Mix', category: 'Aggregates', unit: 'Tonnes', standardRate: 390, densityTonnesPerM3: 2.15, minReorderLevel: 250, currentStockTotal: 1500, storeLocation: 'Crusher Stockpile' },
  { id: 'mat-13', code: 'MAT-WMM-MIX', name: 'Wet Mix Macadam (WMM) Plant Mix', category: 'Aggregates', unit: 'Tonnes', standardRate: 420, densityTonnesPerM3: 2.2, minReorderLevel: 300, currentStockTotal: 1200, storeLocation: 'Central WMM Plant' },
  { id: 'mat-8', code: 'MAT-AGG-20MM', name: 'Crushed Aggregate 20mm', category: 'Aggregates', unit: 'Tonnes', standardRate: 480, densityTonnesPerM3: 1.6, minReorderLevel: 50, currentStockTotal: 650, storeLocation: 'Crusher Yard' },
  { id: 'mat-10', code: 'MAT-SND-MSAND', name: 'Manufactured Sand (M-Sand)', category: 'Sand & M-Sand', unit: 'Tonnes', standardRate: 520, densityTonnesPerM3: 1.65, minReorderLevel: 100, currentStockTotal: 800, storeLocation: 'Crusher Yard' }
];

export const INITIAL_STOCK_LEDGER: StockLedgerEntry[] = [];
export const INITIAL_CONSUMPTION_RECORDS: MaterialConsumptionRecord[] = [];
export const INITIAL_VEHICLE_TRIPS: VehicleTrip[] = [];

// ==========================================
// 4. Machinery & Operators
// ==========================================
export const INITIAL_MACHINERY: MachineryRecord[] = [
  { id: 'mach-1', name: 'JCB 3DX Plus Backhoe Loader', type: 'JCB / Backhoe', registrationNo: 'MH-12-EQ-4401', ownership: 'Company', operatorName: 'Kishore Salunkhe', rateType: 'PER_HOUR', standardRate: 1100, status: 'Active' },
  { id: 'mach-2', name: 'CAT 320D Hydraulic Excavator', type: 'Excavator', registrationNo: 'MH-12-EX-8890', ownership: 'Rental', ownerName: 'Mahalaxmi Earthmovers', operatorName: 'Dharma Gavit', rateType: 'PER_HOUR', standardRate: 2200, status: 'Active' },
  { id: 'mach-3', name: 'Hamm 311D Soil Compactor Roller (11 Ton)', type: 'Road Roller', registrationNo: 'MH-14-RR-1120', ownership: 'Company', operatorName: 'Baban Gurav', rateType: 'PER_HOUR', standardRate: 1400, status: 'Active' },
  { id: 'mach-4', name: 'CAT 140M Motor Grader', type: 'Motor Grader', registrationNo: 'MH-12-MG-7070', ownership: 'Rental', ownerName: 'Heavy Fleet Infra', operatorName: 'Shankar Mane', rateType: 'PER_HOUR', standardRate: 2800, status: 'Active' },
  { id: 'mach-5', name: 'Vogele Super 1800-3 Asphalt Paver', type: 'Asphalt Paver', registrationNo: 'MH-12-PV-2020', ownership: 'Company', operatorName: 'Tukaram Shelke', rateType: 'PER_HOUR', standardRate: 3500, status: 'Active' },
  { id: 'mach-8', name: 'Tata 1613 10,000L Water Bowser', type: 'Water Tanker', registrationNo: 'MH-12-WT-5509', ownership: 'Company', operatorName: 'Ashok Chavan', rateType: 'PER_DAY', standardRate: 3200, status: 'Active' }
];

export const INITIAL_MACHINERY_LOGS: MachineryLog[] = [];
export const INITIAL_DIESEL_LOGS: DieselLog[] = [];

export const INITIAL_WORKERS: Worker[] = [
  { id: 'w-1', code: 'WRK-OPR-01', name: 'Kishore Salunkhe', category: 'Machine Operator', phone: '+91 98231 44510', dailyRate: 1100, hourlyOtRate: 180, assignedProject: 'proj-ongoing-1', status: 'Active' },
  { id: 'w-2', code: 'WRK-DRV-01', name: 'Santosh Kamble', category: 'Driver', phone: '+91 98231 44511', dailyRate: 850, hourlyOtRate: 140, assignedProject: 'proj-ongoing-1', status: 'Active' },
  { id: 'w-3', code: 'WRK-HLP-01', name: 'Ganesh Shinde', category: 'Helper / Unskilled', phone: '+91 98231 44512', dailyRate: 650, hourlyOtRate: 110, assignedProject: 'proj-ongoing-1', status: 'Active' }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_ROAD_PRODUCTION: DailyRoadProduction[] = [];
export const INITIAL_BUILDING_PRODUCTION: DailyBuildingProduction[] = [];

export const INITIAL_BOQ: BOQItem[] = [
  {
    id: 'boq-1',
    itemCode: 'BOQ-RD-01',
    projectId: 'proj-ongoing-1',
    workType: 'ROAD',
    chainageOrFloor: 'Ch. 0.000 to 15.000 km',
    activityName: 'Subgrade & Embankment Formation',
    description: 'Earthwork and borrow soil compaction with heavy rollers.',
    unit: 'm³',
    plannedQuantity: 104062,
    unitRate: 180,
    plannedAmount: 18731160,
    executedQuantity: 0,
    executedAmount: 0,
    remainingQuantity: 104062,
    estimatedMaterialCost: 8500000,
    estimatedLabourCost: 3200000,
    estimatedMachineryCost: 7031160,
    actualTotalCost: 0
  }
];

export const INITIAL_MEASUREMENTS: MeasurementBookEntry[] = [];
export const INITIAL_BBS: BBSItem[] = [];
export const INITIAL_NOTIFICATIONS: ERPNotification[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// ==========================================
// 5. Unified Pre-Populated Sample Datasets
// ==========================================
export const INITIAL_HAULAGE_TRIPS = [
  {
    id: 'TRIP-101',
    tripDate: '2026-08-19',
    siteName: 'Ongoing Highway Site (Active Stretch)',
    vehicleNumber: '8797',
    materialName: 'Bituminous Macadam (BM) (₹5000/Brass)',
    dayTrips: 10,
    brassPerTrip: 6,
    ratePerBrass: 5000,
    totalAmount: 300000
  }
];

export const INITIAL_DIESEL_LOGS_SAMPLE = [
  {
    id: 'DSL-101',
    date: '2026-08-19',
    siteName: 'Ongoing Highway Site (Active Stretch)',
    vehicleNumber: '8797',
    driverName: 'Santosh Kamble',
    slipNumber: 'V-001',
    litres: 100,
    ratePerLitre: 92.5,
    totalCost: 9250.00
  }
];

export const INITIAL_SITE_EXPENSES_SAMPLE = [
  {
    id: 'EXP-101',
    date: '2026-08-19',
    siteName: 'Ongoing Highway Site (Active Stretch)',
    title: 'Weekly Labor Payout',
    vendor: 'Local Contractor',
    category: 'Labor/Wages',
    amount: 45000,
    status: 'Paid'
  }
];

// ==========================================
// 6. Zero-Quantity Matrix Rows Helper
// ==========================================
const ongoingVehicles = ['8797', '7352', '7353', '9579', '9580'];

const buildCleanTabRows = (itemName: string, defaultRate: number, unit: string) => {
  return Array.from({ length: 15 }, (_, idx) => {
    const day = idx + 1;
    const vVals: Record<string, number> = {};
    ongoingVehicles.forEach((v) => {
      vVals[v] = 0;
    });

    return {
      id: `ongoing-${itemName.toLowerCase().replace(/\s+/g, '')}-${day}`,
      dayNumber: day,
      date: `${day}-08-2026`,
      item: itemName,
      vehicleValues: vVals,
      total: 0,
      ratePerUnitOrTrip: defaultRate,
      unit
    };
  });
};

// ==========================================
// 7. Single Live Ongoing Site Matrix Sheet
// ==========================================
export const INITIAL_SITE_SHEETS: SiteMatrixSheet[] = [
  {
    siteId: 'site-ongoing-1',
    siteName: 'Ongoing Highway Site (Active Stretch)',
    monthTitle: 'AUGUST',
    year: 2026,
    vehicles: ongoingVehicles,
    tabs: [
      {
        id: 'tab-ongoing-murum',
        tabKey: 'MURUM',
        label: 'Murum / Borrow Soil',
        unit: 'Trips',
        defaultRate: 350,
        rows: buildCleanTabRows('Murum', 350, 'Trips')
      },
      {
        id: 'tab-ongoing-gsb',
        tabKey: 'GSB',
        label: 'GSB (Granular Sub-Base)',
        unit: 'Tonnes',
        defaultRate: 390,
        rows: buildCleanTabRows('GSB', 390, 'Tonnes')
      },
      {
        id: 'tab-ongoing-wmm',
        tabKey: 'WMM',
        label: 'WMM (Wet Mix Macadam)',
        unit: 'Tonnes',
        defaultRate: 420,
        rows: buildCleanTabRows('WMM', 420, 'Tonnes')
      },
      {
        id: 'tab-ongoing-diesel',
        tabKey: 'DIESEL',
        label: 'Diesel Dispensed (L)',
        unit: 'Litres',
        defaultRate: 92.5,
        rows: buildCleanTabRows('Diesel', 92.5, 'Litres')
      }
    ]
  }
];

export const INITIAL_SITE_EXPENSES: SiteExpenseRecord[] = [];
