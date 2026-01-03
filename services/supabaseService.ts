import { supabase } from '../supabase';
import { Fraction, Transaction, Inspection, Occurrence, Visitor, CommonArea, Booking, Assembly } from '../types';
import { TransactionType } from '../types';

// --- Frações ---
export const getFractions = async (): Promise<Fraction[]> => {
    const { data, error } = await supabase.from('fractions').select('*').order('code');
    if (error) throw error;

    return data.map((f: any) => ({
        id: f.id,
        code: f.code,
        ownerName: f.owner_name,
        permilage: f.permilage,
        monthlyQuota: f.monthly_quota,
        nif: f.nif,
        status: f.status
    }));
};

export const createFraction = async (fraction: Omit<Fraction, 'id'>): Promise<Fraction> => {
    const dbFraction = {
        code: fraction.code,
        owner_name: fraction.ownerName,
        permilage: fraction.permilage,
        monthly_quota: fraction.monthlyQuota,
        nif: fraction.nif,
        status: fraction.status
    };

    const { data, error } = await supabase.from('fractions').insert(dbFraction).select();
    if (error) throw error;

    const f = data[0];
    return {
        id: f.id,
        code: f.code,
        ownerName: f.owner_name,
        permilage: f.permilage,
        monthlyQuota: f.monthly_quota,
        nif: f.nif,
        status: f.status
    } as Fraction;
};

export const updateFraction = async (id: string, updates: Partial<Fraction>): Promise<Fraction> => {
    const dbUpdates: any = {};
    if (updates.code) dbUpdates.code = updates.code;
    if (updates.ownerName) dbUpdates.owner_name = updates.ownerName;
    if (updates.permilage) dbUpdates.permilage = updates.permilage;
    if (updates.monthlyQuota) dbUpdates.monthly_quota = updates.monthlyQuota;
    if (updates.nif) dbUpdates.nif = updates.nif;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase.from('fractions').update(dbUpdates).eq('id', id).select();
    if (error) throw error;

    const f = data[0];
    return {
        id: f.id,
        code: f.code,
        ownerName: f.owner_name,
        permilage: f.permilage,
        monthlyQuota: f.monthly_quota,
        nif: f.nif,
        status: f.status
    } as Fraction;
};

// --- Transações (Finance) ---
export const getTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;

    return data.map((t: any) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type as TransactionType,
        category: t.category,
        ivaRate: t.iva_rate
    }));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const dbTransaction = {
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        iva_rate: transaction.ivaRate
    };

    const { data, error } = await supabase.from('transactions').insert(dbTransaction).select();
    if (error) throw error;

    const t = data[0];
    return {
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type as TransactionType,
        category: t.category,
        ivaRate: t.iva_rate
    };
};

// --- Inspeções (Maintenance) ---
export const getInspections = async (): Promise<Inspection[]> => {
    const { data, error } = await supabase.from('inspections').select('*').order('next_date', { ascending: true });
    if (error) throw error;

    return data.map((i: any) => ({
        id: i.id,
        type: i.type,
        lastDate: i.last_date,
        nextDate: i.next_date,
        status: i.status
    }));
};

export const createInspection = async (inspection: Omit<Inspection, 'id'>): Promise<Inspection> => {
    const dbInspection = {
        type: inspection.type,
        last_date: inspection.lastDate,
        next_date: inspection.nextDate,
        status: inspection.status
    };

    const { data, error } = await supabase.from('inspections').insert(dbInspection).select();
    if (error) throw error;

    const i = data[0];
    return {
        id: i.id,
        type: i.type,
        lastDate: i.last_date,
        nextDate: i.next_date,
        status: i.status
    };
};

export const updateInspectionStatus = async (id: string, status: string): Promise<Inspection> => {
    const { data, error } = await supabase.from('inspections').update({ status }).eq('id', id).select();
    if (error) throw error;

    const i = data[0];
    return {
        id: i.id,
        type: i.type,
        lastDate: i.last_date,
        nextDate: i.next_date,
        status: i.status
    };
};

