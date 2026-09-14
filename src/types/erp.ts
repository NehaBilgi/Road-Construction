export type WorkType = 'ROAD' | 'BUILDING';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'PROJECT_MANAGER'
  | 'SITE_ENGINEER'
  | 'STORE_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'ACCOUNTANT'
  | 'VIEWER';

export type ApprovalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'POSTED' | 'LOCKED';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  type: WorkType;
  client: string;
  location: string;
  gpsCoordinates?: { lat: number; lng: number };
  googleMapsUrl?: string;
  startDate: string;
  expectedCompletion: string;
  contractValue: number;
  estimatedCost: number;
  actualCost: number;
  forecastFinalCost: number;
  profitOrLoss: number;
  progressPercent: number;
  projectManager: string;
  siteEngineer: string;
  supervisor: string;
  status: ProjectStatus;
  sites: Site[];
  totalRoadKm?: number;
  totalBuiltUpSqFt?: number;
  description?: string;
}

export interface Site {
  id: string;
  projectId: string;
  name: string;
  code: string;
  location: string;
  supervisor: string;
}

// ROAD SPECIFIC
export type RoadLayerType =
  | 'Earthwork / Embankment'
  | 'Subgrade / Murum'
  | 'Granular Sub-Base (GSB)'
  | 'Wet Mix Macadam (WMM)'
  | 'Prime Coat / Tack Coat'
  | 'Bituminous Macadam (BM)'
  | 'Dense Bituminous Macadam (DBM)'
  | 'Bituminous Concrete (BC)'
  | 'Cement Concrete (CC Road)'
  | 'Paved Shoulder'
  | 'Side Drain / Culvert';

export interface RoadSection {
  id: string;
  projectId: string;
  siteId: string;
  name: string;
  startChainage: number; // e.g. 10.000 km
  endChainage: number; // e.g. 15.500 km
  totalLengthMeters: number;
  carriagewayWidthMeters: number;
  shoulderWidthMeters: number;
  layers: RoadLayerProgress[];
}

export interface RoadLayerProgress {
  id: string;
  layerType: RoadLayerType;
  designThicknessMm: number;
  completedChainageStart: number;
  completedChainageEnd: number;
  completedLengthMeters: number;
  progressPercent: number;
  theoreticalQty: number; // in tonnes or m3
  actualQtyUsed: number;
  varianceQty: number;
  unit: string;
}

// BUILDING SPECIFIC
export type BuildingStructureType =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Warehouse'
  | 'School'
  | 'Hospital'
  | 'Office Tower'
  | 'Apartment';

export interface BuildingFloor {
  id: string;
  projectId: string;
  siteId: string;
  buildingName: string;
  floorLevel: string; // e.g. Basement, Ground Floor, 1st Floor, 2nd Floor, Terrace
  levelIndex: number; // -1 for basement, 0 for ground, 1, 2...
  builtUpAreaSqFt: number;
  plannedCost: number;
  actualCost: number;
  progressPercent: number;
  status: 'Not Started' | 'In Progress' | 'RCC Cast' | 'Finishing' | 'Completed';
  rccElementsCount: number;
}

// RCC & BBS CALCULATORS
export interface RCCFootingInput {
  id: string;
  projectId: string;
  floorId: string;
  identifier: string; // e.g., F1, F2
  count: number;
  lengthM: number;
  widthM: number;
  depthM: number;
  concreteGrade: 'M15' | 'M20' | 'M25' | 'M30' | 'M35' | 'M40';
  rebarMeshSpacingMm: number;
  barDiaMm: number;
  // Calculated output
  totalVolumeM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
  steelKg: number;
}

export interface RCCColumnInput {
  id: string;
  projectId: string;
  floorId: string;
  identifier: string; // e.g., C1
  count: number;
  widthM: number;
  breadthM: number;
  heightM: number;
  concreteGrade: string;
  mainBarsCount: number;
  mainBarDiaMm: number;
  stirrupDiaMm: number;
  stirrupSpacingMm: number;
  // Calculated
  totalVolumeM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
  mainSteelKg: number;
  stirrupsSteelKg: number;
  totalSteelKg: number;
}

export interface RCCBeamInput {
  id: string;
  projectId: string;
  floorId: string;
  identifier: string; // e.g., B101
  count: number;
  lengthM: number;
  widthM: number;
  depthM: number;
  concreteGrade: string;
  topBarsCount: number;
  topBarDiaMm: number;
  bottomBarsCount: number;
  bottomBarDiaMm: number;
  stirrupDiaMm: number;
  stirrupSpacingMm: number;
  totalVolumeM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
  totalSteelKg: number;
}

