using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace KritiAI
{
    public class SplashForm : Form
    {
        private const int Port = 9972;
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblStatus;
        private ProgressBar progressBar;
        private NotifyIcon trayIcon;
        private static Process pyProcess = null;
        private string cachedEdgeExe = null;
        private string cachedProjectRoot = null;

        public SplashForm()
        {
            InitializeComponent();
            InitializeTray();
            Thread worker = new Thread(RunEngineBoot);
            worker.IsBackground = true;
            worker.Start();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblSubtitle = new Label();
            this.lblStatus = new Label();
            this.progressBar = new ProgressBar();

            this.SuspendLayout();

            // Form properties
            this.Text = "KritiAI - Personal AI OS";
            this.BackColor = Color.FromArgb(13, 18, 31);
            this.ForeColor = Color.White;
            this.ClientSize = new Size(480, 220);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.ShowInTaskbar = true;

            // Title Label
            this.lblTitle.Text = "⚡ KritiAI Personal AI OS";
            this.lblTitle.Font = new Font("Segoe UI", 16F, FontStyle.Bold);
            this.lblTitle.ForeColor = Color.FromArgb(217, 70, 239); // Fuchsia
            this.lblTitle.Location = new Point(24, 24);
            this.lblTitle.Size = new Size(430, 36);

            // Subtitle Label
            this.lblSubtitle.Text = "\"Your Personal AI That Gets Things Done.\"";
            this.lblSubtitle.Font = new Font("Segoe UI", 9.5F, FontStyle.Italic);
            this.lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184); // Slate 400
            this.lblSubtitle.Location = new Point(26, 62);
            this.lblSubtitle.Size = new Size(430, 24);

            // Progress Bar
            this.progressBar.Location = new Point(28, 106);
            this.progressBar.Size = new Size(424, 18);
            this.progressBar.Style = ProgressBarStyle.Marquee;
            this.progressBar.MarqueeAnimationSpeed = 30;

            // Status Label
            this.lblStatus.Text = "Starting Desktop Kernel & PowerShell Terminal on port 9972...";
            this.lblStatus.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            this.lblStatus.ForeColor = Color.FromArgb(203, 213, 225); // Slate 300
            this.lblStatus.Location = new Point(26, 140);
            this.lblStatus.Size = new Size(430, 48);

            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.lblSubtitle);
            this.Controls.Add(this.progressBar);
            this.Controls.Add(this.lblStatus);

            this.ResumeLayout(false);
        }

        private void InitializeTray()
        {
            this.trayIcon = new NotifyIcon();
            this.trayIcon.Text = "KritiAI Personal AI OS (Port 9972)";
            this.trayIcon.Icon = SystemIcons.Application;
            this.trayIcon.Visible = false;

            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add("⚡ Open KritiAI", new EventHandler(OnOpenApp));
            menu.MenuItems.Add("📁 Open Workspace Folder", new EventHandler(OnOpenWorkspace));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add("❌ Exit KritiAI", new EventHandler(OnExitApp));

            this.trayIcon.ContextMenu = menu;
            this.trayIcon.DoubleClick += new EventHandler(OnOpenApp);
        }

        private void OnOpenApp(object sender, EventArgs e)
        {
            string targetUrl = "http://localhost:" + Port;
            if (!string.IsNullOrEmpty(cachedEdgeExe) && File.Exists(cachedEdgeExe))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = cachedEdgeExe,
                    Arguments = "--app=" + targetUrl + " --window-size=1280,820",
                    UseShellExecute = true
                });
            }
            else
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = targetUrl,
                    UseShellExecute = true
                });
            }
        }

        private void OnOpenWorkspace(object sender, EventArgs e)
        {
            string dir = !string.IsNullOrEmpty(cachedProjectRoot) && Directory.Exists(cachedProjectRoot) ? cachedProjectRoot : AppDomain.CurrentDomain.BaseDirectory;
            Process.Start("explorer.exe", dir);
        }

        private void OnExitApp(object sender, EventArgs e)
        {
            try
            {
                if (pyProcess != null && !pyProcess.HasExited)
                {
                    pyProcess.Kill();
                }
            }
            catch { }
            this.trayIcon.Visible = false;
            Application.Exit();
        }

        private void UpdateStatus(string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action<string>(UpdateStatus), message);
                return;
            }
            lblStatus.Text = message;
        }

        private void RunEngineBoot()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string logPath = Path.Combine(appDir, "launcher.log");
            try
            {
                File.WriteAllText(logPath, "[INFO] Launcher started at " + DateTime.Now.ToString() + "\n");
                string scriptPath = null;
                string projectRoot = appDir;

                UpdateStatus("Detecting workspace directory & Python runtime...");

                // Find desktop/app.py across candidate directories
                string[] candidates = new string[]
                {
                    Path.Combine(appDir, "desktop", "app.py"),
                    Path.Combine(appDir, "app.py"),
                    Path.GetFullPath(Path.Combine(appDir, "..", "desktop", "app.py")),
                    Path.GetFullPath(Path.Combine(appDir, "..", "..", "desktop", "app.py")),
                    Path.Combine(Directory.GetCurrentDirectory(), "desktop", "app.py"),
                    @"K:\Projects\kittyai\desktop\app.py"
                };

                foreach (string candidate in candidates)
                {
                    if (File.Exists(candidate))
                    {
                        scriptPath = candidate;
                        string parent1 = Path.GetDirectoryName(candidate);
                        string parent2 = Path.GetDirectoryName(parent1);
                        projectRoot = !string.IsNullOrEmpty(parent2) && Directory.Exists(parent2) ? parent2 : parent1;
                        break;
                    }
                }

                cachedProjectRoot = projectRoot;
                File.AppendAllText(logPath, "[INFO] scriptPath=" + scriptPath + ", projectRoot=" + projectRoot + "\n");

                // Check if server is already running
                bool isRunning = IsPortOpen("127.0.0.1", Port);
                File.AppendAllText(logPath, "[INFO] isRunning=" + isRunning.ToString() + "\n");
                if (!isRunning && scriptPath != null)
                {
                    UpdateStatus("Booting native KritiAI engine & terminal bridge...");

                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);

                    string[] pyCandidates = new string[]
                    {
                        Path.Combine(localAppData, @"Programs\Python\Python312\python.exe"),
                        Path.Combine(localAppData, @"Programs\Python\Python311\python.exe"),
                        Path.Combine(localAppData, @"Programs\Python\Python313\python.exe"),
                        Path.Combine(localAppData, @"Programs\Python\Python310\python.exe"),
                        Path.Combine(localAppData, @"Microsoft\WindowsApps\python.exe"),
                        Path.Combine(programFiles, @"Python312\python.exe"),
                        Path.Combine(programFiles, @"Python311\python.exe"),
                        Path.Combine(programFiles, @"Python310\python.exe"),
                        Path.Combine(localAppData, @"Programs\Python\Python312\pythonw.exe"),
                        "python.exe",
                        "py.exe",
                        "pythonw.exe"
                    };

                    string pythonExe = "python.exe";
                    foreach (string p in pyCandidates)
                    {
                        if (File.Exists(p))
                        {
                            pythonExe = p;
                            break;
                        }
                    }

                    File.AppendAllText(logPath, "[INFO] pythonExe=" + pythonExe + "\n");

                    ProcessStartInfo pyPsi = new ProcessStartInfo
                    {
                        FileName = pythonExe,
                        Arguments = "\"" + scriptPath + "\" --server-only",
                        WorkingDirectory = projectRoot,
                        CreateNoWindow = true,
                        WindowStyle = ProcessWindowStyle.Hidden,
                        UseShellExecute = false
                    };

                    try
                    {
                        pyProcess = Process.Start(pyPsi);
                        File.AppendAllText(logPath, "[INFO] Process.Start succeeded. PID=" + (pyProcess != null ? pyProcess.Id.ToString() : "null") + "\n");
                    }
                    catch (Exception ex)
                    {
                        File.AppendAllText(logPath, "[WARN] Primary start failed: " + ex.Message + ", trying fallback...\n");
                        pyPsi.FileName = "python";
                        try
                        {
                            pyProcess = Process.Start(pyPsi);
                            File.AppendAllText(logPath, "[INFO] Fallback 'python' succeeded. PID=" + (pyProcess != null ? pyProcess.Id.ToString() : "null") + "\n");
                        }
                        catch (Exception ex2)
                        {
                            File.AppendAllText(logPath, "[ERROR] Fallback failed: " + ex2.Message + "\n");
                        }
                    }
                }

                // Wait for port 9972 to become active
                UpdateStatus("Connecting to KritiAI Desktop Kernel on http://localhost:9972...");
                bool portActive = false;
                for (int i = 0; i < 35; i++)
                {
                    if (IsPortOpen("127.0.0.1", Port)) 
                    {
                        portActive = true;
                        break;
                    }
                    Thread.Sleep(200);
                }

                File.AppendAllText(logPath, "[INFO] Port 9972 active=" + portActive.ToString() + "\n");

                // Launch Edge Native App Window
                UpdateStatus("Opening KritiAI Native Desktop Window...");
                string targetUrl = "http://localhost:" + Port;
                string edgePath1 = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                string edgePath2 = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                string edgeExe = File.Exists(edgePath1) ? edgePath1 : (File.Exists(edgePath2) ? edgePath2 : null);
                cachedEdgeExe = edgeExe;

                File.AppendAllText(logPath, "[INFO] edgeExe=" + (edgeExe ?? "null") + "\n");

                if (edgeExe != null)
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = edgeExe,
                        Arguments = "--app=" + targetUrl + " --window-size=1280,820",
                        UseShellExecute = true
                    });
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                }

                Thread.Sleep(600);
                // Hide splash and keep active in system tray
                this.Invoke(new Action(() =>
                {
                    this.trayIcon.Visible = true;
                    this.Hide();
                }));
            }
            catch (Exception ex)
            {
                File.AppendAllText(logPath, "[FATAL] " + ex.ToString() + "\n");
                UpdateStatus("Initialization notice: " + ex.Message);
                Thread.Sleep(2500);
                this.Invoke(new Action(() => this.Close()));
            }
        }

        private static bool IsPortOpen(string host, int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(250);
                    if (!success) return false;
                    client.EndConnect(result);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                // Minimize to tray instead of closing
                e.Cancel = true;
                this.Hide();
                this.trayIcon.Visible = true;
            }
            else
            {
                base.OnFormClosing(e);
            }
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SplashForm());
        }
    }
}
