using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace KritiAI
{
    public class SplashForm : Form
    {
        public const int Port = 9972;
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblStatus;
        private ProgressBar progressBar;
        private NotifyIcon trayIcon;
        private static HttpListener httpListener = null;
        private static bool isKernelRunning = false;
        private static bool isAgentPaused = false;
        private static string activeWorkspaceDir = null;
        private static string pairedCode = null;
        private static string pairedDeviceToken = null;
        private static string websiteUrl = "https://kritiai.vercel.app";
        private static string cachedEdgeExe = null;
        private static string baseDir = null;
        private KritiAIAppContext appContext = null;

        public SplashForm() : this(null) { }

        public SplashForm(KritiAIAppContext context)
        {
            this.appContext = context;
            baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string defaultWs = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "KritiAI", "workspace");
            if (!Directory.Exists(defaultWs))
            {
                try { Directory.CreateDirectory(defaultWs); } catch { }
            }
            activeWorkspaceDir = Directory.Exists(defaultWs) ? defaultWs : baseDir;

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

            this.Text = "KritiAI - Personal AI OS";
            this.BackColor = Color.FromArgb(13, 18, 31);
            this.ForeColor = Color.White;
            this.ClientSize = new Size(500, 230);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.ShowInTaskbar = true;

            // Title Label
            this.lblTitle.Text = "⚡ KritiAI Personal AI OS";
            this.lblTitle.Font = new Font("Segoe UI", 16F, FontStyle.Bold);
            this.lblTitle.ForeColor = Color.FromArgb(217, 70, 239);
            this.lblTitle.Location = new Point(24, 22);
            this.lblTitle.Size = new Size(450, 36);

            // Subtitle Label
            this.lblSubtitle.Text = "\"Kernel-Level RAG and IDE Tooling Interface with Artificial Intelligence\"";
            this.lblSubtitle.Font = new Font("Segoe UI", 9F, FontStyle.Italic);
            this.lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184);
            this.lblSubtitle.Location = new Point(26, 60);
            this.lblSubtitle.Size = new Size(450, 22);

            // Progress Bar
            this.progressBar.Location = new Point(28, 102);
            this.progressBar.Size = new Size(444, 18);
            this.progressBar.Style = ProgressBarStyle.Marquee;
            this.progressBar.MarqueeAnimationSpeed = 30;

            // Status Label
            this.lblStatus.Text = "Starting Native Desktop Kernel on port 9972...";
            this.lblStatus.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            this.lblStatus.ForeColor = Color.FromArgb(203, 213, 225);
            this.lblStatus.Location = new Point(26, 138);
            this.lblStatus.Size = new Size(450, 48);

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
            menu.MenuItems.Add("⏸️ Pause Local Agent", new EventHandler(OnTogglePauseAgent));
            menu.MenuItems.Add("⚙️ Settings", new EventHandler(OnOpenSettings));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add("❌ Exit KritiAI", new EventHandler(OnExitApp));

            this.trayIcon.ContextMenu = menu;
            this.trayIcon.DoubleClick += new EventHandler(OnOpenApp);
        }

        private void OnTogglePauseAgent(object sender, EventArgs e)
        {
            MenuItem item = sender as MenuItem;
            isAgentPaused = !isAgentPaused;
            if (item != null)
            {
                item.Text = isAgentPaused ? "▶️ Resume Local Agent" : "⏸️ Pause Local Agent";
            }
            this.trayIcon.ShowBalloonTip(2000, "KritiAI Agent", isAgentPaused ? "Local Agent paused." : "Local Agent resumed.", ToolTipIcon.Info);
        }

        private void OnOpenSettings(object sender, EventArgs e)
        {
            OpenInBrowser("http://localhost:" + Port + "/settings");
        }

        private void OnOpenApp(object sender, EventArgs e)
        {
            OpenInBrowser("http://localhost:" + Port);
        }

        private void OpenInBrowser(string targetUrl)
        {
            if (!string.IsNullOrEmpty(cachedEdgeExe) && File.Exists(cachedEdgeExe))
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = cachedEdgeExe,
                        Arguments = "--app=" + targetUrl + " --window-size=1280,820",
                        UseShellExecute = true
                    });
                    return;
                }
                catch { }
            }

            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = targetUrl,
                    UseShellExecute = true
                });
            }
            catch { }
        }

        private void OnOpenWorkspace(object sender, EventArgs e)
        {
            string dir = !string.IsNullOrEmpty(activeWorkspaceDir) && Directory.Exists(activeWorkspaceDir)
                ? activeWorkspaceDir
                : baseDir;
            Process.Start("explorer.exe", dir);
        }

        private void OnExitApp(object sender, EventArgs e)
        {
            isKernelRunning = false;
            try
            {
                if (httpListener != null && httpListener.IsListening)
                {
                    httpListener.Stop();
                    httpListener.Close();
                }
            }
            catch { }
            this.trayIcon.Visible = false;
            if (this.appContext != null)
            {
                this.appContext.ExitApplication();
            }
            else
            {
                Application.Exit();
            }
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
            string logFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "kritiai_debug.log");
            try
            {
                File.AppendAllText(logFile, "[BOOT 1] Checking local port 9972 & starting native kernel...\n");
                UpdateStatus("Checking local port 9972 & starting native kernel...");
                StartNativeHttpKernel();
                File.AppendAllText(logFile, "[BOOT 2] Native kernel started. isKernelRunning=" + isKernelRunning + "\n");

                // Detect Edge for app mode
                string edgePath1 = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                string edgePath2 = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                cachedEdgeExe = File.Exists(edgePath1) ? edgePath1 : (File.Exists(edgePath2) ? edgePath2 : null);
                File.AppendAllText(logFile, "[BOOT 3] cachedEdgeExe=" + (cachedEdgeExe ?? "null") + "\n");

                // Start Remote Pairing background thread
                Thread pairThread = new Thread(BackgroundPairingLoop);
                pairThread.IsBackground = true;
                pairThread.Start();
                File.AppendAllText(logFile, "[BOOT 4] pairThread started\n");

                UpdateStatus("KritiAI Desktop Kernel Ready! Opening application window...");
                Thread.Sleep(500);

                File.AppendAllText(logFile, "[BOOT 5] Opening in browser...\n");
                OpenInBrowser("http://localhost:" + Port);

                Thread.Sleep(600);
                File.AppendAllText(logFile, "[BOOT 6] Invoking OnKernelReady...\n");
                this.Invoke(new Action(delegate()
                {
                    this.trayIcon.Visible = true;
                    File.AppendAllText(logFile, "[BOOT 7] trayIcon.Visible = true\n");
                    if (this.appContext != null)
                    {
                        this.appContext.OnKernelReady();
                    }
                    else
                    {
                        this.Hide();
                    }
                    File.AppendAllText(logFile, "[BOOT 8] OnKernelReady finished\n");
                }));
            }
            catch (Exception ex)
            {
                File.AppendAllText(logFile, "[BOOT ERROR] " + ex.ToString() + "\n");
                UpdateStatus("Kernel notice: " + ex.Message);
                Thread.Sleep(2000);
                OpenInBrowser("http://localhost:" + Port);
                this.Invoke(new Action(delegate()
                {
                    this.trayIcon.Visible = true;
                    if (this.appContext != null)
                    {
                        this.appContext.OnKernelReady();
                    }
                    else
                    {
                        this.Hide();
                    }
                }));
            }
        }

        private void StartNativeHttpKernel()
        {
            if (isKernelRunning) return;
            try
            {
                httpListener = new HttpListener();
                httpListener.Prefixes.Add("http://localhost:" + Port + "/");
                httpListener.Prefixes.Add("http://127.0.0.1:" + Port + "/");
                httpListener.Start();
                isKernelRunning = true;

                Thread listenerThread = new Thread(HttpListenerLoop);
                listenerThread.IsBackground = true;
                listenerThread.Start();
            }
            catch (Exception ex)
            {
                // Port might already be open by python or previous instance
                isKernelRunning = true;
            }
        }

        private void HttpListenerLoop()
        {
            while (isKernelRunning && httpListener != null && httpListener.IsListening)
            {
                try
                {
                    HttpListenerContext ctx = httpListener.GetContext();
                    ThreadPool.QueueUserWorkItem(ProcessHttpRequest, ctx);
                }
                catch
                {
                    if (!isKernelRunning) break;
                }
            }
        }

        private void ProcessHttpRequest(object state)
        {
            HttpListenerContext ctx = (HttpListenerContext)state;
            HttpListenerRequest req = ctx.Request;
            HttpListenerResponse res = ctx.Response;

            // Enable CORS
            res.AddHeader("Access-Control-Allow-Origin", "*");
            res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.AddHeader("Access-Control-Allow-Headers", "*");

            if (req.HttpMethod == "OPTIONS")
            {
                res.StatusCode = 204;
                res.Close();
                return;
            }

            string rawPath = req.Url.AbsolutePath;

            try
            {
                if (rawPath == "/api/health")
                {
                    SendJson(res, "{\"status\":\"online\",\"app\":\"KritiAI Desktop Kernel\",\"version\":\"2.5.0\",\"platform\":\"win32\",\"workspaceDir\":\"" + EscapeJson(activeWorkspaceDir) + "\",\"paired\":" + (pairedCode != null ? "true" : "false") + "}");
                }
                else if (rawPath == "/api/capabilities")
                {
                    bool hasVsCode = CheckCommandExists("where code");
                    bool hasOllama = CheckUrlReachable("http://127.0.0.1:11434/api/tags");
                    string json = "{\"status\":\"online\",\"desktop\":true,\"terminal\":true,\"filesystem\":true,\"vscode\":" + (hasVsCode ? "true" : "false") + ",\"ollama\":" + (hasOllama ? "true" : "false") + ",\"browser\":true,\"localRag\":true,\"workspaceDir\":\"" + EscapeJson(activeWorkspaceDir) + "\",\"platform\":\"win32\",\"version\":\"2.5.0\"}";
                    SendJson(res, json);
                }
                else if (rawPath == "/api/workspace")
                {
                    if (req.HttpMethod == "GET")
                    {
                        SendJson(res, "{\"workspaceDir\":\"" + EscapeJson(activeWorkspaceDir) + "\",\"defaultDir\":\"" + EscapeJson(activeWorkspaceDir) + "\"}");
                    }
                    else
                    {
                        string body = ReadBody(req);
                        string newDir = ExtractJsonField(body, "path");
                        if (!string.IsNullOrEmpty(newDir))
                        {
                            activeWorkspaceDir = newDir;
                            if (!Directory.Exists(activeWorkspaceDir))
                            {
                                try { Directory.CreateDirectory(activeWorkspaceDir); } catch { }
                            }
                        }
                        SendJson(res, "{\"workspaceDir\":\"" + EscapeJson(activeWorkspaceDir) + "\",\"message\":\"Workspace set.\"}");
                    }
                }
                else if (rawPath == "/api/terminal/run")
                {
                    string body = ReadBody(req);
                    string cmd = ExtractJsonField(body, "command");
                    string cwd = ExtractJsonField(body, "cwd");
                    if (string.IsNullOrEmpty(cwd)) cwd = activeWorkspaceDir;
                    string result = ExecutePowerShellCommand(cmd, cwd);
                    SendJson(res, result);
                }
                else if (rawPath == "/api/tools/execute")
                {
                    string body = ReadBody(req);
                    string tool = ExtractJsonField(body, "tool");
                    string result = DispatchTool(tool, body);
                    SendJson(res, result);
                }
                else if (rawPath == "/api/os/theme")
                {
                    string body = ReadBody(req);
                    string theme = ExtractJsonField(body, "theme");
                    bool isDark = theme == null || theme.ToLower().Contains("dark");
                    SetWindowsTheme(isDark);
                    SendJson(res, "{\"success\":true,\"theme\":\"" + (isDark ? "dark" : "light") + "\",\"message\":\"Theme set to " + (isDark ? "Dark Mode" : "Light Mode") + ".\"}");
                }
                else if (rawPath == "/api/os/volume")
                {
                    string body = ReadBody(req);
                    string lvlStr = ExtractJsonField(body, "level");
                    int lvl = 60;
                    int.TryParse(lvlStr, out lvl);
                    SetWindowsVolume(lvl);
                    SendJson(res, "{\"success\":true,\"level\":" + lvl + ",\"message\":\"Volume set to " + lvl + "%.\"}");
                }
                else if (rawPath == "/api/os/launch-app")
                {
                    string body = ReadBody(req);
                    string app = ExtractJsonField(body, "appName");
                    LaunchApplication(app);
                    SendJson(res, "{\"success\":true,\"app\":\"" + EscapeJson(app) + "\",\"message\":\"Launched " + EscapeJson(app) + ".\"}");
                }
                else if (rawPath == "/api/vscode/open")
                {
                    string body = ReadBody(req);
                    string file = ExtractJsonField(body, "filePath");
                    if (string.IsNullOrEmpty(file)) file = activeWorkspaceDir;
                    ExecutePowerShellCommand("code \"" + file + "\"", activeWorkspaceDir);
                    SendJson(res, "{\"success\":true,\"target\":\"" + EscapeJson(file) + "\",\"message\":\"Opened in VS Code.\"}");
                }
                else if (rawPath == "/api/ollama/tags")
                {
                    string ollamaResp = ForwardHttpGet("http://127.0.0.1:11434/api/tags");
                    if (ollamaResp != null)
                    {
                        SendJson(res, "{\"online\":true,\"raw\":" + ollamaResp + "}");
                    }
                    else
                    {
                        SendJson(res, "{\"online\":false,\"models\":[],\"count\":0}");
                    }
                }
                else if (rawPath == "/api/fs/list")
                {
                    string json = ListDirectoryFiles(activeWorkspaceDir);
                    SendJson(res, json);
                }
                else if (rawPath == "/api/fs/create-file")
                {
                    string body = ReadBody(req);
                    string relPath = ExtractJsonField(body, "path");
                    string content = ExtractJsonField(body, "content");
                    string fullPath = Path.Combine(activeWorkspaceDir, relPath);
                    string dir = Path.GetDirectoryName(fullPath);
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    File.WriteAllText(fullPath, content ?? "");
                    SendJson(res, "{\"success\":true,\"path\":\"" + EscapeJson(fullPath) + "\",\"relativePath\":\"" + EscapeJson(relPath) + "\",\"sizeBytes\":" + (content != null ? content.Length : 0) + ",\"message\":\"File created.\"}");
                }
                else if (rawPath == "/api/fs/read-file")
                {
                    string relPath = req.QueryString["path"];
                    if (string.IsNullOrEmpty(relPath)) relPath = "";
                    string fullPath = Path.Combine(activeWorkspaceDir, relPath);
                    if (File.Exists(fullPath))
                    {
                        string content = File.ReadAllText(fullPath);
                        SendJson(res, "{\"success\":true,\"path\":\"" + EscapeJson(fullPath) + "\",\"content\":\"" + EscapeJson(content) + "\"}");
                    }
                    else
                    {
                        res.StatusCode = 404;
                        SendJson(res, "{\"error\":\"File not found\"}");
                    }
                }
                else if (rawPath == "/api/pair/connect")
                {
                    string body = ReadBody(req);
                    string code = ExtractJsonField(body, "code");
                    if (!string.IsNullOrEmpty(code))
                    {
                        pairedCode = code.ToUpper().Trim();
                        pairedDeviceToken = "dt_" + pairedCode.ToLower() + "_" + Environment.TickCount;
                    }
                    SendJson(res, "{\"success\":true,\"paired\":true,\"code\":\"" + EscapeJson(pairedCode) + "\",\"deviceToken\":\"" + EscapeJson(pairedDeviceToken) + "\"}");
                }
                else if (rawPath == "/api/pair/state")
                {
                    SendJson(res, "{\"paired\":" + (pairedCode != null ? "true" : "false") + ",\"code\":\"" + EscapeJson(pairedCode) + "\",\"deviceToken\":\"" + EscapeJson(pairedDeviceToken) + "\"}");
                }
                else
                {
                    // Serve static frontend files from dist/ folder
                    ServeStaticFile(res, rawPath);
                }
            }
            catch (Exception ex)
            {
                res.StatusCode = 500;
                SendJson(res, "{\"error\":\"" + EscapeJson(ex.Message) + "\"}");
            }
        }

        private void ServeStaticFile(HttpListenerResponse res, string urlPath)
        {
            string clean = urlPath.TrimStart('/');
            if (string.IsNullOrEmpty(clean)) clean = "index.html";

            string distDir = Path.Combine(baseDir, "dist");
            if (!Directory.Exists(distDir))
            {
                distDir = Path.Combine(baseDir, "..", "dist");
            }

            string filePath = Path.Combine(distDir, clean.Replace('/', '\\'));
            if (!File.Exists(filePath))
            {
                filePath = Path.Combine(distDir, "index.html");
            }

            if (File.Exists(filePath))
            {
                byte[] bytes = File.ReadAllBytes(filePath);
                string ext = Path.GetExtension(filePath).ToLower();
                if (ext == ".html") res.ContentType = "text/html; charset=utf-8";
                else if (ext == ".js") res.ContentType = "application/javascript";
                else if (ext == ".css") res.ContentType = "text/css";
                else if (ext == ".json") res.ContentType = "application/json";
                else if (ext == ".svg") res.ContentType = "image/svg+xml";
                else if (ext == ".png") res.ContentType = "image/png";
                else if (ext == ".ico") res.ContentType = "image/x-icon";
                else res.ContentType = "application/octet-stream";

                res.ContentLength64 = bytes.Length;
                res.OutputStream.Write(bytes, 0, bytes.Length);
                res.Close();
            }
            else
            {
                res.StatusCode = 200;
                res.ContentType = "text/html; charset=utf-8";
                string fallbackHtml = "<html><head><title>KritiAI Desktop</title><style>body{background:#0a0d14;color:#fff;font-family:sans-serif;padding:40px;text-align:center;}a{color:#d946ef;}</style></head><body><h1>⚡ KritiAI Desktop Kernel Online</h1><p>Local Runtime is active on port 9972.</p><p><a href=\"https://kritiai.vercel.app\">Open KritiAI Cloud Web Client</a></p></body></html>";
                byte[] b = Encoding.UTF8.GetBytes(fallbackHtml);
                res.OutputStream.Write(b, 0, b.Length);
                res.Close();
            }
        }

        private static string DispatchTool(string toolName, string rawJson)
        {
            string tool = (toolName ?? "").ToLower().Replace(".", "_").Replace("-", "_").Trim();

            if (tool == "terminal_execute" || tool == "terminal_run")
            {
                string cmd = ExtractJsonField(rawJson, "command");
                string cwd = ExtractJsonField(rawJson, "cwd");
                if (string.IsNullOrEmpty(cwd)) cwd = activeWorkspaceDir;
                return ExecutePowerShellCommand(cmd, cwd);
            }
            if (tool == "filesystem_create_file" || tool == "fs_create_file")
            {
                string relPath = ExtractJsonField(rawJson, "path");
                string content = ExtractJsonField(rawJson, "content");
                string fullPath = Path.Combine(activeWorkspaceDir, relPath);
                string dir = Path.GetDirectoryName(fullPath);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                File.WriteAllText(fullPath, content ?? "");
                return "{\"success\":true,\"path\":\"" + EscapeJson(fullPath) + "\",\"relativePath\":\"" + EscapeJson(relPath) + "\",\"sizeBytes\":" + (content != null ? content.Length : 0) + ",\"message\":\"File created successfully: " + EscapeJson(relPath) + "\"}";
            }
            if (tool == "filesystem_read_file" || tool == "fs_read_file")
            {
                string relPath = ExtractJsonField(rawJson, "path");
                string fullPath = Path.Combine(activeWorkspaceDir, relPath);
                if (File.Exists(fullPath))
                {
                    string content = File.ReadAllText(fullPath);
                    return "{\"success\":true,\"path\":\"" + EscapeJson(fullPath) + "\",\"content\":\"" + EscapeJson(content) + "\"}";
                }
                return "{\"success\":false,\"error\":\"File not found: " + EscapeJson(relPath) + "\"}";
            }
            if (tool == "filesystem_list_dir" || tool == "fs_list")
            {
                return ListDirectoryFiles(activeWorkspaceDir);
            }
            if (tool == "windows_set_theme")
            {
                string theme = ExtractJsonField(rawJson, "theme");
                bool isDark = theme == null || theme.ToLower().Contains("dark");
                SetWindowsTheme(isDark);
                return "{\"success\":true,\"theme\":\"" + (isDark ? "dark" : "light") + "\",\"message\":\"Windows personalization theme set to " + (isDark ? "Dark Mode" : "Light Mode") + ".\"}";
            }
            if (tool == "windows_set_volume")
            {
                string lvlStr = ExtractJsonField(rawJson, "level");
                int lvl = 60;
                int.TryParse(lvlStr, out lvl);
                SetWindowsVolume(lvl);
                return "{\"success\":true,\"level\":" + lvl + ",\"message\":\"Windows master audio volume set to " + lvl + "%.\"}";
            }
            if (tool == "windows_launch_app")
            {
                string app = ExtractJsonField(rawJson, "appName");
                LaunchApplication(app);
                return "{\"success\":true,\"app\":\"" + EscapeJson(app) + "\",\"message\":\"Launched application: " + EscapeJson(app) + "\"}";
            }
            if (tool == "vscode_open" || tool == "vscode_open_file")
            {
                string file = ExtractJsonField(rawJson, "filePath");
                if (string.IsNullOrEmpty(file)) file = activeWorkspaceDir;
                ExecutePowerShellCommand("code \"" + file + "\"", activeWorkspaceDir);
                return "{\"success\":true,\"target\":\"" + EscapeJson(file) + "\",\"message\":\"Opened in VS Code: " + EscapeJson(file) + "\"}";
            }
            if (tool == "ollama_tags" || tool == "ollama_probe")
            {
                string tags = ForwardHttpGet("http://127.0.0.1:11434/api/tags");
                return tags != null ? "{\"online\":true,\"raw\":" + tags + "}" : "{\"online\":false,\"models\":[],\"count\":0}";
            }

            return "{\"success\":false,\"error\":\"Unhandled tool: " + EscapeJson(toolName) + "\"}";
        }

        private static string ExecutePowerShellCommand(string command, string cwd)
        {
            if (string.IsNullOrEmpty(command))
            {
                return "{\"success\":false,\"error\":\"Empty command.\",\"returncode\":1}";
            }

            Stopwatch sw = Stopwatch.StartNew();
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"" + command.Replace("\"", "\\\"") + "\"",
                    WorkingDirectory = !string.IsNullOrEmpty(cwd) && Directory.Exists(cwd) ? cwd : activeWorkspaceDir,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using (Process p = Process.Start(psi))
                {
                    string stdout = p.StandardOutput.ReadToEnd();
                    string stderr = p.StandardError.ReadToEnd();
                    p.WaitForExit(30000);
                    sw.Stop();

                    bool success = p.ExitCode == 0;
                    return "{\"success\":" + (success ? "true" : "false") + ",\"returncode\":" + p.ExitCode + ",\"stdout\":\"" + EscapeJson(stdout) + "\",\"stderr\":\"" + EscapeJson(stderr) + "\",\"cwd\":\"" + EscapeJson(psi.WorkingDirectory) + "\",\"elapsedMs\":" + sw.ElapsedMilliseconds + "}";
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                return "{\"success\":false,\"returncode\":1,\"stderr\":\"" + EscapeJson(ex.Message) + "\",\"elapsedMs\":" + sw.ElapsedMilliseconds + "}";
            }
        }

        private static void SetWindowsTheme(bool isDark)
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", true))
                {
                    if (key != null)
                    {
                        int val = isDark ? 0 : 1;
                        key.SetValue("AppsUseLightTheme", val, RegistryValueKind.DWord);
                        key.SetValue("SystemUsesLightTheme", val, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }

        private static void SetWindowsVolume(int level)
        {
            int vol = Math.Max(0, Math.min_val(100, level));
            string script = "$wsh = New-Object -ComObject WScript.Shell; for ($i=0; $i -lt 50; $i++) { $wsh.SendKeys([char]174) }; for ($i=0; $i -lt [math]::Round(" + vol + "/2); $i++) { $wsh.SendKeys([char]175) }";
            ExecutePowerShellCommand(script, null);
        }

        private static void LaunchApplication(string appName)
        {
            string clean = (appName ?? "").ToLower().Trim();
            string target = clean;
            if (clean == "vscode" || clean == "vs code") target = "code";
            else if (clean == "calc" || clean == "calculator") target = "calc.exe";
            else if (clean == "notepad") target = "notepad.exe";
            else if (clean == "terminal" || clean == "windows terminal") target = "wt.exe";

            try
            {
                Process.Start(new ProcessStartInfo { FileName = "cmd.exe", Arguments = "/c start " + target, CreateNoWindow = true, UseShellExecute = false });
            }
            catch { }
        }

        private static string ListDirectoryFiles(string path)
        {
            try
            {
                DirectoryInfo dir = new DirectoryInfo(path);
                StringBuilder sb = new StringBuilder();
                sb.Append("{\"success\":true,\"cwd\":\"" + EscapeJson(path) + "\",\"entries\":[");
                int idx = 0;
                foreach (DirectoryInfo sub in dir.GetDirectories())
                {
                    if (sub.Name.StartsWith(".") || sub.Name == "node_modules") continue;
                    if (idx > 0) sb.Append(",");
                    sb.Append("{\"name\":\"" + EscapeJson(sub.Name) + "\",\"path\":\"" + EscapeJson(sub.FullName) + "\",\"isDir\":true,\"size\":0}");
                    idx++;
                    if (idx > 40) break;
                }
                foreach (FileInfo f in dir.GetFiles())
                {
                    if (f.Name.StartsWith(".")) continue;
                    if (idx > 0) sb.Append(",");
                    sb.Append("{\"name\":\"" + EscapeJson(f.Name) + "\",\"path\":\"" + EscapeJson(f.FullName) + "\",\"isDir\":false,\"size\":" + f.Length + "}");
                    idx++;
                    if (idx > 60) break;
                }
                sb.Append("]}");
                return sb.ToString();
            }
            catch (Exception ex)
            {
                return "{\"success\":false,\"error\":\"" + EscapeJson(ex.Message) + "\"}";
            }
        }

        private static bool CheckCommandExists(string cmd)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c " + cmd,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };
                using (Process p = Process.Start(psi))
                {
                    string outText = p.StandardOutput.ReadToEnd();
                    p.WaitForExit(1500);
                    return p.ExitCode == 0 && !string.IsNullOrEmpty(outText.Trim());
                }
            }
            catch { return false; }
        }

        private static bool CheckUrlReachable(string url)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = 1200;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    return res.StatusCode == HttpStatusCode.OK;
                }
            }
            catch { return false; }
        }

        private static string ForwardHttpGet(string url)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = 1500;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                using (StreamReader reader = new StreamReader(res.GetResponseStream()))
                {
                    return reader.ReadToEnd();
                }
            }
            catch { return null; }
        }

        private static void BackgroundPairingLoop()
        {
            while (isKernelRunning)
            {
                try
                {
                    if (!isAgentPaused && !string.IsNullOrEmpty(pairedDeviceToken))
                    {
                        string pollUrl = websiteUrl.TrimEnd('/') + "/api/pair";
                        string postData = "{\"action\":\"poll_commands\",\"deviceToken\":\"" + pairedDeviceToken + "\"}";
                        byte[] bytes = Encoding.UTF8.GetBytes(postData);

                        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(pollUrl);
                        req.Method = "POST";
                        req.ContentType = "application/json";
                        req.ContentLength = bytes.Length;
                        req.Timeout = 8000;

                        using (Stream s = req.GetRequestStream())
                        {
                            s.Write(bytes, 0, bytes.Length);
                        }

                        using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                        using (StreamReader reader = new StreamReader(res.GetResponseStream()))
                        {
                            string json = reader.ReadToEnd();
                            // Check for commands
                            if (json.Contains("\"commands\":[") && !json.Contains("\"commands\":[]"))
                            {
                                // Parse and execute
                                string cmdId = ExtractJsonField(json, "id");
                                string tool = ExtractJsonField(json, "tool");
                                if (string.IsNullOrEmpty(tool)) tool = "terminal_execute";

                                string toolResult = DispatchTool(tool, json);

                                // Post result back
                                string reportData = "{\"action\":\"post_result\",\"commandId\":\"" + cmdId + "\",\"result\":" + toolResult + "}";
                                byte[] rBytes = Encoding.UTF8.GetBytes(reportData);
                                HttpWebRequest postBack = (HttpWebRequest)WebRequest.Create(pollUrl);
                                postBack.Method = "POST";
                                postBack.ContentType = "application/json";
                                postBack.ContentLength = rBytes.Length;
                                using (Stream ps = postBack.GetRequestStream())
                                {
                                    ps.Write(rBytes, 0, rBytes.Length);
                                }
                                using (HttpWebResponse rRes = (HttpWebResponse)postBack.GetResponse()) { }
                            }
                        }
                    }
                }
                catch { }
                Thread.Sleep(3000);
            }
        }

        private static void SendJson(HttpListenerResponse res, string json)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(json);
            res.ContentType = "application/json; charset=utf-8";
            res.ContentLength64 = buffer.Length;
            res.OutputStream.Write(buffer, 0, buffer.Length);
            res.Close();
        }

        private static string ReadBody(HttpListenerRequest req)
        {
            using (StreamReader reader = new StreamReader(req.InputStream, req.ContentEncoding))
            {
                return reader.ReadToEnd();
            }
        }

        private static string ExtractJsonField(string json, string field)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(field)) return null;
            string pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"";
            System.Text.RegularExpressions.Match m = System.Text.RegularExpressions.Regex.Match(json, pattern);
            if (m.Success) return m.Groups[1].Value;

            string numPattern = "\"" + field + "\"\\s*:\\s*([0-9]+)";
            System.Text.RegularExpressions.Match mNum = System.Text.RegularExpressions.Regex.Match(json, numPattern);
            if (mNum.Success) return mNum.Groups[1].Value;

            return null;
        }

        private static string EscapeJson(string s)
        {
            if (s == null) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n").Replace("\t", "\\t");
        }

        public static class Math
        {
            public static int Max(int a, int b) { return a > b ? a : b; }
            public static int min_val(int a, int b) { return a < b ? a : b; }
        }

        [STAThread]
        public static void Main()
        {
            string logFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "kritiai_debug.log");
            AppDomain.CurrentDomain.UnhandledException += delegate(object sender, UnhandledExceptionEventArgs args)
            {
                try
                {
                    File.AppendAllText(logFile, "[" + DateTime.Now.ToString("o") + "] CRITICAL THREAD EXCEPTION: " + (args.ExceptionObject != null ? args.ExceptionObject.ToString() : "null") + "\n");
                }
                catch { }
            };

            try
            {
                File.AppendAllText(logFile, "[" + DateTime.Now.ToString("o") + "] Starting KritiAI ApplicationContext...\n");
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new KritiAIAppContext());
                File.AppendAllText(logFile, "[" + DateTime.Now.ToString("o") + "] ApplicationContext ended normally.\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText(logFile, "[" + DateTime.Now.ToString("o") + "] UNHANDLED EXCEPTION: " + ex.ToString() + "\n");
            }
        }
    }

    public class KritiAIAppContext : ApplicationContext
    {
        private SplashForm splashForm;

        public KritiAIAppContext()
        {
            splashForm = new SplashForm(this);
            splashForm.Show();
        }

        public void OnKernelReady()
        {
            if (splashForm != null)
            {
                splashForm.Hide();
            }
        }

        public void ExitApplication()
        {
            if (splashForm != null)
            {
                splashForm.Close();
                splashForm = null;
            }
            ExitThread();
        }
    }
}
