export type MachineCategory =
  | 'EARTHMOVING'
  | 'COMPACTION_PAVING'
  | 'HAULAGE_TRANSPORT'
  | 'UTILITY_ANCILLARY';

export type MachineSubCategory =
  // Earthmoving
  | 'Excavator'
  | 'Backhoe / JCB'
  | 'Motor Grader'
  | 'Bulldozer'
  // Compaction & Paving
  | 'Vibratory Soil Roller'
  | 'Tandem Asphalt Roller'
  | 'Pneumatic Tyre Roller (PTR)'
  | 'Sensor Asphalt Paver'
  | 'Chip Spreader'
  // Haulage & Transport
  | 'Dump Truck / Tipper'
  | 'Water Tanker'
  | 'Bitumen Sprayer / Distributor'
  | 'Transit Mixer (RMC)'
  // Utility & Ancillary
  | 'Diesel Generator (DG)'
  | 'Air Compressor'
  | 'Solar / Diesel Light Tower'
  | 'Concrete Vibrator / Needle';

export type OwnershipType = 'OWNED' | 'RENTED_LEASED';
export type MachineOperationalStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'BREAKDOWN';

export interface Machine {
  id: string;
  code: string;
  name: string;
  category: MachineCategory;
  subCategory: MachineSubCategory;
  makeModel: string;
  plateNumber: string;
  ownership: OwnershipType;
  hourlyRentalRate?: number; // for rented machines
  monthlyRentalRate?: number;
  rentalVendorName?: string;
  assignedOperator: string;
  operatorPhone: string;
  status: MachineOperationalStatus;
  currentHMR: number; // Hour-meter reading
  currentKMR: number; // Odometer reading (for tippers/tankers)
  fuelTankCapacityLitres: number;
  currentFuelLevelLitres: number;
  averageConsumptionBenchmark: number; // L/hr or km/L
  benchmarkUnit: 'L/hr' | 'km/L';
  lastServiceHMR: number;
  nextServiceDueHMR: number;
  pavementSectionAssigned?: string;
  photoUrl?: string;
}

export type PavementLayerType =
  | 'SUBGRADE_MURUM'
  | 'GRANULAR_SUB_BASE_GSB'
  | 'WET_MIX_MACADAM_WMM'
  | 'DENSE_BITUMINOUS_MACADAM_DBM'
  | 'BITUMINOUS_CONCRETE_BC'
  | 'DRY_LEAN_CONCRETE_DLC'
  | 'PAVEMENT_QUALITY_CONCRETE_PQC'
  | 'PRIME_COAT_EMULSION'
  | 'TACK_COAT_EMULSION';

export type CarriagewaySide =
  | 'FULL_CARRIAGEWAY'
  | 'LHS'
  | 'RHS'
  | 'MEDIAN'
  | 'LEFT_SHOULDER'
  | 'RIGHT_SHOULDER';

export interface TripLog {
  id: string;
  tripSlipNumber: string;
  date: string;
  time: string;
  machineId: string;
  vehiclePlate: string;
  driverName: string;
  sourceLocation: string; // e.g. "Bilgi Quarry Crusher Plant #2"
  dropoffChainageStartKm: number; // e.g. 12.400 -> Ch. 12+400
  dropoffChainageEndKm: number; // e.g. 14.200 -> Ch. 14+200
  formattedChainage: string; // e.g. "Ch. 12+400 to 14+200"
  carriagewaySide: CarriagewaySide;
  layerType: PavementLayerType;
  materialName: string;
  grossWeightTons: number;
  tareWeightTons: number;
  netWeightTons: number;
  volumeM3?: number;
  challanNumber: string;
  weighbridgeSlipNumber?: string;
  ratePerTonOrTrip: number;
  billingMode: 'PER_TON' | 'PER_TRIP' | 'PER_M3';
  totalTripBillingAmount: number;
  oneWayDistanceKm: number;
  roundTripDistanceKm: number;
  turnaroundTimeMinutes: number;
  photoChallanUrl?: string;
  gpsCoordinates?: { lat: number; lng: number };
  syncStatus: 'SYNCED' | 'PENDING_OFFLINE' | 'FAILED';
  supervisorName: string;
  remarks?: string;
}

export type FuelSourceType =
  | 'SITE_BOWSER_1'
  | 'SITE_BOWSER_2'
  | 'SITE_STATIC_TANK_20KL'
  | 'IOCL_HIGHWAY_PUMP'
  | 'HPCL_COMMERCIAL_OUTLET'
  | 'BPCL_VENDOR';

