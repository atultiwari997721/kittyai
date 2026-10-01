using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace KritiAI
{
    static class Program
    {
        private const int Port = 9972;

        [STAThread]
        static void Main()
        {
            try
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string projectRoot = appDir;
                if (!File.Exists(Path.Combine(projectRoot, "desktop", "app.py")))
                {
                    DirectoryInfo parentDir = Directory.GetParent(appDir);
                    string parent = parentDir != null ? parentDir.FullName : null;
                    if (parent != null && File.Exists(Path.Combine(parent, "desktop", "app.py")))
                    {
                        projectRoot = parent;
                    }
                }

                // Check if server is already running on port 9972
                bool isRunning = IsPortOpen("127.0.0.1", Port);
                if (!isRunning)
                {
                    // Start python desktop/app.py in background
                    string scriptPath = Path.Combine(projectRoot, "desktop", "app.py");
                    if (File.Exists(scriptPath))
                    {
                        ProcessStartInfo pyPsi = new ProcessStartInfo
                        {
                            FileName = "python",
                            Arguments = "\"" + scriptPath + "\"",
                            WorkingDirectory = projectRoot,
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            WindowStyle = ProcessWindowStyle.Hidden
                        };
                        try
                        {
                            Process.Start(pyPsi);
                        }
                        catch
                        {
                            // Try py command
                            pyPsi.FileName = "py";
                            Process.Start(pyPsi);
                        }
                    }
                }

                // Wait up to 3 seconds for port to open
                for (int i = 0; i < 15; i++)
                {
                    if (IsPortOpen("127.0.0.1", Port)) break;
                    Thread.Sleep(200);
                }

                // Open App URL in browser or default app window
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:" + Port,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "KritiAI Launcher encountered an error:\n\n" + ex.Message + "\n\nPlease ensure Python 3.10+ is installed.",
                    "KritiAI - Personal AI Operating System",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
        }

        private static bool IsPortOpen(string host, int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(300);
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
    }
}
