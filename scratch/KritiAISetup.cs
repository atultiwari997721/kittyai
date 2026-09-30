using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

namespace KritiAI
{
    public class SetupForm : Form
    {
        private Label lblTitle;
        private Label lblSub;
        private Label lblStatus;
        private Button btnLaunch;
        private Button btnOllama;
        private Button btnWeb;
        private ProgressBar progressBar;

        public SetupForm()
        {
            this.Text = "KritiAI - Personal AI Operating System Setup";
            this.Size = new Size(520, 360);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(10, 13, 20);
            this.ForeColor = Color.White;

            lblTitle = new Label()
            {
                Text = "KritiAI for Windows",
                Font = new Font("Segoe UI", 18, FontStyle.Bold),
                ForeColor = Color.FromArgb(232, 121, 249),
                Location = new Point(30, 25),
                AutoSize = true
            };

            lblSub = new Label()
            {
                Text = "\"Your Personal AI That Gets Things Done.\"\nLocal-First Multi-Agent Desktop & Sidecar Engine",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(32, 65),
                AutoSize = true
            };

            progressBar = new ProgressBar()
            {
                Location = new Point(32, 120),
                Size = new Size(440, 18),
                Style = ProgressBarStyle.Continuous,
                Value = 100
            };

            lblStatus = new Label()
            {
                Text = "Ready to launch KritiAI desktop workspace and local intelligence sidecar.",
                Font = new Font("Segoe UI", 8.5f),
                ForeColor = Color.FromArgb(52, 211, 153),
                Location = new Point(32, 150),
                Size = new Size(440, 35)
            };

            btnLaunch = new Button()
            {
                Text = "⚡ Launch KritiAI Desktop",
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Location = new Point(32, 195),
                Size = new Size(440, 42),
                BackColor = Color.FromArgb(192, 38, 211),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnLaunch.FlatAppearance.BorderSize = 0;
            btnLaunch.Click += (s, e) => LaunchKriti();

            btnOllama = new Button()
            {
                Text = "🦙 Configure Ollama",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                Location = new Point(32, 250),
                Size = new Size(215, 36),
                BackColor = Color.FromArgb(17, 23, 38),
                ForeColor = Color.FromArgb(203, 213, 225),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnOllama.FlatAppearance.BorderColor = Color.FromArgb(31, 41, 61);
            btnOllama.Click += (s, e) => Process.Start("https://ollama.com");

            btnWeb = new Button()
            {
                Text = "🌐 Open Companion Web",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                Location = new Point(257, 250),
                Size = new Size(215, 36),
                BackColor = Color.FromArgb(17, 23, 38),
                ForeColor = Color.FromArgb(203, 213, 225),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnWeb.FlatAppearance.BorderColor = Color.FromArgb(31, 41, 61);
            btnWeb.Click += (s, e) => Process.Start("http://localhost:5173");

            this.Controls.Add(lblTitle);
            this.Controls.Add(lblSub);
            this.Controls.Add(progressBar);
            this.Controls.Add(lblStatus);
            this.Controls.Add(btnLaunch);
            this.Controls.Add(btnOllama);
            this.Controls.Add(btnWeb);
        }

        private void LaunchKriti()
        {
            lblStatus.Text = "Initializing KritiAI sidecar and opening dashboard...";
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string scriptPath = Path.Combine(baseDir, "KritiAI-Setup.bat");
                if (File.Exists(scriptPath))
                {
                    Process.Start(new ProcessStartInfo()
                    {
                        FileName = scriptPath,
                        UseShellExecute = true
                    });
                }
                else
                {
                    Process.Start("http://localhost:5173");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not launch sidecar: " + ex.Message, "KritiAI", MessageBoxButtons.OK, MessageBoxIcon.Information);
                Process.Start("http://localhost:5173");
            }
            this.Close();
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
