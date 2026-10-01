using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace KritiAI.Installer
{
    public class SetupForm : Form
    {
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblDesc;
        private Label lblInstallPath;
        private Label lblStatus;
        private ProgressBar progressBar;
        private CheckBox chkDesktopShortcut;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunchNow;
        private Button btnInstall;
        private Button btnCancel;
        private string installDir;

        public SetupForm()
        {
            string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            installDir = Path.Combine(localApp, "Programs", "KritiAI");

            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.lblTitle = new Label();
            this.lblSubtitle = new Label();
            this.lblDesc = new Label();
            this.lblInstallPath = new Label();
            this.lblStatus = new Label();
            this.progressBar = new ProgressBar();
            this.chkDesktopShortcut = new CheckBox();
            this.chkStartMenu = new CheckBox();
            this.chkLaunchNow = new CheckBox();
            this.btnInstall = new Button();
            this.btnCancel = new Button();

            this.SuspendLayout();

            this.Text = "KritiAI Setup - Windows Personal AI OS";
            this.BackColor = Color.FromArgb(14, 19, 34);
            this.ForeColor = Color.White;
            this.ClientSize = new Size(540, 420);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;

            // Title
            this.lblTitle.Text = "⚡ KritiAI Windows Setup";
            this.lblTitle.Font = new Font("Segoe UI", 16F, FontStyle.Bold);
            this.lblTitle.ForeColor = Color.FromArgb(217, 70, 239);
            this.lblTitle.Location = new Point(28, 24);
            this.lblTitle.Size = new Size(480, 36);

            // Subtitle
            this.lblSubtitle.Text = "Kernel-Level RAG and IDE Tooling Interface with Artificial Intelligence";
            this.lblSubtitle.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            this.lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184);
            this.lblSubtitle.Location = new Point(30, 62);
            this.lblSubtitle.Size = new Size(480, 22);

            // Description
            this.lblDesc.Text = "This installer sets up the autonomous execution kernel, native PowerShell engine, file workspace, and user interface on your Windows PC.";
            this.lblDesc.Font = new Font("Segoe UI", 9F);
            this.lblDesc.ForeColor = Color.FromArgb(203, 213, 225);
            this.lblDesc.Location = new Point(30, 96);
            this.lblDesc.Size = new Size(480, 40);

            // Install Path
            this.lblInstallPath.Text = "Installation Path:\n" + this.installDir;
            this.lblInstallPath.Font = new Font("Segoe UI", 8.5F);
            this.lblInstallPath.ForeColor = Color.FromArgb(100, 116, 139);
            this.lblInstallPath.Location = new Point(30, 146);
            this.lblInstallPath.Size = new Size(480, 36);

            // Checkboxes
            this.chkDesktopShortcut.Text = "Create Desktop Shortcut";
            this.chkDesktopShortcut.Font = new Font("Segoe UI", 9F);
            this.chkDesktopShortcut.Checked = true;
            this.chkDesktopShortcut.Location = new Point(32, 192);
            this.chkDesktopShortcut.Size = new Size(240, 24);

            this.chkStartMenu.Text = "Add to Start Menu Programs";
            this.chkStartMenu.Font = new Font("Segoe UI", 9F);
            this.chkStartMenu.Checked = true;
            this.chkStartMenu.Location = new Point(32, 222);
            this.chkStartMenu.Size = new Size(240, 24);

            this.chkLaunchNow.Text = "Launch KritiAI immediately after setup";
            this.chkLaunchNow.Font = new Font("Segoe UI", 9F);
            this.chkLaunchNow.Checked = true;
            this.chkLaunchNow.Location = new Point(32, 252);
            this.chkLaunchNow.Size = new Size(300, 24);

            // Progress Bar
            this.progressBar.Location = new Point(32, 290);
            this.progressBar.Size = new Size(476, 18);
            this.progressBar.Style = ProgressBarStyle.Continuous;
            this.progressBar.Value = 0;

            // Status Label
            this.lblStatus.Text = "Ready to install. Click 'Install' to begin.";
            this.lblStatus.Font = new Font("Segoe UI", 8.5F);
            this.lblStatus.ForeColor = Color.FromArgb(148, 163, 184);
            this.lblStatus.Location = new Point(32, 316);
            this.lblStatus.Size = new Size(476, 28);

            // Install Button
            this.btnInstall.Text = "Install KritiAI";
            this.btnInstall.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            this.btnInstall.BackColor = Color.FromArgb(192, 38, 211);
            this.btnInstall.ForeColor = Color.White;
            this.btnInstall.FlatStyle = FlatStyle.Flat;
            this.btnInstall.FlatAppearance.BorderSize = 0;
            this.btnInstall.Location = new Point(276, 356);
            this.btnInstall.Size = new Size(130, 36);
            this.btnInstall.Cursor = Cursors.Hand;
            this.btnInstall.Click += new EventHandler(this.OnInstallClick);

            // Cancel Button
            this.btnCancel.Text = "Cancel";
            this.btnCancel.Font = new Font("Segoe UI", 9F);
            this.btnCancel.BackColor = Color.FromArgb(30, 41, 59);
            this.btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            this.btnCancel.FlatStyle = FlatStyle.Flat;
            this.btnCancel.FlatAppearance.BorderSize = 0;
            this.btnCancel.Location = new Point(416, 356);
            this.btnCancel.Size = new Size(92, 36);
            this.btnCancel.Cursor = Cursors.Hand;
            this.btnCancel.Click += new EventHandler(delegate(object sender, EventArgs e) { this.Close(); });

            this.Controls.Add(this.lblTitle);
            this.Controls.Add(this.lblSubtitle);
            this.Controls.Add(this.lblDesc);
            this.Controls.Add(this.lblInstallPath);
            this.Controls.Add(this.chkDesktopShortcut);
            this.Controls.Add(this.chkStartMenu);
            this.Controls.Add(this.chkLaunchNow);
            this.Controls.Add(this.progressBar);
            this.Controls.Add(this.lblStatus);
            this.Controls.Add(this.btnInstall);
            this.Controls.Add(this.btnCancel);

            this.ResumeLayout(false);
        }

        private void OnInstallClick(object sender, EventArgs e)
        {
            this.btnInstall.Enabled = false;
            this.btnCancel.Enabled = false;

            Thread worker = new Thread(PerformInstall);
            worker.IsBackground = true;
            worker.Start();
        }

        private void UpdateProgress(int percent, string statusText)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action<int, string>(UpdateProgress), percent, statusText);
                return;
            }
            this.progressBar.Value = Math.Min(100, Math.Max(0, percent));
            this.lblStatus.Text = statusText;
        }

        private void PerformInstall()
        {
            try
            {
                UpdateProgress(10, "Preparing target installation directory...");
                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                string workspaceDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "KritiAI", "workspace");
                if (!Directory.Exists(workspaceDir))
                {
                    Directory.CreateDirectory(workspaceDir);
                }

                UpdateProgress(25, "Obtaining application bundle...");
                string tempZip = Path.Combine(Path.GetTempPath(), "KritiAI_Payload_" + Environment.TickCount + ".zip");

                // Check local payload first
                string localPayload = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "payload.zip");
                bool gotPayload = false;

                if (File.Exists(localPayload))
                {
                    File.Copy(localPayload, tempZip, true);
                    gotPayload = true;
                }
                else
                {
                    // Download from website
                    string[] urls = new string[] {
                        "https://kritiai.vercel.app/api/download?file=payload.zip",
                        "https://kritiai.vercel.app/downloads/payload.zip"
                    };

                    foreach (string u in urls)
                    {
                        try
                        {
                            UpdateProgress(35, "Downloading latest bundle from cloud...");
                            WebClient wc = new WebClient();
                            wc.Headers.Add("User-Agent", "KritiAI-Setup/1.0");
                            wc.DownloadFile(u, tempZip);
                            if (File.Exists(tempZip) && new FileInfo(tempZip).Length > 10000)
                            {
                                gotPayload = true;
                                break;
                            }
                        }
                        catch { }
                    }
                }

                if (gotPayload && File.Exists(tempZip))
                {
                    UpdateProgress(55, "Unpacking runtime files...");
                    using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                    {
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            if (string.IsNullOrEmpty(entry.Name)) continue;
                            string destPath = Path.Combine(installDir, entry.FullName.Replace('/', Path.DirectorySeparatorChar));
                            string destParent = Path.GetDirectoryName(destPath);
                            if (!Directory.Exists(destParent)) Directory.CreateDirectory(destParent);
                            entry.ExtractToFile(destPath, true);
                        }
                    }
                    try { File.Delete(tempZip); } catch { }
                }
                else
                {
                    // Copy local files
                    CopyDirectory(AppDomain.CurrentDomain.BaseDirectory, installDir);
                }

                string exePath = Path.Combine(installDir, "KritiAI.exe");

                // Create Desktop Shortcut
                if (chkDesktopShortcut.Checked)
                {
                    UpdateProgress(75, "Creating Desktop shortcut...");
                    string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    string shortcutPath = Path.Combine(desktopDir, "KritiAI.lnk");
                    CreateShortcut(shortcutPath, exePath, installDir, "KritiAI Personal AI Operating System");
                }

                // Create Start Menu Entry
                if (chkStartMenu.Checked)
                {
                    UpdateProgress(85, "Creating Start Menu entry...");
                    string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                    string startMenuDir = Path.Combine(appData, @"Microsoft\Windows\Start Menu\Programs\KritiAI");
                    if (!Directory.Exists(startMenuDir)) Directory.CreateDirectory(startMenuDir);
                    string shortcutPath = Path.Combine(startMenuDir, "KritiAI.lnk");
                    CreateShortcut(shortcutPath, exePath, installDir, "KritiAI Personal AI Operating System");
                }

                UpdateProgress(100, "Installation completed successfully!");

                // Launch Application if selected
                if (chkLaunchNow.Checked && File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exePath,
                        WorkingDirectory = installDir,
                        UseShellExecute = true
                    });
                }

                Thread.Sleep(800);
                this.Invoke(new Action(delegate { this.Close(); }));
            }
            catch (Exception ex)
            {
                UpdateProgress(0, "Setup notice: " + ex.Message);
                this.Invoke(new Action(delegate
                {
                    this.btnCancel.Enabled = true;
                    this.btnInstall.Enabled = true;
                }));
            }
        }

        public void PerformSilentInstall()
        {
            try
            {
                if (!Directory.Exists(installDir)) Directory.CreateDirectory(installDir);

                string workspaceDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "KritiAI", "workspace");
                if (!Directory.Exists(workspaceDir)) Directory.CreateDirectory(workspaceDir);

                string localPayload = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "payload.zip");
                string tempZip = Path.Combine(Path.GetTempPath(), "KritiAI_Payload_" + Environment.TickCount + ".zip");
                bool gotPayload = false;

                if (File.Exists(localPayload))
                {
                    File.Copy(localPayload, tempZip, true);
                    gotPayload = true;
                }
                else
                {
                    string[] urls = new string[] {
                        "https://kritiai.vercel.app/api/download?file=payload.zip",
                        "https://kritiai.vercel.app/downloads/payload.zip"
                    };
                    foreach (string u in urls)
                    {
                        try
                        {
                            WebClient wc = new WebClient();
                            wc.Headers.Add("User-Agent", "KritiAI-Setup/1.0");
                            wc.DownloadFile(u, tempZip);
                            if (File.Exists(tempZip) && new FileInfo(tempZip).Length > 10000)
                            {
                                gotPayload = true;
                                break;
                            }
                        }
                        catch { }
                    }
                }

                if (gotPayload && File.Exists(tempZip))
                {
                    using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                    {
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            if (string.IsNullOrEmpty(entry.Name)) continue;
                            string destPath = Path.Combine(installDir, entry.FullName.Replace('/', Path.DirectorySeparatorChar));
                            string destParent = Path.GetDirectoryName(destPath);
                            if (!Directory.Exists(destParent)) Directory.CreateDirectory(destParent);
                            entry.ExtractToFile(destPath, true);
                        }
                    }
                    try { File.Delete(tempZip); } catch { }
                }

                string exePath = Path.Combine(installDir, "KritiAI.exe");
                string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                CreateShortcut(Path.Combine(desktopDir, "KritiAI.lnk"), exePath, installDir, "KritiAI Personal AI Operating System");

                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string startMenuDir = Path.Combine(appData, @"Microsoft\Windows\Start Menu\Programs\KritiAI");
                if (!Directory.Exists(startMenuDir)) Directory.CreateDirectory(startMenuDir);
                CreateShortcut(Path.Combine(startMenuDir, "KritiAI.lnk"), exePath, installDir, "KritiAI Personal AI Operating System");

                if (File.Exists(exePath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exePath,
                        WorkingDirectory = installDir,
                        UseShellExecute = true
                    });
                }
            }
            catch { }
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string workDir, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workDir;
                shortcut.Description = description;
                shortcut.Save();
            }
            catch { }
        }

        private static void CopyDirectory(string sourceDir, string targetDir)
        {
            Directory.CreateDirectory(targetDir);
            foreach (string file in Directory.GetFiles(sourceDir))
            {
                string dest = Path.Combine(targetDir, Path.GetFileName(file));
                File.Copy(file, dest, true);
            }
            foreach (string sub in Directory.GetDirectories(sourceDir))
            {
                string subName = Path.GetFileName(sub);
                if (subName.StartsWith(".") || subName == "node_modules") continue;
                string destSub = Path.Combine(targetDir, subName);
                CopyDirectory(sub, destSub);
            }
        }

        [STAThread]
        public static void Main(string[] args)
        {
            if (args != null && args.Length > 0)
            {
                string a = args[0].ToLowerInvariant();
                if (a == "/silent" || a == "-silent" || a == "/s" || a == "-s")
                {
                    SetupForm form = new SetupForm();
                    form.PerformSilentInstall();
                    return;
                }
            }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
