
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { AutomationService } = require('./services/automationService');
const http = require('http');
const { Server } = require('socket.io');
const WhatsAppService = require('./whatsappService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Admin Client (Service Role for backend operations)
if (process.env.SUPABASE_SERVICE_KEY.includes('REPLACE')) {
  console.error("CRITICAL ERROR: invalid SUPABASE_SERVICE_KEY in .env. Admin actions will fail.");
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Automation Service Instance
const automationService = new AutomationService();

// --- Routes ---

// 1. Health Check
app.get('/', (req, res) => {
  res.send('KittyAI Backend is running');
});

// 2. Admin: Elevate User Plan
app.post('/api/admin/set-plan', async (req, res) => {
  const { userId, newPlan } = req.body; // newPlan: 'premium', 'platinum'
  
  if (!['free', 'premium', 'platinum'].includes(newPlan)) {
    return res.status(400).json({ error: 'Invalid plan type' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', userId)
      .select();

    if (error) throw error;
    res.json({ message: 'User plan updated successfully', data });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2.1 Admin: Delete User
app.delete('/api/admin/delete-user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    
    // Optional: Manually delete from profiles if not cascading, 
    // but usually auth deletion cascades or we leave profile as orphan/archived.
    // For now, allow Supabase to handle constraints or manual cleanup logic if needed.
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
     console.error('Error deleting user:', err);
     res.status(500).json({ error: err.message });
  }

});

// 2.2 Delete Credential
app.delete('/api/credentials/delete', async (req, res) => {
    const { userId, serviceName } = req.body;
    try {
        const { error } = await supabase
            .from('service_credentials')
            .delete()
            .eq('user_id', userId)
            .eq('service_name', serviceName);
            
        if (error) throw error;
        res.json({ message: 'Credential deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2.3 Delete Task
app.delete('/api/tasks/:taskId', async (req, res) => {
    const { taskId } = req.params;
    try {
        const { error } = await supabase
            .from('automation_tasks')
            .delete()
            .eq('id', taskId);
        
        if (error) throw error;
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. User: Trigger Automation (Protected by User ID check ideally, but simplified here)
app.post('/api/automation/trigger', async (req, res) => {
  const { userId, taskType, details } = req.body;
  
  // 1. Verify User Plan (Optional: Middleware would be better)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  if (!profile || (profile.plan === 'free' && taskType !== 'test')) {
     return res.status(403).json({ error: 'Upgrade to Premium to use automation features.' });
  }

  // 2. Get Credentials
  const { data: credentials } = await supabase
    .from('service_credentials')
    .select('*')
    .eq('user_id', userId)
    .single(); // Assuming one set of creds for now per user per service, or handled in logic

  // 3. Log Task
  await supabase.from('automation_tasks').insert({
    user_id: userId,
    task_type: taskType,
    status: 'pending',
    details: details
  });

  // 4. Trigger Service (Async)
  // In a real app, this would go to a queue. Here we just run it.
  automationService.runTask(taskType, details, credentials)
    .then(result => {
       console.log(`Task ${taskType} completed:`, result);
       // Update task status to completed
    })
    .catch(err => {
       console.error(`Task ${taskType} failed:`, err);
       // Update task status to failed
    });

  res.json({ message: 'Automation task queued successfully' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize WhatsApp Service
const whatsAppService = new WhatsAppService(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
