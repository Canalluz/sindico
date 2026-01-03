
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://peqgmckhgrnifvtwsrfo.supabase.co';
const supabaseKey = 'sb_publishable_c2p71Q2GdiQcC35Kl0FPVA_Y-bZWyvK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'martins@seogestao.com';
    const password = '123456';

    console.log(`Creating user ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        // If user already exists, we try to update the profile anyway
        if (!authError.message.includes('already registered')) {
            return;
        }
        console.log('User might already exist, attempting to update profile...');
    } else {
        console.log('Auth user created:', authData.user?.id);
    }

    // We need the user ID. If signUp succeeded, we have it.
    // If user existed, signUp returns the user (if email confirmation not required) or we can't get ID easily without login.
    // Let's try to SignIn to get the ID if signUp didn't give it (or if it failed).

    let userId = authData?.user?.id;

    if (!userId) {
        console.log('Attempting login to get User ID...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            console.error('Login failed:', loginError.message);
            return;
        }
        userId = loginData.user?.id;
    }

    if (!userId) {
        console.error('Could not obtain User ID.');
        return;
    }

    console.log(`Upserting profile for ${userId} as ADMIN...`);

    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        name: 'Martins (Admin)',
        role: 'ADMIN',
        fraction_code: 'ADMIN'
    });

    if (profileError) {
        console.error('Error updating profile:', profileError.message);
    } else {
        console.log('SUCCESS: Admin user configured successfully.');
    }
}

createAdmin();
