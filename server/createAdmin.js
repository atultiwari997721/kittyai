
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const createAdmin = async () => {
    const email = 'atultiwari997721@gmail.com';
    const password = 'ChangeMe123!'; // Temporary password if not exists

    console.log(`Attempting to create admin user: ${email}`);

    // 1. Create User in Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    });

    if (error) {
        console.error('Error creating user:', error.message);
        // If user already exists, we might want to just update the profile
        if (error.message.includes('already registered')) {
            console.log('User exists. Updating role...');
            // Find user ID (requires listing users or just update by email if we could, but profiles is by ID)
            // We'll skip complex lookup for this snippet and assume fresh or manual fix if needed.
            // Actually, we can get the user ID by signIn (conceptually) or listUsers 
            // but let's just ask user to sign in if they exist.
        }
        return;
    }

    console.log('User created:', user.user.id);

    // 2. Set Role to Admin in Profiles
    // The trigger 'handle_new_user' might have already run and set it to 'user'.
    // We need to update it to 'admin'.
    
    // Wait a bit for trigger
    await new Promise(r => setTimeout(r, 2000));

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.user.id);

    if (updateError) {
        console.error('Error updating profile role:', updateError.message);
    } else {
        console.log('SUCCESS: User Abecsa@Abecsa.in is now an Admin.');
    }
};

createAdmin();
