$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("c:\Users\hassn\skillfind\docs\Skillfind-Update 2025-12-27.docx")
$doc.Content.Text
$doc.Close()
$word.Quit()
