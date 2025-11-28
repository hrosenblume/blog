#!/usr/bin/env python3
"""Setup and run the Django blog project. Works for first-time setup and subsequent runs."""

import os, signal, sys, subprocess
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
GREEN, YELLOW, RED, BLUE, NC = '\033[0;32m', '\033[1;33m', '\033[0;31m', '\033[0;34m', '\033[0m'

def log(msg, color=GREEN, icon="✅"): print(f"{color}{icon} {msg}{NC}")
def warn(msg): log(msg, YELLOW, "⚠️ ")
def error(msg): log(msg, RED, "❌")
def info(msg): log(msg, BLUE, "ℹ️ ")

def read_env():
    """Parse .env file into dict (no external dependencies)."""
    env_file = BASE_DIR / ".env"
    if not env_file.exists():
        return {}
    return {
        k.strip(): v.strip()
        for line in env_file.read_text().splitlines()
        if line.strip() and not line.startswith('#') and '=' in line
        for k, _, v in [line.partition('=')]
    }

def kill_port(port):
    """Kill any process on the given port."""
    try:
        result = subprocess.run(["lsof", "-ti", f"tcp:{port}"], capture_output=True, text=True)
        for pid in set(result.stdout.split()):
            try: os.kill(int(pid), signal.SIGTERM)
            except: pass
        if result.stdout.strip():
            log(f"Stopped process(es) on port {port}")
    except FileNotFoundError:
        pass

def find_python():
    """Find Python 3.10+ executable."""
    print("Checking Python version...")
    for cmd in ['python3.11', 'python3.12', 'python3.10', 'python3']:
        try:
            result = subprocess.run([cmd, '--version'], capture_output=True, text=True, check=True)
            version = result.stdout.strip().split()[-1]
            major, minor = map(int, version.split('.')[:2])
            if major == 3 and minor >= 10:
                log(f"Python {version} found ({cmd})\n")
                return cmd
        except:
            continue
    error("Python 3.10+ required. Install with: brew install python@3.11")
    sys.exit(1)

def setup_venv(python_cmd):
    """Create virtual environment if needed."""
    venv_dir = BASE_DIR / "venv"
    venv_python = venv_dir / "bin" / "python"
    
    if not venv_dir.exists():
        print("Creating virtual environment...")
        subprocess.run([python_cmd, "-m", "venv", str(venv_dir)], check=True)
        log("Virtual environment created\n")
    else:
        log("Virtual environment exists\n")
    
    return venv_python, venv_dir

def install_deps(venv_python, venv_dir):
    """Install dependencies if requirements.txt changed."""
    print("Checking dependencies...")
    marker = venv_dir / ".deps_installed"
    requirements = BASE_DIR / "requirements.txt"
    
    if marker.exists() and requirements.stat().st_mtime < marker.stat().st_mtime:
        log("Dependencies up to date\n")
        return
    
    print("Installing dependencies...")
    subprocess.run([str(venv_python), "-m", "pip", "install", "--upgrade", "pip", "-q"], check=True)
    subprocess.run([str(venv_python), "-m", "pip", "install", "-r", str(requirements), "-q"], check=True)
    marker.touch()
    log("Dependencies installed\n")

def create_env():
    """Create .env file with defaults if missing."""
    env_file = BASE_DIR / ".env"
    if env_file.exists():
        log(".env file exists\n")
        return
    
    print("Creating .env file...")
    env_file.write_text("""# Django Settings
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
WRITER_EMAIL=

# Django Admin Superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=password
""")
    warn("Created .env file - update with your settings\n")

def init_dirs():
    """Create required directories."""
    for subdir in ["static_site/e", "media/images", "content_backup", "staticfiles", "staticfiles/writer-app"]:
        (BASE_DIR / subdir).mkdir(parents=True, exist_ok=True)
    log("Directories initialized\n")


def find_npm():
    """Find npm executable."""
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True, check=True)
        return "npm"
    except (FileNotFoundError, subprocess.CalledProcessError):
        return None


def build_react_app():
    """Build the React frontend if needed."""
    frontend_dir = BASE_DIR / "blog-frontend"
    build_dir = BASE_DIR / "staticfiles" / "writer-app"
    index_file = build_dir / "index.html"
    
    # Check if frontend directory exists
    if not frontend_dir.exists():
        warn("blog-frontend directory not found, skipping React build\n")
        return
    
    # Check if npm is available
    npm = find_npm()
    if not npm:
        warn("npm not found - install Node.js to build React app\n")
        warn("React writer dashboard will not be available\n")
        return
    
    print("Checking React frontend...")
    
    # Check if node_modules exists
    node_modules = frontend_dir / "node_modules"
    package_json = frontend_dir / "package.json"
    
    if not node_modules.exists():
        print("Installing React dependencies...")
        result = subprocess.run(
            [npm, "install"],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            error(f"npm install failed: {result.stderr}")
            return
        log("React dependencies installed")
    
    # Check if build is needed (no index.html or source files newer than build)
    needs_build = not index_file.exists()
    
    if not needs_build:
        # Check if any source file is newer than the build
        build_time = index_file.stat().st_mtime
        src_dir = frontend_dir / "src"
        for src_file in src_dir.rglob("*"):
            if src_file.is_file() and src_file.stat().st_mtime > build_time:
                needs_build = True
                break
    
    if needs_build:
        print("Building React frontend...")
        result = subprocess.run(
            [npm, "run", "build"],
            cwd=str(frontend_dir),
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            error(f"React build failed: {result.stderr}")
            return
        log("React frontend built\n")
    else:
        log("React frontend up to date\n")

def ensure_superuser(venv_python):
    """Create Django superuser if configured and not exists."""
    env = read_env()
    username, email, password = (env.get(k) for k in ['DJANGO_SUPERUSER_USERNAME', 'DJANGO_SUPERUSER_EMAIL', 'DJANGO_SUPERUSER_PASSWORD'])
    
    if not (username and email and password):
        warn("Superuser env vars not set, skipping\n")
        return
    
    result = subprocess.run(
        [str(venv_python), "manage.py", "createsuperuser", "--noinput"],
        capture_output=True, text=True,
        env={**os.environ, 'DJANGO_SUPERUSER_USERNAME': username, 'DJANGO_SUPERUSER_EMAIL': email, 'DJANGO_SUPERUSER_PASSWORD': password}
    )
    
    if result.returncode == 0:
        log(f"Superuser '{username}' created\n")
    elif "already" in result.stderr.lower():
        log("Superuser exists\n")
    else:
        warn("Could not create superuser (database may not be ready)\n")

def run_server(venv_python):
    """Start the development server."""
    log("Starting development server...\n")
    info("Public site: http://localhost:8000/")
    info("Writer dashboard: http://localhost:8000/writer/app/")
    info("Django admin: http://localhost:8000/admin/\n")
    
    kill_port(8000)
    try:
        subprocess.run([str(venv_python), "manage.py", "dev"])
    except KeyboardInterrupt:
        print("\n\nShutting down...")

def main():
    print(f"{GREEN}🚀 Blog Project Setup & Run{NC}\n")
    
    python_cmd = find_python()
    venv_python, venv_dir = setup_venv(python_cmd)
    
    if not venv_python.exists():
        error("Virtual environment Python not found")
        sys.exit(1)
    
    install_deps(venv_python, venv_dir)
    create_env()
    init_dirs()
    build_react_app()
    ensure_superuser(venv_python)
    run_server(venv_python)

if __name__ == "__main__":
    main()
