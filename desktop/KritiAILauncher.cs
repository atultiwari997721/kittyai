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
                string scriptPath = null;
                string projectRoot = appDir;

                // 1. Search for desktop/app.py across all candidate locations
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
                        projectRoot = Path.GetDirectoryName(Path.GetDirectoryName(candidate));
                        if (string.IsNullOrEmpty(projectRoot) || !Directory.Exists(projectRoot))
                        {
                            projectRoot = Path.GetDirectoryName(candidate);
                        }
                        break;
                    }
                }

                // 2. Check if server is already running on port 9972
                bool isRunning = IsPortOpen("127.0.0.1", Port);
                if (!isRunning && scriptPath != null)
                {
                    // Prefer pythonw.exe for 0-console execution
                    string pythonExe = "pythonw";
                    string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    string defaultPyw = Path.Combine(localAppData, @"Programs\Python\Python312\pythonw.exe");
                    if (File.Exists(defaultPyw))
                    {
                        pythonExe = defaultPyw;
                    }

                    ProcessStartInfo pyPsi = new ProcessStartInfo
                    {
                        FileName = pythonExe,
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
                        // Fallback to standard python.exe
                        pyPsi.FileName = "python";
                        try
                        {
                            Process.Start(pyPsi);
                        }
                        catch
                        {
                            pyPsi.FileName = "py";
                            Process.Start(pyPsi);
                        }
                    }
                }

                // 3. Wait up to 5 seconds for port 9972 to open
                for (int i = 0; i < 25; i++)
                {
                    if (IsPortOpen("127.0.0.1", Port)) break;
                    Thread.Sleep(200);
                }

                // 4. Launch Native Desktop App Window using Microsoft Edge App Mode
                string targetUrl = "http://localhost:" + Port;
                string edgePath1 = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                string edgePath2 = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                string edgeExe = File.Exists(edgePath1) ? edgePath1 : (File.Exists(edgePath2) ? edgePath2 : null);

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
                    // Fallback to default browser
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "KritiAI Launcher encountered an error:\n\n" + ex.Message + "\n\nPlease ensure Python 3.10+ is installed or start 'KritiAI-Launcher.bat'.",
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
                    bool success = result.AsyncWaitHandle.WaitOne(350);
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
