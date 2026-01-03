
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://peqgmckhgrnifvtwsrfo.supabase.co';
const supabaseKey = 'sb_publishable_c2p71Q2GdiQcC35Kl0FPVA_Y-bZWyvK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createInitialUsers() {
    const users = [
        {
            email: 'seo@gestao.com',
            password: 'seo123',
            name: 'SEO Gestão (Admin)',
            role: 'ADMIN',
            fraction_code: 'ADMIN'
        },
        {
            email: 'morador@gestao.com',
            password: 'morador123',
            name: 'Morador Teste',
            role: 'RESIDENT',
            fraction_code: '101'
        }
    ];

    for (const u of users) {
        console.log(`Processing user ${u.email}...`);

        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (authError) {
            console.log(`Auth sync for ${u.email}: ${authError.message}`);
        }

        // Login to get ID
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: u.email,
            password: u.password
        });

        if (loginError) {
            console.error(`Login failed for ${u.email}:`, loginError.message);
            continue;
        }

        const userId = loginData.user?.id;
        if (!userId) {
            console.error(`Could not obtain User ID for ${u.email}.`);
            continue;
        }

        console.log(`Upserting profile for ${u.email} (${userId}) as ${u.role}...`);

        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email: u.email,
            name: u.name,
            role: u.role,
            fraction_code: u.fraction_code
        });

        if (profileError) {
            console.error(`Error updating profile for ${u.email}:`, profileError.message);
        } else {
            console.log(`SUCCESS: User ${u.email} configured successfully.`);
        }
    }
}

createInitialUsers();
