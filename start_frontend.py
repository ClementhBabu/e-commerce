import subprocess
import os
import sys

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")

if __name__ == "__main__":
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    print("Starting ShopHub Frontend (React + Vite)...")
    print("  http://localhost:5173")
    print()
    subprocess.run([npm_cmd, "run", "dev"], cwd=FRONTEND_DIR)
