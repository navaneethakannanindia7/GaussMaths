"""
Gauss Maths - Simple Local Development Server
Usage: py server.py [port]
Default port: 8080
"""
import http.server
import socketserver
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json'
})

print(f"=======================================================")
print(f"  Gauss Maths Tuition & Exam Portal Local Server")
print(f"  Serving at: http://localhost:{PORT}")
print(f"  Press Ctrl+C to stop the server")
print(f"=======================================================")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Gauss Maths Server...")
        httpd.server_close()
