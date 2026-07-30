import subprocess
import os
import sys
import uvicorn

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT, "frontend")


def build_frontend():
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    print("Building React frontend...")
    result = subprocess.run(
        [npm_cmd, "run", "build"],
        cwd=FRONTEND_DIR,
    )
    if result.returncode != 0:
        print("Frontend build failed!")
        sys.exit(1)
    print("Build complete.")
    print()


def main():
    if not os.path.exists(os.path.join(FRONTEND_DIR, "dist", "index.html")):
        build_frontend()

    print("=" * 36)
    print("  ShopHub - Production Mode")
    print("=" * 36)
    print()
    print("  Server:  http://127.0.0.1:8000")
    print("  API Docs: http://127.0.0.1:8000/docs")
    print("=" * 36)
    print()

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    main()
