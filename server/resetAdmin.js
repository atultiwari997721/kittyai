
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const resetAdmin = async () => {
    const email = 'Abecsa@Abecsa.in';
    const password = 'Sanjay@9997721';

    console.log(`Resetting password for: ${email}`);
    
    // Find the user first to get ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    const adminUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!adminUser) {
        console.error("Admin user not found. Creating...");
        // Fallback to create if not found
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email, 
            password,
            email_confirm: true 
        });
        if(createError) console.error(createError);
        else console.log("Created. Try logging in.");
        return;
    }

    // Update password
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: password }
    );

    if (updateError) {
        console.error("Error updating password:", updateError);
    } else {
        console.log("SUCCESS: Password has been reset to: " + password);
    }
};

resetAdmin();