export interface FuelDispenseLog {
  id: string;
  timestamp: string;
  date: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  fuelSource: FuelSourceType;
  litresDispensed: number;
  ratePerLitre: number;
  totalCost: number;
  meterType: 'HMR_HOURS' | 'KMR_ODOMETER';
  previousMeterReading: number;
  currentMeterReading: number;
  runDifference: number; // hours run or kms travelled since last fuel
  specificFuelConsumption: number; // calculated L/hr or km/L
  benchmarkConsumption: number;
  isAbnormalSpike: boolean; // Flagged if deviation exceeds threshold (>25%)
  spikeDeviationPercentage?: number;
  voucherChallanNo: string;
  fuelSlipPhotoUrl?: string;
  dispensedBy: string;
  approvedBy: string;
  syncStatus: 'SYNCED' | 'PENDING_OFFLINE' | 'FAILED';
  notes?: string;
}

export interface RoadLayerYieldCalculation {
  id: string;
  layerType: PavementLayerType;
  layerName: string;
  chainageStartKm: number;
  chainageEndKm: number;
  formattedChainage: string;
  lengthMeters: number;
  carriagewayWidthMeters: number;
  compactedThicknessMm: number;
  compactedThicknessMeters: number;
  compactedBulkDensityTonsPerM3: number;
  wastageFactorPercent: number; // Typically 3% - 8%
  compactedVolumeM3: number;
  totalWeightTonsRequired: number;
  averageTipperPayloadTons: number;
  tripsNeeded: number;
  // Bitumen breakdown (for DBM/BC)
  bitumenContentPercentage?: number; // e.g. 4.5% - 5.5%
  bitumenTonsRequired?: number;
  aggregateTonsRequired?: number;
  // Actual yield vs theoretical matching
  actualMaterialReceivedTons: number;
  actualTripsReceivedCount: number;
  varianceTons: number;
  variancePercentage: number;
  yieldStatus: 'OPTIMAL' | 'OVER_CONSUMPTION' | 'UNDER_COMPACTION' | 'IN_PROGRESS';
  updatedAt: string;
}

export type SiteExpenseCategory =
  | 'DAILY_SITE_OPERATIONS'
  | 'EQUIPMENT_REPAIR_PARTS'
  | 'TOLL_TAX_PERMITS'
  | 'OPERATOR_WAGES_BATTA'
  | 'PETTY_CASH_DISBURSEMENT'
  | 'DIVERSION_ACCESS_ROAD'
  | 'WATER_TANKER_HIRING'
  | 'SAFETY_SIGNAGE_BARRICADING'
  | 'OTHER_CIVIL_EXPENSES';

export type ExpensePaymentMode =
  | 'PETTY_CASH'
  | 'BANK_TRANSFER_NEFT'
  | 'UPI_SCAN'
  | 'VENDOR_CREDIT_ACCOUNT'
  | 'CASH_VOUCHER';

export interface SiteExpenseVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  category: SiteExpenseCategory;
  costCenterChainage: string;
  amount: number;
  paymentMode: ExpensePaymentMode;
  payeeVendorName: string;
  description: string;
  invoiceReceiptNumber?: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';
  syncStatus: 'SYNCED' | 'PENDING_OFFLINE' | 'FAILED';
  taggedMachineId?: string;
  photoReceiptUrl?: string;
}

export interface PettyCashWallet {
  id: string;
  walletSupervisorName: string;
  assignedSite: string;
  totalAllocatedBudget: number;
  spentAmount: number;
  remainingBalance: number;
  lastRefillDate: string;
}

export interface DailyProgressReport {
  id: string;
  reportDate: string;
  projectTitle: string;
  contractorName: string;
  weatherCondition: 'Sunny / Clear' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Rain (Work Stoppage)';
  workingHours: number;
  // Aggregated KPIs
  totalTripsLogged: number;
  totalMaterialTonsLaid: number;
  totalFuelBurnedLitres: number;
  totalFuelCostINR: number;
  activeFleetCount: number;
  idleFleetCount: number;
  breakdownFleetCount: number;
  linearMetersPaved: number;
  chainageCoverageSummary: string;
  totalSiteExpensesToday: number;
  siteEngineerInCharge: string;
  residentEngineerSignOff: string;
  criticalHindrancesOrRemarks: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  timestamp: string;
  entityType: 'TRIP' | 'FUEL' | 'EXPENSE' | 'MACHINE_UPDATE' | 'YIELD_CALC';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  retryCount: number;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'ERROR';
  errorMessage?: string;
}

export type UserRole =
  | 'PROJECT_DIRECTOR'
  | 'SITE_ENGINEER'
  | 'FLEET_MANAGER'
  | 'MACHINE_OPERATOR';

export interface RoadProjectProfile {
  id: string;
  name: string;
  packageCode: string;
  clientAuthority: string; // e.g. "National Highways Authority of India (NHAI)"
  highwayCode: string; // e.g. "NH-50"
  stretchDescription: string;
  startChainageKm: number;
  endChainageKm: number;
  totalLengthKm: number;
  laneConfiguration: '2-Lane with Paved Shoulder' | '4-Lane Divided Carriageway' | '6-Lane Expressway';
  contractValueINR: number;
  targetCompletionDate: string;
}