export const deleteInspection = async (id: string) => {
    const { error } = await supabase.from('inspections').delete().eq('id', id);
    if (error) throw error;
};

// --- Ocorrências ---
export const getOccurrences = async (): Promise<Occurrence[]> => {
    const { data, error } = await supabase.from('occurrences').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return data.map((o: any) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        fractionCode: o.fraction_code,
        status: o.status,
        date: o.created_at // Assuming created_at is sufficient for date
    }));
};

export const createOccurrence = async (occurrence: Omit<Occurrence, 'id'>): Promise<Occurrence> => {
    const dbOccurrence = {
        title: occurrence.title,
        description: occurrence.description,
        category: occurrence.category,
        fraction_code: occurrence.fractionCode,
        status: occurrence.status
    };

    const { data, error } = await supabase.from('occurrences').insert(dbOccurrence).select();
    if (error) throw error;

    const o = data[0];
    return {
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        fractionCode: o.fraction_code,
        status: o.status,
        date: o.created_at
    };
};

export const updateOccurrenceStatus = async (id: string, status: string): Promise<Occurrence> => {
    const { data, error } = await supabase.from('occurrences').update({ status }).eq('id', id).select();
    if (error) throw error;

    const o = data[0];
    return {
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        fractionCode: o.fraction_code,
        status: o.status,
        date: o.created_at
    };
};

// --- Visitantes (Security) ---
export const getVisitors = async (): Promise<Visitor[]> => {
    const { data, error } = await supabase.from('visitors').select('*').order('entry_time', { ascending: false });
    if (error) throw error;

    return data.map((v: any) => ({
        id: v.id,
        name: v.name,
        docId: v.doc_id,
        fractionCode: v.fraction_code,
        entryTime: v.entry_time,
        exitTime: v.exit_time,
        status: v.status
    }));
};

export const createVisitor = async (visitor: Omit<Visitor, 'id'>): Promise<Visitor> => {
    const dbVisitor = {
        name: visitor.name,
        doc_id: visitor.docId,
        fraction_code: visitor.fractionCode,
        entry_time: visitor.entryTime,
        status: visitor.status
    };

    const { data, error } = await supabase.from('visitors').insert(dbVisitor).select();
    if (error) throw error;

    const v = data[0];
    return {
        id: v.id,
        name: v.name,
        docId: v.doc_id,
        fractionCode: v.fraction_code,
        entryTime: v.entry_time,
        exitTime: v.exit_time,
        status: v.status
    };
};

export const exitVisitor = async (id: string): Promise<Visitor> => {
    const { data, error } = await supabase.from('visitors').update({ status: 'OUT', exit_time: new Date().toISOString() }).eq('id', id).select();
    if (error) throw error;

    const v = data[0];
    return {
        id: v.id,
        name: v.name,
        docId: v.doc_id,
        fractionCode: v.fraction_code,
        entryTime: v.entry_time,
        exitTime: v.exit_time,
        status: v.status
    };
};

// --- Áreas Comuns e Reservas ---
export const getCommonAreas = async (): Promise<CommonArea[]> => {
    const { data, error } = await supabase.from('common_areas').select('*');
    if (error) throw error;
    return data as CommonArea[];
};

export const createCommonArea = async (area: Omit<CommonArea, 'id'>): Promise<CommonArea> => {
    const { data, error } = await supabase.from('common_areas').insert(area).select();
    if (error) throw error;
    return data[0] as CommonArea;
};

export const updateCommonArea = async (id: string, updates: Partial<CommonArea>): Promise<CommonArea> => {
    const { data, error } = await supabase.from('common_areas').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as CommonArea;
};

export const deleteCommonArea = async (id: string) => {
    const { error } = await supabase.from('common_areas').delete().eq('id', id);
    if (error) throw error;
};

export const getBookings = async (): Promise<Booking[]> => {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    return data.map((b: any) => ({
        id: b.id,
        areaId: b.area_id,
        fractionId: b.fraction_id,
        date: b.date,
        status: b.status
    }));
};

