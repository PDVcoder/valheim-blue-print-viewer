"""
Custom HTTP Server for Valheim Blueprint Viewer
Serves static web files and provides API endpoint to save rotation calibration:
POST /api/save-calibration -> writes presets/rotation_calibration.json
"""

import http.server
import json
import os
import sys

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CALIBRATION_FILE = os.path.join(BASE_DIR, "presets", "rotation_calibration.json")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path == "/api/save-calibration":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length)
                data = json.loads(body.decode("utf-8"))
                
                os.makedirs(os.path.dirname(CALIBRATION_FILE), exist_ok=True)
                with open(CALIBRATION_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, sort_keys=True)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                response = {
                    "success": True,
                    "message": "Saved to presets/rotation_calibration.json",
                    "count": len(data)
                }
                self.wfile.write(json.dumps(response).encode("utf-8"))
                print(f"[Calibration] Saved {len(data)} prefab calibrations to {CALIBRATION_FILE}")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                err = {"success": False, "error": str(e)}
                self.wfile.write(json.dumps(err).encode("utf-8"))
        else:
            self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run_server():
    server_address = ("", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, CustomHandler)
    print(f"Valheim BP Viewer server running at http://localhost:{PORT}")
    print(f"Calibration endpoint ready at POST http://localhost:{PORT}/api/save-calibration")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
