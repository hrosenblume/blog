# Personal Essay Website

A Django-based CMS for writers that generates static HTML files for public readers. Write drafts with a WYSIWYG Markdown editor, publish to generate static pages, and serve them as real static files.

## Features

- **Writer Interface**: Private `/writer/` section with WYSIWYG Markdown editor (Toast UI Editor)
- **Google OAuth**: Secure login via django-allauth (restricted to your email)
- **Static Site Generation**: Published posts generate static HTML files in `static_site/`
- **Database**: SQLite by default, PostgreSQL for production
- **Image Uploads**: Upload images directly in the editor
- **Fixed-Width Typography**: Clean, readable design inspired by Paul Graham's essays

## Quick Start

```bash
git clone <repo-url>
cd blog
python3 run.py
```

That's it! The script handles everything automatically:
- Creates a virtual environment
- Installs dependencies
- Sets up SQLite database
- Creates a sample essay
- Starts the dev server

**Access the site:**
- Public site: http://localhost:8000/
- Writer dashboard: http://localhost:8000/writer/
- Django admin: http://localhost:8000/admin/ (login: admin / password)

## Setup Details

### Prerequisites

- Python 3.10+ (macOS: `brew install python@3.11`)
- PostgreSQL (optional - SQLite works by default for local dev)
- Google OAuth credentials (optional - only needed for writer login)

### Configuration

On first run, `run.py` creates a `.env` file with sensible defaults. To customize:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional - leave blank to use SQLite)
DATABASE_URL=postgres://user:pass@localhost:5432/dbname

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
WRITER_EMAIL=your-email@example.com

# Django Admin Superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=password
```

### Alternative: Manual Setup

If you prefer manual control:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py dev
```

### Running with Nginx (Recommended)

For better performance, you can serve the static site directly via nginx while Django handles the writer interface:

```
Browser → nginx (port 8080)
            ├── /              → static_site/index.html (fast, static)
            ├── /e/*           → static_site/e/*.html (fast, static)
            ├── /writer/*      → Django :8000
            ├── /accounts/*    → Django :8000
            └── /media/*       → media/ folder
```

**Setup:**

1. Install nginx:
   ```bash
   brew install nginx
   ```

2. Start nginx with the dev config:
   ```bash
   nginx -c $(pwd)/nginx.dev.conf
   ```

3. Start Django (in another terminal):
   ```bash
   python3 run.py
   ```

4. Access the site at http://localhost:8080/

**Note:** The `nginx.dev.conf` file has absolute paths configured for this project. When deploying to production, update the paths accordingly.

To stop nginx:
```bash
nginx -s stop
```

## Git Setup

Initialize git and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Note**: After initial setup, deployment is automatic: any git push to the main branch triggers a new build and deploy on Render. From Cursor, you just commit and push.

## Deploying to Render with a .com Domain

### 1. Connect GitHub to Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select this repository
4. Choose the branch (usually `main`)

### 2. Configure the Web Service

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
```

**Start Command:**
```bash
gunicorn config.wsgi:application
```

**Environment Variables:**
Add these in Render's dashboard:
- `SECRET_KEY` - Generate a secure key (e.g., `python -c "import secrets; print(secrets.token_urlsafe(50))"`)
- `DEBUG=False`
- `ALLOWED_HOSTS` - Your Render URL (e.g., `yourblog.onrender.com`) and your custom domain (e.g., `yourblog.com,www.yourblog.com`)
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
- `WRITER_EMAIL` - Your email address (the only one allowed to access `/writer/`)

### 3. Add PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Create a new database
3. Copy the "Internal Database URL" or "External Database URL"
4. Add it as `DATABASE_URL` environment variable in your Web Service

### 4. Connect Custom Domain

1. In your Web Service settings, go to "Custom Domains"
2. Add your domain (e.g., `yourblog.com` and `www.yourblog.com`)
3. Render will provide DNS instructions:
   - For root domain (`yourblog.com`): Add an A record pointing to Render's IP
   - For subdomain (`www.yourblog.com`): Add a CNAME record pointing to your Render service URL
4. Update DNS at your domain registrar (Namecheap, Cloudflare, etc.)
5. Wait for DNS propagation (can take a few minutes to 48 hours)

### 5. Initial Static Site Generation

After your first deployment, you'll need to generate the initial static files. You can either:
- Publish a post through the writer interface (which auto-generates static files)
- Or run the rebuild command via Render's shell:
  ```bash
  python manage.py rebuild_static
  ```

## Usage

### Creating Sample Content

To create a sample essay for testing:

```bash
python manage.py create_sample_essay
```

This creates a published essay titled "Sample" with lorem ipsum content and generates the initial static files.

### Writing Posts

1. Log in at `/writer/` (you'll be redirected to Google OAuth)
2. Click "New Post" to create a draft
3. Write in Markdown using the WYSIWYG editor
4. Upload images by clicking the image button in the editor
5. Set status to "Published" and click "Save" to generate static HTML

### Viewing Revisions

Click "Revisions" on any post to see its revision history.

### Exporting Posts

Back up all published posts as Markdown files:

```bash
python manage.py export_posts
git add content_backup/
git commit -m "Backup posts"
```

This creates `.md` files in `content_backup/` that you can version-control.

### Rebuilding Static Site

To rebuild all static files (useful after database migrations or bulk changes):

```bash
python manage.py rebuild_static
```

## Project Structure

```
blog/
├── manage.py
├── config/           # Django project settings
├── writer/           # Writer app (private CMS)
├── public/           # Public app (serves static files)
├── static/           # Static assets (CSS, JS)
├── media/            # Uploaded images
├── static_site/      # Generated static HTML files
└── content_backup/   # Exported Markdown files
```

## Security Notes

- The writer interface (`/writer/*`) is restricted to a single email address
- No login links are visible on public pages
- Static files are served directly (no database queries for public pages)
- Use environment variables for all secrets (never commit `.env`)

## License

Private project - all rights reserved.