export interface RCCSlabInput {
  id: string;
  projectId: string;
  floorId: string;
  identifier: string; // e.g., S1
  lengthM: number;
  widthM: number;
  thicknessM: number;
  concreteGrade: string;
  mainBarDiaMm: number;
  mainSpacingMm: number;
  distributionBarDiaMm: number;
  distSpacingMm: number;
  totalVolumeM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
  steelKg: number;
}

export interface BBSItem {
  id: string;
  projectId: string;
  floorOrChainage: string;
  member: string; // Footing F1, Column C1, Beam B1, Slab S1, Culvert
  barMark: string;
  diameterMm: number; // 6, 8, 10, 12, 16, 20, 25, 32
  grade: 'Fe415' | 'Fe500' | 'Fe550D';
  shapeType: 'Straight' | 'L-Bend' | 'U-Bend' | 'Cranked' | 'Stirrup-Rect' | 'Stirrup-Circular' | 'Chair';
  numberOfMembers: number;
  barsPerMember: number;
  totalNumberOfBars: number;
  cuttingLengthM: number;
  totalLengthM: number;
  unitWeightKgPerM: number; // d^2 / 162
  totalWeightKg: number;
  remarks?: string;
}

// INVENTORY & MATERIALS
export type MaterialCategory =
  | 'Cement'
  | 'Steel & TMT'
  | 'Aggregates'
  | 'Sand & M-Sand'
  | 'Bitumen & Emulsion'
  | 'Murum & Earth'
  | 'Masonry Blocks & Bricks'
  | 'RMC / Concrete'
  | 'Plumbing'
  | 'Electrical'
  | 'Finishing & Tiles'
  | 'Fuel / Diesel'
  | 'Lubricants & Oils'
  | 'DEF & Additives'
  | 'Chemicals & Admixtures'
  | 'Other';

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  standardRate: number;
  densityTonnesPerM3?: number;
  minReorderLevel: number;
  currentStockTotal: number;
  storeLocation: string;
}

export type StockTransactionType =
  | 'PO_RECEIPT'
  | 'DIRECT_PURCHASE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ISSUE_TO_ACTIVITY'
  | 'RETURN_FROM_SITE'
  | 'STOCK_ADJUSTMENT';

export interface StockLedgerEntry {
  id: string;
  date: string;
  materialId: string;
  materialName: string;
  type: StockTransactionType;
  transactionType?: StockTransactionType;
  projectId: string;
  siteId?: string;
  referenceNumber: string; // PO#, GRN#, Issue Voucher#
  quantityIn: number;
  quantityOut: number;
  balanceQuantity: number;
  unit: string;
  unitRate: number;
  totalValue: number;
  issuedToActivity?: string;
  chainageOrFloor?: string;
  sourceStore?: string;
  destStore?: string;
  performedBy: string;
  remarks?: string;
}

export interface MaterialConsumptionRecord {
  id: string;
  date: string;
  projectId: string;
  siteId: string;
  workType: WorkType;
  chainageOrFloor: string;
  activityName: string;
  materialId: string;
  materialName: string;
  unit: string;
  theoreticalRequiredQty: number;
  materialIssuedQty: number;
  actualUsedQty: number;
  balanceAtSiteQty: number;
  varianceQty: number; // actual - theoretical
  variancePercent: number;
  status: 'NORMAL' | 'OVER_CONSUMPTION_ALERT' | 'SAVINGS';
  unitCost: number;
  totalCost: number;
  remarks?: string;
}

// TRIPS (ROAD TIPPER & BUILDING RMC)
export interface VehicleTrip {
  id: string;
  date: string;
  workType: WorkType;
  projectId: string;
  siteId: string;
  tripNumber: string;
  vehicleNumber: string;
  vehicleType: 'Tipper 10-Tyre' | 'Tipper 6-Tyre' | 'Hyva 12-Tyre' | 'Tractor Trailer' | 'Dumper' | 'Tanker' | 'Transit Mixer RMC';
  driverName: string;
  ownership: 'Company Owned' | 'Rental / Subcontractor';
  vendorOrOwner?: string;
  materialName: string;
  sourceLocation: string;
  destinationLocation: string; // Chainage or Floor
  chainageOrFloor: string;
  activity: string;
  vehicleCapacityTonnesOrM3: number;
  actualLoadedQty: number;
  unit: 'Tonnes' | 'm³' | 'Trips';
  ratePerUnitOrTrip: number;
  totalAmount: number;
  challanNumber: string;
  loadingTime?: string;
  arrivalTime?: string;
  unloadingTime?: string;
  // RMC Specific
  concreteGrade?: string;
  slumpMm?: number;
  returnedQty?: number;
  approvalStatus: ApprovalStatus;
}

