' ===================================================================
'               ⚡ KritiAI - Personal AI Operating System
'          "Your Personal AI That Gets Things Done."
' ===================================================================
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Check if KritiAI.exe exists
If fso.FileExists(currentDir & "\KritiAI.exe") Then
    WshShell.Run Chr(34) & currentDir & "\KritiAI.exe" & Chr(34), 1, False
    WScript.Quit
End If

' Otherwise start python desktop engine invisibly (0 = SW_HIDE)
desktopScript = currentDir & "\desktop\app.py"
If fso.FileExists(desktopScript) Then
    WshShell.Run "python " & Chr(34) & desktopScript & Chr(34) & " --server-only", 0, False
    WScript.Sleep 1500
End If

' Open in Edge App Mode or Default Browser
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
If Not fso.FileExists(edgePath) Then
    edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
End If

If fso.FileExists(edgePath) Then
    WshShell.Run Chr(34) & edgePath & Chr(34) & " --app=http://localhost:9972 --window-size=1280,820", 1, False
Else
    WshShell.Run "http://localhost:9972", 1, False
End If
