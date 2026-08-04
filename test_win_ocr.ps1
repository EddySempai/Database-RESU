Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]

async function Run-Ocr($filePath) {
    # We can use Windows OCR or WinRT in C# or PowerShell
}

# Let's test a simple C# helper compiled on the fly with Add-Type
$csharpSource = @"
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

public class WinOcr
{
    public static async Task<string> RecognizeAsync(string imagePath)
    {
        StorageFile file = await StorageFile.GetFileFromPathAsync(imagePath);
        using (var stream = await file.OpenAsync(FileAccessMode.Read))
        {
            BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
            SoftwareBitmap bitmap = await decoder.GetSoftwareBitmapAsync(BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied);
            OcrEngine engine = OcrEngine.TryCreateFromUserProfileLanguages();
            if (engine == null) engine = OcrEngine.TryCreateFromLanguage(new Windows.Globalization.Language("es-ES")) ?? OcrEngine.TryCreateFromLanguage(new Windows.Globalization.Language("en-US"));
            var result = await engine.RecognizeAsync(bitmap);
            return result.Text;
        }
    }
}
"@

try {
    Add-Type -TypeDefinition $csharpSource -Language CSharp
    $sample = (Resolve-Path "resources/habilidades/photo_1_2026-07-05_14-40-54.jpg").Path
    $task = [WinOcr]::RecognizeAsync($sample)
    $task.Wait()
    Write-Output "OCR Result: $($task.Result)"
} catch {
    Write-Output "Error: $_"
}