export const createBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const { data, error } = await supabase.from('bookings').insert({
        area_id: booking.areaId,
        fraction_id: booking.fractionId,
        date: booking.date,
        status: booking.status
    }).select();

    if (error) throw error;
    const b = data[0];
    return {
        id: b.id,
        areaId: b.area_id,
        fractionId: b.fraction_id,
        date: b.date,
        status: b.status
    };
};

// --- Assembleias ---
export const getAssemblies = async (): Promise<Assembly[]> => {
    const { data, error } = await supabase.from('assemblies').select('*').order('date', { ascending: false });
    if (error) throw error;

    return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        date: a.date,
        time: a.time,
        location: a.location,
        type: a.type,
        status: a.status,
        noticeText: a.notice_text,
        minutesText: a.minutes_text,
        resolutions: a.resolutions
    }));
};

export const createAssembly = async (assembly: Omit<Assembly, 'id'>): Promise<Assembly> => {
    const dbAssembly = {
        title: assembly.title,
        date: assembly.date,
        time: assembly.time,
        location: assembly.location,
        type: assembly.type,
        status: assembly.status,
        notice_text: assembly.noticeText,
        minutes_text: assembly.minutesText,
        resolutions: assembly.resolutions
    };

    const { data, error } = await supabase.from('assemblies').insert(dbAssembly).select();
    if (error) throw error;
    const a = data[0];

    return {
        id: a.id,
        title: a.title,
        date: a.date,
        time: a.time,
        location: a.location,
        type: a.type,
        status: a.status,
        noticeText: a.notice_text,
        minutesText: a.minutes_text,
        resolutions: a.resolutions
    };
};

export const updateAssembly = async (id: string, updates: Partial<Assembly>): Promise<Assembly> => {
    const dbUpdates: any = { ...updates };
    if (updates.noticeText) dbUpdates.notice_text = updates.noticeText;
    if (updates.minutesText) dbUpdates.minutes_text = updates.minutesText;

    // Remove fields that shouldn't be in DB or are already mapped
    delete dbUpdates.noticeText;
    delete dbUpdates.minutesText;

    const { data, error } = await supabase.from('assemblies').update(dbUpdates).eq('id', id).select();
    if (error) throw error;
    const a = data[0];

    return {
        id: a.id,
        title: a.title,
        date: a.date,
        time: a.time,
        location: a.location,
        type: a.type,
        status: a.status,
        noticeText: a.notice_text,
        minutesText: a.minutes_text,
        resolutions: a.resolutions
    };
};

// --- Autenticação e Perfis ---

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data.user;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUserProfile = async (providedUser?: any): Promise<any> => {
    console.log('supabaseService: getCurrentUserProfile started');
    let user = providedUser;

    if (!user) {
        console.log('supabaseService: No user provided, checking session...');
        // getSession is usually faster and less likely to hang than getUser on the client
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.error('supabaseService: getSession error:', sessionError);
        user = session?.user;
    }

    console.log('supabaseService: auth user:', user?.email);

    if (!user) {
        console.log('supabaseService: No user found, returning null');
        return null;
    }

    console.log('supabaseService: Fetching profile from DB for ID:', user.id);

    // Usar um timeout para evitar bloqueio infinito se a DB/RLS estiver a falhar
    const fetchProfilePromise = supabase.from('profiles').select('*').eq('id', user.id);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching profile')), 5000));

    let data = null;
    let error: any = null;

    try {
        const result: any = await Promise.race([fetchProfilePromise, timeoutPromise]);
        data = result.data?.[0]; // Pega o primeiro se existir
        error = result.error;
        console.log('supabaseService: DB fetch finished. Data:', !!data, 'Error:', error?.message);
    } catch (err: any) {
        console.error('supabaseService: Profile fetch timed out or failed:', err.message);
        error = { message: err.message };
    }

    if (error && error.code !== 'PGRST116' && !error.message?.includes('Timeout')) {
        console.error('Error fetching profile:', error);
    }

    if (data) {
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            fractionCode: data.fraction_code
        };
    }

    console.log('supabaseService: Using fallback profile for', user.email);
    // Fallback se não houver perfil ou se o fetch falhar
    // SEO Gestão Admin fallback especial se o email for o do admin
    const isAdmin = user.email === 'seo@gestao.com';

    return {
        id: user.id,
        name: isAdmin ? 'SEO Gestão (Admin)' : (user.email?.split('@')[0] || 'Utilizador'),
        email: user.email,
        role: isAdmin ? 'ADMIN' : 'RESIDENT',
        fractionCode: isAdmin ? 'ADMIN' : ''
    };
};