// RENTAL VEHICLES & MACHINERY
export interface MachineryRecord {
  id: string;
  name: string; // JCB 3DX, CAT Excavator 320D, Hamm Road Roller, Vogele Paver, Transit Mixer, Tower Crane
  type: 'JCB / Backhoe' | 'Excavator' | 'Road Roller' | 'Motor Grader' | 'Asphalt Paver' | 'Crane' | 'Water Tanker' | 'Generator' | 'Concrete Pump';
  registrationNo: string;
  ownership: 'Company' | 'Rental';
  ownerName?: string;
  operatorName: string;
  rateType: 'PER_HOUR' | 'PER_DAY' | 'PER_KM' | 'PER_MONTH';
  standardRate: number;
  status: 'Active' | 'Maintenance' | 'Idle';
}

export interface MachineryLog {
  id: string;
  date: string;
  machineryId: string;
  machineryName: string;
  machineryType?: string;
  ownership?: string;
  projectId: string;
  siteId: string;
  chainageOrFloor: string;
  activity: string;
  operator: string;
  startHourMeter: number;
  endHourMeter: number;
  operatingHours: number;
  ratePerHour: number;
  totalCost: number;
  dieselConsumedLitres: number;
  workDescription: string;
  approvalStatus: ApprovalStatus;
}

// DIESEL MANAGEMENT
export interface DieselLog {
  id: string;
  date: string;
  projectId: string;
  siteId: string;
  vehicleOrMachineName: string;
  registrationNumber: string;
  category: 'Road Tipper' | 'Transit Mixer' | 'JCB/Excavator' | 'Roller/Grader' | 'Generator' | 'Site Vehicle';
  operatorOrDriver: string;
  fuelStation: string;
  fuelSource?: string;
  litresDispensed: number;
  ratePerLitre: number;
  totalAmount: number;
  currentMeterOrKmReading: number;
  previousMeterOrKmReading?: number;
  efficiencyKmOrHrPerLitre?: number;
  billNumber: string;
  receiptPhotoUrl?: string;
  approvalStatus: ApprovalStatus;
}

// LABOUR & ATTENDANCE & PAYMENTS
export interface Worker {
  id: string;
  code: string;
  name: string;
  category:
    | 'Mason'
    | 'Helper / Unskilled'
    | 'Carpenter'
    | 'Bar Bender / Fitter'
    | 'Electrician'
    | 'Plumber'
    | 'Painter'
    | 'Machine Operator'
    | 'Driver'
    | 'Site Supervisor'
    | 'Surveyor';
  phone: string;
  skillLevel?: 'Skilled' | 'Semi-Skilled' | 'Unskilled' | string;
  dailyRate: number; // 8-hour shift rate
  hourlyOtRate: number;
  aadharOrIdNo?: string;
  assignedProject?: string;
  status: 'Active' | 'Inactive';
}

export type LabourWorker = Worker;
export type LabourCategory =
  | 'Mason'
  | 'Helper / Unskilled'
  | 'Carpenter'
  | 'Bar Bender / Fitter'
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Machine Operator'
  | 'Driver'
  | 'Site Supervisor'
  | 'Surveyor';

export interface AttendanceRecord {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  category: string;
  projectId: string;
  siteId: string;
  workType: WorkType;
  chainageOrFloor: string;
  activity: string;
  status: 'Present' | 'Half Day' | 'Absent' | 'Overtime Only';
  normalHours: number; // standard 8
  otHours: number;
  dailyWageRate: number;
  otHourlyRate: number;
  normalWage: number;
  otWage: number;
  grossWage: number;
  advanceDeduction: number;
  otherDeductions: number;
  netPayable: number;
  isPaid: boolean;
  paymentRef?: string;
}

export interface LabourPaymentSheet {
  id: string;
  periodStart: string;
  periodEnd: string;
  projectId: string;
  siteId: string;
  totalWorkers: number;
  totalNormalWage: number;
  totalOtWage: number;
  totalGrossWage: number;
  totalAdvancesDeducted: number;
  totalNetPayable: number;
  paymentStatus: 'DRAFT' | 'APPROVED' | 'PAID' | 'LOCKED';
  paidOnDate?: string;
  paymentMethod?: 'Bank Transfer' | 'Cash' | 'Cheque';
  paymentMode?: string;
}

export type Material = MaterialItem;
export type StockTransaction = StockLedgerEntry;

// DAILY PRODUCTION
export interface DailyRoadProduction {
  id: string;
  date: string;
  projectId: string;
  siteId: string;
  chainageStart: number;
  chainageEnd: number;
  layerType: RoadLayerType;
  lengthCompletedMeters: number;
  widthMeters: number;
  thicknessMm: number;
  quantityM3OrTonnes: number;
  unit: string;
  materialCost: number;
  labourCost: number;
  tripVehicleCost: number;
  dieselCost: number;
  machineryCost: number;
  otherExpenses: number;
  totalDailyCost: number;
  costPerMeter: number;
  costPerKm: number;
  costPerUnit: number;
  remarks?: string;
  photos?: string[];
  approvalStatus: ApprovalStatus;
}

