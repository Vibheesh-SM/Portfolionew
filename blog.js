/**
 * VIBHEESH S M — BLOG ENGINE
 * Handles: Creating, Saving, and Displaying blogs.
 * Uses LocalStorage for persistence (Temporary, recommended: Firebase).
 */

document.addEventListener('DOMContentLoaded', () => {
    const blogList = document.getElementById('blog-posts-list');
    const createForm = document.getElementById('create-blog-form');
    const previewBtn = document.getElementById('preview-btn');
    const previewContainer = document.getElementById('preview-container');
    const previewCard = document.getElementById('preview-card');
    const closePreviewBtn = document.getElementById('close-preview');

    // 1. Authorisation Check (Basic) - For administrative control
    const checkAuth = () => {
        const isAuthorised = sessionStorage.getItem('blog_admin_access');
        
        // Hide "Write Blog" button for regular visitors
        const writeBlogBtn = document.querySelectorAll('a[href="create.html"]');
        writeBlogBtn.forEach(btn => {
            if (!isAuthorised && !window.location.pathname.includes('create.html')) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-flex';
            }
        });

        if (window.location.pathname.includes('create.html') && !isAuthorised) {
            const password = prompt("Admin Access Required. Enter passcode to write a blog:");
            // Passcode: vibheesh2025 (Simple demo - recommend Firebase Auth for production)
            if (password === 'vibheesh2025') { 
                sessionStorage.setItem('blog_admin_access', 'true');
                location.reload(); // Refresh to show the editor properly
            } else {
                alert("Unauthorised access.");
                window.location.href = 'blog.html';
            }
        }
    };
    
    checkAuth();

    // 2. Load Blogs
    const loadBlogs = () => {
        if (!blogList) return;

        const blogs = JSON.parse(localStorage.getItem('my_blogs')) || [];
        
        if (blogs.length === 0) {
            blogList.innerHTML = `
                <div class="blog-placeholder">
                    <p>No blogs published yet. Be the first to start the conversation!</p>
                    <a href="create.html" class="btn btn-primary">Start Writing</a>
                </div>
            `;
            return;
        }

        blogList.innerHTML = ''; // Clear placeholder
        
        const isAdmin = sessionStorage.getItem('blog_admin_access');

        blogs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(blog => {
            const card = document.createElement('article');
            card.className = 'blog-card fade-in';
            
            card.innerHTML = `
                <div class="blog-card-image" style="background-image: url('${blog.banner || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600'}')"></div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        ${blog.category} • ${new Date(blog.date).toLocaleDateString()}
                        ${isAdmin ? `<button data-id="${blog.id}" class="delete-btn" style="float: right; color: #ff4d4d; border: none; background: none; cursor: pointer; font-weight: 700;">DELETE</button>` : ''}
                    </div>
                    <h3 class="blog-card-title">${blog.title}</h3>
                    <div class="blog-card-excerpt">${blog.content.substring(0, 150)}...</div>
                    <div class="blog-card-footer">
                        <span>By ${blog.author}</span>
                        <a href="#" class="btn-text">Read More →</a>
                    </div>
                </div>
            `;
            blogList.appendChild(card);
        });

        // Add delete handlers for admin
        if (isAdmin) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Delete this blog post?')) {
                        const updated = blogs.filter(b => b.id != id);
                        localStorage.setItem('my_blogs', JSON.stringify(updated));
                        loadBlogs();
                    }
                });
            });
        }
    };

    // 3. Save Blog
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(createForm);
            const newBlog = {
                id: Date.now(),
                title: formData.get('title'),
                author: formData.get('author'),
                category: formData.get('category'),
                banner: formData.get('banner'),
                content: formData.get('content'),
                date: new Date().toISOString()
            };

            const blogs = JSON.parse(localStorage.getItem('my_blogs')) || [];
            blogs.push(newBlog);
            localStorage.setItem('my_blogs', JSON.stringify(blogs));

            alert('Blog published successfully!');
            window.location.href = 'blog.html';
        });
    }

    // 4. Preview Blog
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            const formData = new FormData(createForm);
            const title = formData.get('title') || 'Untitled Post';
            const category = formData.get('category') || 'General';
            const banner = formData.get('banner') || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';
            const content = formData.get('content') || 'No content yet...';

            previewCard.innerHTML = `
                <article class="blog-card" style="max-width: 400px; margin: 0 auto;">
                    <div class="blog-card-image" style="background-image: url('${banner}')"></div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">${category} • PREVIEW</div>
                        <h3 class="blog-card-title">${title}</h3>
                        <div class="blog-card-excerpt">${content.substring(0, 150)}...</div>
                        <div class="blog-card-footer">
                            <span>Admin</span>
                        </div>
                    </div>
                </article>
            `;

            previewContainer.classList.remove('hidden');
            createForm.classList.add('hidden');
        });
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
            previewContainer.classList.add('hidden');
            createForm.classList.remove('hidden');
        });
    }

    // Initial Load
    loadBlogs();
});
