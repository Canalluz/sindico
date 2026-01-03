
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://peqgmckhgrnifvtwsrfo.supabase.co';
const supabaseKey = 'sb_publishable_c2p71Q2GdiQcC35Kl0FPVA_Y-bZWyvK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'seo@gestao.com';
    const password = 'seo123';

    console.log(`Creating user ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
    } else {
        console.log('Auth user created/initiated');
    }

    // Attempt login to ensure we get the ID and verify credentials
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed (could not get User ID):', loginError.message);
        return;
    }

    const userId = loginData.user?.id;

    if (!userId) {
        console.error('Could not obtain User ID.');
        return;
    }

    console.log(`Upserting profile for ${userId} as ADMIN...`);

    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        name: 'SEO Gestão (Admin)',
        role: 'ADMIN',
        fraction_code: 'ADMIN'
    });

    if (profileError) {
        console.error('Error updating profile:', profileError.message);
    } else {
        console.log('SUCCESS: SEO Admin user configured successfully.');
    }
}

createAdmin();
