// SEC Filing Parser using Pyodide
// Migrated from JavaScript to TypeScript

export async function parseSECFilingToJson(htmlContent: string): Promise<void> {
    try {
        // @ts-ignore - Pyodide types not available
        const { loadPyodide } = await import('pyodide');
        const pyodide = await loadPyodide();

        await pyodide.loadPackage('lxml');
        await pyodide.loadPackage('micropip');

        const wheelUrl =
            'https://github.com/OpenSourceAGI/agent-chatbot-apps/raw/refs/heads/main/sec_parser-0.58.1-py3-none-any.whl';

        pyodide.globals.set('html_content', htmlContent);
        pyodide.globals.set('wheel_url', wheelUrl);

        const pythonCode = `
import micropip
import sys

def print_first_n_lines(text: str, *, n: int):
    lines = text.split("\\n")
    print("\\n".join(lines[:n]))
    if len(lines) > n:
        print("...")

html = html_content
wheel_file_url = wheel_url

try:
    await micropip.install(wheel_file_url, reinstall=True, keep_going=True)
    print("✅ sec-parser installed successfully from hosted wheel!")
    
    import sec_parser as sp
    elements = sp.Edgar10QParser().parse(html)
    demo_output = sp.render(elements)
    print("=== SEC-PARSER OUTPUT ===")
    tree = sp.TreeBuilder().build(elements)
    demo_output = sp.render(tree)
    print_first_n_lines(demo_output, n=70)
except Exception as e:
    print(f"❌ Error installing sec-parser: {e}")
    `;

        await pyodide.runPythonAsync(pythonCode);
    } catch (error) {
        console.error('Error running Python script:', error);
        throw error;
    }
}

export default parseSECFilingToJson;
