from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve
from config import auth_views
from writer import api

# View to serve React SPA
def serve_react_app(request):
    """Serve the React app's index.html for SPA routing"""
    index_path = settings.BASE_DIR / 'staticfiles' / 'writer-app' / 'index.html'
    if index_path.exists():
        return HttpResponse(index_path.read_text(), content_type='text/html')
    return HttpResponse('React app not built. Run: cd blog-frontend && npm run build', status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/google/', auth_views.google_login, name='google_login'),
    path('auth/google/callback/', auth_views.google_callback, name='google_callback'),
    path('accounts/login/', auth_views.google_login, name='account_login'),
    
    # API endpoints
    path('api/posts/', api.posts_list, name='api_posts_list'),
    path('api/posts/create/', api.post_create, name='api_post_create'),
    path('api/posts/<uuid:pk>/', api.post_detail, name='api_post_detail'),
    path('api/posts/<uuid:pk>/update/', api.post_update, name='api_post_update'),
    path('api/posts/<uuid:pk>/delete/', api.post_delete, name='api_post_delete'),
    path('api/auth/status/', api.auth_status, name='api_auth_status'),
    path('api/upload-image/', api.upload_image, name='api_upload_image'),
    
    # React app static assets (JS, CSS, etc.) - MUST be before the SPA catch-all
    re_path(r'^writer/app/assets/(?P<path>.*)$', serve, {
        'document_root': settings.BASE_DIR / 'staticfiles' / 'writer-app' / 'assets',
    }),
    
    # React SPA for writer dashboard (catch-all for client-side routing)
    re_path(r'^writer/app(?:/.*)?$', serve_react_app, name='writer_app'),
    
    # Keep existing writer URLs for backwards compatibility / logout
    path('writer/', include('writer.urls')),
    
    # Public pages
    path('', include('public.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
