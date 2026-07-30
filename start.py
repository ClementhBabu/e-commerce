import subprocess
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT, "frontend")


def start_backend():
    return subprocess.Popen(
        [sys.executable, os.path.join(ROOT, "start_backend.py")],
        cwd=ROOT,
    )


def start_frontend():
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    return subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
    )


def main():
    print("=" * 36)
    print("  ShopHub - Starting Both Servers")
    print("=" * 36)
    print()
    print("  Backend:   http://127.0.0.1:8000")
    print("  Frontend:  http://localhost:5173")
    print("  API Docs:  http://127.0.0.1:8000/docs")
    print("=" * 36)
    print()
    print("Press Ctrl+C to stop all servers.")
    print()

    backend = start_backend()
    frontend = start_frontend()

    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        backend.terminate()
        frontend.terminate()
        backend.wait()
        frontend.wait()


if __name__ == "__main__":
    main()