export const getProfiles = async (): Promise<any[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;

    return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        fractionCode: p.fraction_code
    }));
};

export const registerUser = async (profile: any, password: string) => {
    // 1. Sign up the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: password,
        options: {
            data: {
                full_name: profile.name,
            }
        }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Falha ao criar utilizador Auth.");

    // 2. Create the profile in the profiles table
    const dbProfile = {
        id: authData.user.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        fraction_code: profile.fractionCode
    };

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert(dbProfile)
        .select()
        .single();

    if (profileError) throw profileError;

    return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        fractionCode: profileData.fraction_code
    };
};

// Nota: Em Supabase, criar um utilizador normalmente requer Auth.
// Aqui vamos apenas criar o registo na tabela profiles para que apareça na lista.
// O utilizador real teria de se registar ou ser convidado via Auth Admin (que não está disponível no client-side sem edge functions).
export const createProfile = async (profile: any) => {
    const dbProfile = {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        fraction_code: profile.fractionCode,
        // id: nao geramos ID aqui, idealmente o ID deve vir do Auth.
        // Como workaround para "convite", podemos deixar o ID ser gerado ou usar um placeholder se a tabela permitir.
        // Se a tabela profiles exigir id ligado ao auth.users, isto vai falhar se o user não existir.
        // Assumindo que a tabela profiles pode ter users "pendentes" ou que vamos usar isto apenas para editar users existentes.
        // Para "Adicionar Utilizador" funcionar 100%, precisaríamos de uma Edge Function.
        // Vamos tentar inserir na tabela profiles e ver se o trigger trata do resto ou se falha.
    };

    // ATENÇÃO: Se a tabela profiles tiver FK para auth.users, insert vai falhar sem user criado.
    // Vamos assumir por agora que apenas 'editamos' ou que o admin cria via dashboard do Supabase,
    // OU que existe uma Edge Function para 'invite_user'.
    // Como fallback simples para este protótipo: vamos assumir que não podemos criar users FULLY sem backend,
    // mas vamos tentar inserir em 'profiles' caso a tabela seja desacoplada ou tenha triggers.

    // Se falhar, o UI deve avisar.
    const { data, error } = await supabase.from('profiles').insert(dbProfile).select();
    if (error) throw error;

    const p = data[0];
    return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        fractionCode: p.fraction_code
    };
};

// Workaround melhorado para 'Criar Utilizador' (Simulação no Client):
// Simplesmente não podemos criar Auth Users do cliente sem a service_role key (inseguro).
// A melhor aposta é ter uma tabela profiles que aceita inserts, e quando o user faz login (sign up), o trigger associa.
// Ou então, usamos uma tabela separada 'invites'. 
// Vamos manter users apenas leitura/update de roles por enquanto, e avisar na criação.

export const updateProfile = async (id: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.fractionCode !== undefined) dbUpdates.fraction_code = updates.fractionCode;

    const { data, error } = await supabase.from('profiles').update(dbUpdates).eq('id', id).select();
    if (error) throw error;

    const p = data[0];
    return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        fractionCode: p.fraction_code
    };
};

export const deleteProfile = async (id: string) => {
    // Apenas apaga do profiles, não do Auth (requer admin)
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
};