export interface DailyBuildingProduction {
  id: string;
  date: string;
  projectId: string;
  siteId: string;
  buildingName: string;
  floorLevel: string;
  activityName: string;
  plannedQty: number;
  completedQty: number;
  unit: string; // m3, sq.ft, kg, points, m2
  materialCost: number;
  labourCost: number;
  concreteRmcCost: number;
  machineryCost: number;
  dieselCost: number;
  rentalCost: number;
  otherExpenses: number;
  totalDailyCost: number;
  costPerUnitCompleted: number;
  remarks?: string;
  photos?: string[];
  approvalStatus: ApprovalStatus;
}

// BOQ & DIGITAL MEASUREMENT BOOK (MB)
export interface BOQItem {
  id: string;
  itemCode: string;
  projectId: string;
  workType: WorkType;
  chainageOrFloor: string;
  activityName: string;
  description: string;
  unit: string;
  plannedQuantity: number;
  unitRate: number;
  plannedAmount: number;
  executedQuantity: number;
  executedAmount: number;
  remainingQuantity: number;
  estimatedMaterialCost: number;
  estimatedLabourCost: number;
  estimatedMachineryCost: number;
  actualTotalCost: number;
}

export interface MeasurementBookEntry {
  id: string;
  mbNumber: string;
  pageNumber: number;
  date: string;
  projectId: string;
  siteId: string;
  workType: WorkType;
  chainageOrFloor: string;
  roomOrSection: string;
  activity: string;
  description: string;
  lengthM: number;
  widthM: number;
  heightOrDepthM: number;
  numbersMultiplier: number;
  calculatedQuantity: number;
  unit: string;
  recordedByEngineer: string;
  drawingRef?: string;
  photos?: string[];
  approvalStatus: ApprovalStatus;
}

// AUDIT LOG
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  module: string;
  transactionId: string;
  action: 'CREATE' | 'UPDATE' | 'APPROVE' | 'POST' | 'DELETE' | 'ADJUST';
  previousValue?: string;
  newValue?: string;
  details: string;
}

// NOTIFICATIONS
export interface ERPNotification {
  id: string;
  date: string;
  type: 'STOCK_LOW' | 'EXCESS_CONSUMPTION' | 'BUDGET_OVERRUN' | 'APPROVAL_PENDING' | 'PAYMENT_DUE' | 'TRIP_EXCEEDED';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  linkModule?: string;
}

// SITE TRIP & DIESEL MATRIX (1:1 with Google Sheet)
export interface SiteMatrixRow {
  id: string;
  dayNumber: number; // e.g. 1, 2, 3... 31
  date: string; // e.g. "14-6-2026"
  item: string; // e.g. "Murum", "M Sand", "20 MM", "Diesel", etc.
  vehicleValues: Record<string, number>; // e.g. { "8797": 10, "7352": 0, "7353": 0, "9579": 0, "9580": 10 }
  total: number;
  ratePerUnitOrTrip?: number;
  unit?: string;
  remarks?: string;
}

export interface SiteMatrixTab {
  id: string;
  tabKey: string; // 'MURUM', 'M SAND', '20 MM', 'CEMENT', 'STEEL', 'GSB', 'WMM', 'DESIEL', 'BM', 'SILICOTE'
  label: string;
  unit: string; // 'Trips', 'Tonnes', 'Litres', 'Bags'
  defaultRate: number;
  rows: SiteMatrixRow[];
}

export interface SiteMatrixSheet {
  siteId: string;
  siteName: string; // "MULWAD SITE"
  monthTitle: string; // "JUNE/JULY"
  year: number;
  vehicles: string[]; // ['8797', '7352', '7353', '9579', '9580']
  tabs: SiteMatrixTab[];
}

// SITE COST & EXPENSE LEDGER
export type SiteExpenseCategory =
  | 'Diesel / Fuel'
  | 'Raw Material / Quarry'
  | 'Vehicle / Tipper Running & Hire'
  | 'Labour & Operator Wages'
  | 'Machinery Maintenance & Spares'
  | 'Site Overheads & Mess'
  | 'RTO / Royalty / Taxes'
  | 'Civil Tools & Consumables'
  | 'Machinery Rental'
  | 'Water Tanker & Bowser'
  | 'Other';

export interface SiteExpenseRecord {
  id: string;
  siteId: string;
  siteName: string;
  date: string;
  category: SiteExpenseCategory;
  title: string;
  description?: string;
  vehicleOrMachineNumber?: string;
  amount: number;
  voucherNumber: string;
  vendorOrPayee: string;
  paymentMode: 'Cash' | 'UPI / PhonePe' | 'NEFT / RTGS' | 'Cheque' | 'Petty Cash';
  approvedBy: string;
  status: 'PAID' | 'PENDING' | 'APPROVED';
  receiptAttachment?: string;
  createdAt: string;
}

