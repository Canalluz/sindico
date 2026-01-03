
import { Fraction, Transaction, TransactionType, Inspection, Assembly, BuildingInfo, Occurrence, CommonArea, Visitor, Staff, User } from './types';

export const MOCK_FRACTIONS: Fraction[] = [];

export const MOCK_SYSTEM_USERS: User[] = [
  { id: 'u1', name: 'Seo Gestão', email: 'admin@seogestao.pt', role: 'ADMIN' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_INSPECTIONS: Inspection[] = [];

export const MOCK_ASSEMBLIES: Assembly[] = [];

export const INITIAL_BUILDING_DATA: BuildingInfo = {
  name: '',
  address: '',
  nif: '',
  adminName: '',
  iban: ''
};

export const MOCK_OCCURRENCES: Occurrence[] = [];

export const MOCK_COMMON_AREAS: CommonArea[] = [];

export const MOCK_VISITORS: Visitor[] = [];

export const MOCK_STAFF: Staff[] = [];
