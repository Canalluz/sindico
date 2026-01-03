
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT' | 'STAFF';
  fractionCode?: string;
}

export interface Fraction {
  id: string;
  code: string;
  ownerName: string;
  permilage: number;
  monthlyQuota: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  nif: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  ivaRate: 0 | 6 | 13 | 23;
  type: TransactionType;
  category: string;
}

export interface Inspection {
  id: string;
  type: string;
  lastDate: string;
  nextDate: string;
  status: 'OK' | 'WARNING' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  completionDate?: string;
}

export interface Attendee {
  name: string;
  fractionCode: string;
  role: 'PRESIDENT' | 'SECRETARY' | 'OWNER' | 'PROXY';
  nif?: string;
}

export interface Resolution {
  pointTitle: string;
  proposalDescription: string; // Nova: Descrição detalhada da proposta votada
  discussionSummary: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  permilageFor: number;
  status: 'APPROVED' | 'REJECTED';
  majorityRequired: 'SIMPLE' | 'ABSOLUTE' | 'QUALIFIED' | 'UNANIMOUS';
}

export interface Assembly {
  id: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  type: 'ORDINARY' | 'EXTRAORDINARY';
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED';
  title: string;
  noticeText?: string;
  minutesText?: string; 
  attendees?: Attendee[];
  resolutions?: Resolution[];
  presidentName?: string;
  secretaryName?: string;
}

export interface BuildingInfo {
  name: string;
  address: string;
  nif: string;
  adminName: string;
  iban?: string;
}

export interface Occurrence {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'MAINTENANCE' | 'NOISE' | 'SECURITY' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  fractionCode: string;
}

export interface CommonArea {
  id: string;
  name: string;
  capacity: number;
  price: number;
  rules: string;
}

export interface Booking {
  id: string;
  areaId: string;
  fractionId: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface Visitor {
  id: string;
  name: string;
  docId: string;
  fractionCode: string;
  entryTime: string;
  exitTime?: string;
  status: 'IN' | 'OUT';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contact: string;
  contractEnd: string;
}
