import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.utils import timezone
from django.conf import settings
from .models import Post, Revision, Image
from .decorators import writer_required
from .static_generator import generate_static_post, generate_static_index


@writer_required
def posts_list(request):
    """GET /api/posts/ - list all posts for dashboard"""
    posts = Post.objects.all().order_by('-updated_at')
    return JsonResponse({
        'posts': [{
            'id': str(p.id),
            'title': p.title,
            'slug': p.slug,
            'status': p.status,
            'wordCount': len(p.markdown.split()) if p.markdown else 0,
            'updatedAt': p.updated_at.isoformat(),
            'publishedAt': p.published_at.isoformat() if p.published_at else None,
        } for p in posts]
    })


@writer_required
def post_detail(request, pk):
    """GET /api/posts/<id>/ - get single post for editing"""
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)
    
    return JsonResponse({
        'id': str(post.id),
        'title': post.title,
        'slug': post.slug,
        'markdown': post.markdown,
        'status': post.status,
        'wordCount': len(post.markdown.split()) if post.markdown else 0,
        'updatedAt': post.updated_at.isoformat(),
        'publishedAt': post.published_at.isoformat() if post.published_at else None,
    })


@csrf_protect
@writer_required
@require_http_methods(["POST"])
def post_create(request):
    """POST /api/posts/ - create new post"""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    title = data.get('title', '').strip()
    slug = data.get('slug', '').strip()
    
    if not title:
        return JsonResponse({'error': 'Title is required'}, status=400)
    if not slug:
        return JsonResponse({'error': 'Slug is required'}, status=400)
    
    if Post.objects.filter(slug=slug).exists():
        return JsonResponse({'error': f'Slug "{slug}" already exists'}, status=400)
    
    status = data.get('status', 'draft')
    post = Post.objects.create(
        title=title,
        slug=slug,
        markdown=data.get('markdown', ''),
        status=status,
        published_at=timezone.now() if status == 'published' else None,
    )
    Revision.objects.create(post=post, markdown=post.markdown)
    
    if post.status == 'published':
        generate_static_post(post)
        generate_static_index()
    
    return JsonResponse({
        'id': str(post.id),
        'slug': post.slug,
        'status': post.status,
    })


@csrf_protect
@writer_required
@require_http_methods(["PATCH"])
def post_update(request, pk):
    """PATCH /api/posts/<id>/ - update post"""
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    old_markdown = post.markdown
    old_slug = post.slug
    old_status = post.status
    
    # Update fields if provided
    if 'title' in data:
        title = data['title'].strip()
        if not title:
            return JsonResponse({'error': 'Title is required'}, status=400)
        post.title = title
    
    if 'slug' in data:
        new_slug = data['slug'].strip()
        if not new_slug:
            return JsonResponse({'error': 'Slug is required'}, status=400)
        if new_slug != post.slug and Post.objects.filter(slug=new_slug).exists():
            return JsonResponse({'error': f'Slug "{new_slug}" already exists'}, status=400)
        post.slug = new_slug
    
    if 'markdown' in data:
        post.markdown = data['markdown']
    
    if 'status' in data:
        post.status = data['status']
    
    # Set published_at if publishing for the first time
    if post.status == 'published' and not post.published_at:
        post.published_at = timezone.now()
    
    post.save()
    
    # Create revision if markdown changed
    if old_markdown != post.markdown:
        Revision.objects.create(post=post, markdown=post.markdown)
    
    # Handle static file generation
    if post.status == 'published':
        generate_static_post(post)
        generate_static_index()
        # Remove old static file if slug changed
        if old_slug != post.slug:
            old_file = settings.STATIC_SITE_ROOT / 'e' / f'{old_slug}.html'
            if old_file.exists():
                old_file.unlink()
    elif old_status == 'published':
        # Was published, now draft - remove static file
        generate_static_index()
        static_file = settings.STATIC_SITE_ROOT / 'e' / f'{old_slug}.html'
        if static_file.exists():
            static_file.unlink()
    
    return JsonResponse({
        'id': str(post.id),
        'slug': post.slug,
        'status': post.status,
    })


@csrf_protect
@writer_required
@require_http_methods(["DELETE"])
def post_delete(request, pk):
    """DELETE /api/posts/<id>/ - delete post"""
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)
    
    slug = post.slug
    was_published = post.status == 'published'
    
    post.delete()
    
    # Remove static file if was published
    if was_published:
        static_file = settings.STATIC_SITE_ROOT / 'e' / f'{slug}.html'
        if static_file.exists():
            static_file.unlink()
        generate_static_index()
    
    return JsonResponse({'success': True})


def auth_status(request):
    """GET /api/auth/status/ - check if user is authenticated"""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'email': request.user.email,
        })
    return JsonResponse({'authenticated': False})


@csrf_protect
@writer_required
@require_http_methods(["POST"])
def upload_image(request):
    """POST /api/upload-image/ - upload an image"""
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'No image file provided'}, status=400)
    image = Image.objects.create(file=request.FILES['image'])
    return JsonResponse({'url': image.file.url})

