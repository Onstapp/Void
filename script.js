// Данные
let users = JSON.parse(localStorage.getItem('void_users')) || [];
let posts = JSON.parse(localStorage.getItem('void_posts')) || [];
let comments = JSON.parse(localStorage.getItem('void_comments')) || [];
let commentLikes = JSON.parse(localStorage.getItem('void_commentLikes')) || [];
let postLikes = JSON.parse(localStorage.getItem('void_postLikes')) || [];
let subscriptions = JSON.parse(localStorage.getItem('void_subscriptions')) || [];
let currentUser = null;
let viewingUser = null;
let currentHashtag = null;

// Сохранение
function saveUsers() { localStorage.setItem('void_users', JSON.stringify(users)); }
function savePosts() { localStorage.setItem('void_posts', JSON.stringify(posts)); }
function saveComments() { localStorage.setItem('void_comments', JSON.stringify(comments)); }
function saveCommentLikes() { localStorage.setItem('void_commentLikes', JSON.stringify(commentLikes)); }
function savePostLikes() { localStorage.setItem('void_postLikes', JSON.stringify(postLikes)); }
function saveSubscriptions() { localStorage.setItem('void_subscriptions', JSON.stringify(subscriptions)); }

// Создаем демо-пользователей
if (users.length === 0) {
    users.push(
        {
            id: 'demo1',
            name: 'Демо',
            username: 'demo',
            bio: 'Создатель Void ✨',
            verified: true,
            avatar: null
        },
        {
            id: 'user1',
            name: 'Анна',
            username: 'anna',
            bio: 'Дизайнер и художник 🎨',
            verified: false,
            avatar: null
        },
        {
            id: 'user2',
            name: 'Максим',
            username: 'max',
            bio: 'Разработчик из Void 💻',
            verified: false,
            avatar: null
        },
        {
            id: 'user3',
            name: 'Елена',
            username: 'elena',
            bio: 'Фотограф и путешественница 📸',
            verified: false,
            avatar: null
        }
    );
    saveUsers();
}

// Создаем тестовые посты
if (posts.length === 0) {
    posts.push(
        { 
            id: '101', 
            authorId: 'demo1', 
            content: 'Всем привет! 👋 Добро пожаловать в Void! #привет #void', 
            hashtags: ['привет', 'void'],
            mentions: [],
            drawing: null,
            timestamp: Date.now() - 3600000 
        },
        { 
            id: '102', 
            authorId: 'user1', 
            content: 'Сегодня отличная погода! ☀️ #погода #лето', 
            hashtags: ['погода', 'лето'],
            mentions: [],
            drawing: null,
            timestamp: Date.now() - 7200000 
        },
        { 
            id: '103', 
            authorId: 'user2', 
            content: 'Новый проект запущен! 🚀 #работа #проект', 
            hashtags: ['работа', 'проект'],
            mentions: [],
            drawing: null,
            timestamp: Date.now() - 10800000 
        },
        { 
            id: '104', 
            authorId: 'user3', 
            content: 'Мои новые фотографии уже в профиле 📸 #фото #творчество', 
            hashtags: ['фото', 'творчество'],
            mentions: [],
            drawing: null,
            timestamp: Date.now() - 14400000 
        }
    );
    savePosts();
}

// Функции
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatUsername(username) {
    return '@' + username;
}

function formatDate(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад';
    return Math.floor(diff / 86400000) + ' д назад';
}

function findUser(username) {
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

function findUserById(id) {
    return users.find(u => u.id === id);
}

function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_]{5,50}$/;
    return regex.test(username);
}

function extractHashtags(text) {
    return (text.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || []).map(tag => tag.substring(1));
}

function extractMentions(text) {
    return (text.match(/@[a-zA-Z0-9_]+/g) || []).map(mention => mention.substring(1));
}

function getTotalLikes(userId) {
    const userPosts = posts.filter(p => p.authorId === userId);
    let total = 0;
    userPosts.forEach(post => {
        total += postLikes.filter(l => l.postId === post.id).length;
    });
    return total;
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateUI() {
    if (!currentUser) return;

    // Обновляем аватарку
    const avatarEl = document.getElementById('profileAvatar');
    if (currentUser.avatar) {
        avatarEl.style.backgroundImage = `url('${currentUser.avatar}')`;
        avatarEl.classList.add('drawn-avatar');
        avatarEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.classList.remove('drawn-avatar');
        avatarEl.textContent = getInitials(currentUser.name);
    }

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileUsername').innerHTML = formatUsername(currentUser.username) + 
        (currentUser.verified ? ' <span class="verified-badge">✓</span>' : '');
    document.getElementById('profileBio').textContent = currentUser.bio || 'Привет! Я в Void 👋';
    document.getElementById('currentUserName').textContent = currentUser.name;

    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editBio').value = currentUser.bio || '';

    const followers = subscriptions.filter(s => s.followingId === currentUser.id).length;
    const following = subscriptions.filter(s => s.followerId === currentUser.id).length;
    const totalLikes = getTotalLikes(currentUser.id);
    
    document.getElementById('followersCount').textContent = followers;
    document.getElementById('followingCount').textContent = following;
    document.getElementById('totalLikesCount').textContent = totalLikes;

    // Обновляем ленту
    updateFeed();
}

function updateFeed() {
    const feed = document.getElementById('postsFeed');
    
    if (posts.length === 0) {
        feed.innerHTML = '<div class="empty-state">Пока нет постов</div>';
        return;
    }

    feed.innerHTML = '';

    // Сортируем посты по времени (новые сверху)
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

    sortedPosts.forEach(post => {
        const author = users.find(u => u.id === post.authorId);
        if (!author) return;

        const postComments = comments.filter(c => c.postId === post.id);
        const postLikesCount = postLikes.filter(l => l.postId === post.id).length;
        const userLikedPost = currentUser && postLikes.some(l => l.postId === post.id && l.userId === currentUser.id);

        const isFollowing = currentUser ? subscriptions.some(s => 
            s.followerId === currentUser.id && s.followingId === author.id
        ) : false;

        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        
        // Формируем HTML для изображения
        let postDrawingHTML = '';
        if (post.drawing) {
            postDrawingHTML = `<img src="${post.drawing}" class="post-drawing" loading="lazy">`;
        }

        // Формируем HTML для хештегов
        let contentWithLinks = post.content;
        if (post.hashtags) {
            post.hashtags.forEach(tag => {
                const regex = new RegExp(`#${tag}`, 'g');
                contentWithLinks = contentWithLinks.replace(regex, `<span class="hashtag" onclick="openHashtagModal('${tag}')">#${tag}</span>`);
            });
        }
        if (post.mentions) {
            post.mentions.forEach(mention => {
                const regex = new RegExp(`@${mention}`, 'g');
                contentWithLinks = contentWithLinks.replace(regex, `<span class="mention" onclick="openUserProfile('${mention}')">@${mention}</span>`);
            });
        }

        // Формируем HTML для комментариев
        const commentsHTML = postComments.map(c => {
            const commentAuthor = users.find(u => u.id === c.authorId);
            const commentLikesCount = commentLikes.filter(l => l.commentId === c.id).length;
            const userLikedComment = currentUser && commentLikes.some(l => l.commentId === c.id && l.userId === currentUser.id);
            const isCommentAuthor = currentUser && c.authorId === currentUser.id;
            
            return `
                <div class="comment">
                    <div class="comment-avatar ${commentAuthor?.avatar ? 'drawn-avatar' : ''}" ${commentAuthor?.avatar ? `style="background-image: url('${commentAuthor.avatar}')"` : ''} onclick="openUserProfile('${commentAuthor.username}')">${!commentAuthor?.avatar ? getInitials(commentAuthor?.name || '?') : ''}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author" onclick="openUserProfile('${commentAuthor.username}')">${commentAuthor?.name || 'Пользователь'}</span>
                            ${isCommentAuthor ? `<span class="comment-delete-btn" onclick="deleteComment('${c.id}')">✕</span>` : ''}
                        </div>
                        <div class="comment-text">${c.text}</div>
                        <div class="comment-footer">
                            <span class="comment-like-btn ${userLikedComment ? 'liked' : ''}" onclick="toggleCommentLike('${c.id}')">
                                ❤️ ${commentLikesCount}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        postDiv.innerHTML = `
            <div class="post-header" onclick="openUserProfile('${author.username}')">
                <div class="post-avatar ${author.avatar ? 'drawn-avatar' : ''}" ${author.avatar ? `style="background-image: url('${author.avatar}')"` : ''}>${!author.avatar ? getInitials(author.name) : ''}</div>
                <div class="post-author-info">
                    <div class="post-author">${author.name} ${author.verified ? '<span class="verified-badge">✓</span>' : ''}</div>
                    <div class="post-username">${formatUsername(author.username)}</div>
                </div>
                <div class="post-time">${formatDate(post.timestamp)}</div>
                ${author.id === currentUser?.id ? '<span class="delete-btn" onclick="deletePost(\'' + post.id + '\')">✕</span>' : ''}
            </div>
            <div class="post-content">${contentWithLinks.replace(/\n/g, '<br>')}</div>
            ${postDrawingHTML}
            <div class="post-actions">
                <span class="post-like-btn ${userLikedPost ? 'liked' : ''}" onclick="togglePostLike('${post.id}')">
                    ❤️ ${postLikesCount}
                </span>
                <span class="comment-toggle" onclick="toggleComments('${post.id}')">💬 ${postComments.length}</span>
                ${author.id !== currentUser?.id ? `
                    <button class="follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${author.id}')">
                        ${isFollowing ? '✓ Отписаться' : '+ Подписаться'}
                    </button>
                ` : ''}
            </div>
            <div class="comments-section" id="comments-${post.id}">
                ${commentsHTML}
                ${currentUser ? `
                    <div class="add-comment">
                        <input type="text" placeholder="Написать комментарий..." id="comment-input-${post.id}">
                        <button class="comment-submit" onclick="addComment('${post.id}')">→</button>
                    </div>
                ` : ''}
            </div>
        `;

        feed.appendChild(postDiv);
    });
}

function updateUserPosts() {
    const feed = document.getElementById('postsFeed');
    
    if (!currentUser) return;
    
    const userPosts = posts.filter(p => p.authorId === currentUser.id).sort((a, b) => b.timestamp - a.timestamp);
    
    if (userPosts.length === 0) {
        feed.innerHTML = '<div class="empty-state">У вас пока нет постов</div>';
        return;
    }

    feed.innerHTML = '';

    userPosts.forEach(post => {
        const author = currentUser;
        const postComments = comments.filter(c => c.postId === post.id);
        const postLikesCount = postLikes.filter(l => l.postId === post.id).length;
        const userLikedPost = currentUser && postLikes.some(l => l.postId === post.id && l.userId === currentUser.id);

        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        
        // Формируем HTML для изображения
        let postDrawingHTML = '';
        if (post.drawing) {
            postDrawingHTML = `<img src="${post.drawing}" class="post-drawing" loading="lazy">`;
        }

        // Формируем HTML для хештегов
        let contentWithLinks = post.content;
        if (post.hashtags) {
            post.hashtags.forEach(tag => {
                const regex = new RegExp(`#${tag}`, 'g');
                contentWithLinks = contentWithLinks.replace(regex, `<span class="hashtag" onclick="openHashtagModal('${tag}')">#${tag}</span>`);
            });
        }
        if (post.mentions) {
            post.mentions.forEach(mention => {
                const regex = new RegExp(`@${mention}`, 'g');
                contentWithLinks = contentWithLinks.replace(regex, `<span class="mention" onclick="openUserProfile('${mention}')">@${mention}</span>`);
            });
        }

        // Формируем HTML для комментариев
        const commentsHTML = postComments.map(c => {
            const commentAuthor = users.find(u => u.id === c.authorId);
            const commentLikesCount = commentLikes.filter(l => l.commentId === c.id).length;
            const userLikedComment = currentUser && commentLikes.some(l => l.commentId === c.id && l.userId === currentUser.id);
            const isCommentAuthor = currentUser && c.authorId === currentUser.id;
            
            return `
                <div class="comment">
                    <div class="comment-avatar ${commentAuthor?.avatar ? 'drawn-avatar' : ''}" ${commentAuthor?.avatar ? `style="background-image: url('${commentAuthor.avatar}')"` : ''} onclick="openUserProfile('${commentAuthor.username}')">${!commentAuthor?.avatar ? getInitials(commentAuthor?.name || '?') : ''}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author" onclick="openUserProfile('${commentAuthor.username}')">${commentAuthor?.name || 'Пользователь'}</span>
                            ${isCommentAuthor ? `<span class="comment-delete-btn" onclick="deleteComment('${c.id}')">✕</span>` : ''}
                        </div>
                        <div class="comment-text">${c.text}</div>
                        <div class="comment-footer">
                            <span class="comment-like-btn ${userLikedComment ? 'liked' : ''}" onclick="toggleCommentLike('${c.id}')">
                                ❤️ ${commentLikesCount}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        postDiv.innerHTML = `
            <div class="post-header">
                <div class="post-avatar ${author.avatar ? 'drawn-avatar' : ''}" ${author.avatar ? `style="background-image: url('${author.avatar}')"` : ''}>${!author.avatar ? getInitials(author.name) : ''}</div>
                <div class="post-author-info">
                    <div class="post-author">${author.name} ${author.verified ? '<span class="verified-badge">✓</span>' : ''}</div>
                    <div class="post-username">${formatUsername(author.username)}</div>
                </div>
                <div class="post-time">${formatDate(post.timestamp)}</div>
                <span class="delete-btn" onclick="deletePost('${post.id}')">✕</span>
            </div>
            <div class="post-content">${contentWithLinks.replace(/\n/g, '<br>')}</div>
            ${postDrawingHTML}
            <div class="post-actions">
                <span class="post-like-btn ${userLikedPost ? 'liked' : ''}" onclick="togglePostLike('${post.id}')">
                    ❤️ ${postLikesCount}
                </span>
                <span class="comment-toggle" onclick="toggleComments('${post.id}')">💬 ${postComments.length}</span>
            </div>
            <div class="comments-section" id="comments-${post.id}">
                ${commentsHTML}
                ${currentUser ? `
                    <div class="add-comment">
                        <input type="text" placeholder="Написать комментарий..." id="comment-input-${post.id}">
                        <button class="comment-submit" onclick="addComment('${post.id}')">→</button>
                    </div>
                ` : ''}
            </div>
        `;

        feed.appendChild(postDiv);
    });
}

// Глобальные функции
window.toggleComments = function(postId) {
    const comments = document.getElementById(`comments-${postId}`);
    if (comments.style.display === 'block') {
        comments.style.display = 'none';
    } else {
        comments.style.display = 'block';
    }
};

window.addComment = function(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    
    if (!text || !currentUser) return;

    const newComment = {
        id: Date.now().toString(),
        postId: postId,
        authorId: currentUser.id,
        text: text,
        timestamp: Date.now()
    };

    comments.push(newComment);
    saveComments();
    input.value = '';
    
    const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
    if (activeNav === 'profile') {
        updateUserPosts();
    } else {
        updateFeed();
    }
};

window.deleteComment = function(commentId) {
    if (confirm('Удалить комментарий?')) {
        comments = comments.filter(c => c.id !== commentId);
        commentLikes = commentLikes.filter(l => l.commentId !== commentId);
        saveComments();
        saveCommentLikes();
        
        const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
        if (activeNav === 'profile') {
            updateUserPosts();
        } else {
            updateFeed();
        }
    }
};

window.toggleCommentLike = function(commentId) {
    if (!currentUser) return;
    
    const existing = commentLikes.find(l => l.commentId === commentId && l.userId === currentUser.id);
    
    if (existing) {
        commentLikes = commentLikes.filter(l => l.id !== existing.id);
    } else {
        commentLikes.push({
            id: Date.now().toString(),
            commentId: commentId,
            userId: currentUser.id,
            timestamp: Date.now()
        });
    }
    
    saveCommentLikes();
    
    const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
    if (activeNav === 'profile') {
        updateUserPosts();
    } else {
        updateFeed();
    }
};

window.togglePostLike = function(postId) {
    if (!currentUser) return;
    
    const existing = postLikes.find(l => l.postId === postId && l.userId === currentUser.id);
    
    if (existing) {
        postLikes = postLikes.filter(l => l.id !== existing.id);
    } else {
        postLikes.push({
            id: Date.now().toString(),
            postId: postId,
            userId: currentUser.id,
            timestamp: Date.now()
        });
    }
    
    savePostLikes();
    
    // Находим конкретную кнопку и обновляем её
    const likeBtn = event.currentTarget;
    const count = postLikes.filter(l => l.postId === postId).length;
    likeBtn.innerHTML = `❤️ ${count}`;
    likeBtn.classList.toggle('liked', !existing);
    
    // Обновляем общее количество лайков в профиле, если это наш пост
    const post = posts.find(p => p.id === postId);
    if (post && post.authorId === currentUser.id) {
        const totalLikes = getTotalLikes(currentUser.id);
        document.getElementById('totalLikesCount').textContent = totalLikes;
    }
};

window.toggleFollow = function(userId) {
    const existing = subscriptions.find(s => s.followerId === currentUser.id && s.followingId === userId);
    
    if (existing) {
        subscriptions = subscriptions.filter(s => s.id !== existing.id);
        showNotification('Вы отписались');
    } else {
        subscriptions.push({
            id: Date.now().toString(),
            followerId: currentUser.id,
            followingId: userId
        });
        showNotification('Вы подписались');
    }
    
    saveSubscriptions();
    
    const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
    if (activeNav === 'profile') {
        updateUserPosts();
    } else {
        updateFeed();
    }
    
    // Обновляем счетчики в профиле
    const followers = subscriptions.filter(s => s.followingId === currentUser.id).length;
    document.getElementById('followersCount').textContent = followers;
    const following = subscriptions.filter(s => s.followerId === currentUser.id).length;
    document.getElementById('followingCount').textContent = following;
};

window.deletePost = function(postId) {
    if (confirm('Удалить пост?')) {
        posts = posts.filter(p => p.id !== postId);
        comments = comments.filter(c => c.postId !== postId);
        postLikes = postLikes.filter(l => l.postId !== postId);
        
        const commentIds = comments.filter(c => c.postId === postId).map(c => c.id);
        commentLikes = commentLikes.filter(l => !commentIds.includes(l.commentId));
        
        savePosts();
        saveComments();
        savePostLikes();
        saveCommentLikes();
        
        const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
        if (activeNav === 'profile') {
            updateUserPosts();
        } else {
            updateFeed();
        }
        updateUI();
    }
};

// Функция для открытия модального окна с хештегом
window.openHashtagModal = function(tag) {
    currentHashtag = tag;
    const hashtagPosts = posts.filter(p => p.hashtags && p.hashtags.includes(tag));
    
    document.getElementById('hashtagName').textContent = '#' + tag;
    document.getElementById('hashtagCount').textContent = hashtagPosts.length;
    
    const postsList = document.getElementById('hashtagPostsList');
    if (hashtagPosts.length === 0) {
        postsList.innerHTML = '<div class="empty-state">Нет постов с этим тегом</div>';
    } else {
        postsList.innerHTML = hashtagPosts.map(post => {
            const author = users.find(u => u.id === post.authorId);
            return `
                <div class="hashtag-post-item" onclick="goToPost('${post.id}')">
                    <div class="hashtag-post-author">${author.name}</div>
                    <div class="hashtag-post-content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('hashtagModal').style.display = 'flex';
};

window.goToPost = function(postId) {
    document.getElementById('hashtagModal').style.display = 'none';
    document.querySelector('[data-nav="feed"]').click();
    setTimeout(() => {
        const postElement = document.querySelector(`[onclick*="'${postId}'"]`)?.closest('.post');
        if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postElement.style.transform = 'scale(1.02)';
            setTimeout(() => postElement.style.transform = '', 500);
            
            // Открываем комментарии к посту
            const commentsSection = postElement.querySelector('.comments-section');
            if (commentsSection) {
                commentsSection.style.display = 'block';
            }
        }
    }, 100);
};

// Функции для просмотра подписчиков и подписок
window.showFollowers = function() {
    const followers = subscriptions.filter(s => s.followingId === currentUser.id);
    const followersList = document.getElementById('followersList');
    
    if (followers.length === 0) {
        followersList.innerHTML = '<div class="empty-state">У вас пока нет подписчиков</div>';
    } else {
        followersList.innerHTML = followers.map(sub => {
            const user = users.find(u => u.id === sub.followerId);
            if (!user) return '';
            return `
                <div class="user-item" onclick="openUserProfile('${user.username}')">
                    <div class="user-item-avatar ${user.avatar ? 'drawn-avatar' : ''}" ${user.avatar ? `style="background-image: url('${user.avatar}')"` : ''}>${!user.avatar ? getInitials(user.name) : ''}</div>
                    <div class="user-item-info">
                        <div class="user-item-name">${user.name}</div>
                        <div class="user-item-username">${formatUsername(user.username)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('followersModal').style.display = 'flex';
};

window.showFollowing = function() {
    const following = subscriptions.filter(s => s.followerId === currentUser.id);
    const followingList = document.getElementById('followingList');
    
    if (following.length === 0) {
        followingList.innerHTML = '<div class="empty-state">Вы ни на кого не подписаны</div>';
    } else {
        followingList.innerHTML = following.map(sub => {
            const user = users.find(u => u.id === sub.followingId);
            if (!user) return '';
            return `
                <div class="user-item" onclick="openUserProfile('${user.username}')">
                    <div class="user-item-avatar ${user.avatar ? 'drawn-avatar' : ''}" ${user.avatar ? `style="background-image: url('${user.avatar}')"` : ''}>${!user.avatar ? getInitials(user.name) : ''}</div>
                    <div class="user-item-info">
                        <div class="user-item-name">${user.name}</div>
                        <div class="user-item-username">${formatUsername(user.username)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('followingModal').style.display = 'flex';
};

window.openUserProfile = function(username) {
    const user = findUser(username);
    if (!user || user.id === currentUser.id) {
        if (user && user.id === currentUser.id) {
            // Если это свой профиль, переключаемся на вкладку профиля
            document.querySelector('[data-nav="profile"]').click();
        }
        return;
    }
    
    viewingUser = user;
    
    document.getElementById('otherProfileName').textContent = 'Профиль пользователя';
    document.getElementById('otherProfileDisplayName').textContent = user.name;
    document.getElementById('otherProfileUsername').textContent = formatUsername(user.username);
    document.getElementById('otherProfileBio').textContent = user.bio || 'Нет информации';
    
    const avatarEl = document.getElementById('otherProfileAvatar');
    if (user.avatar) {
        avatarEl.style.backgroundImage = `url('${user.avatar}')`;
        avatarEl.classList.add('drawn-avatar');
        avatarEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.classList.remove('drawn-avatar');
        avatarEl.textContent = getInitials(user.name);
    }
    
    const followers = subscriptions.filter(s => s.followingId === user.id).length;
    const following = subscriptions.filter(s => s.followerId === user.id).length;
    const totalLikes = getTotalLikes(user.id);
    
    document.getElementById('otherFollowersCount').textContent = followers;
    document.getElementById('otherFollowingCount').textContent = following;
    document.getElementById('otherTotalLikesCount').textContent = totalLikes;
    
    // Показываем посты пользователя
    const userPosts = posts.filter(p => p.authorId === user.id).sort((a, b) => b.timestamp - a.timestamp);
    const postsList = document.getElementById('otherUserPosts');
    
    if (userPosts.length === 0) {
        postsList.innerHTML = '<div class="empty-state">У пользователя пока нет постов</div>';
    } else {
        postsList.innerHTML = userPosts.map(post => {
            const postLikesCount = postLikes.filter(l => l.postId === post.id).length;
            return `
                <div class="profile-post-item" onclick="goToPost('${post.id}')">
                    <div class="profile-post-content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
                    <div class="profile-post-stats">
                        <span>❤️ ${postLikesCount}</span>
                        <span>💬 ${comments.filter(c => c.postId === post.id).length}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const isFollowing = subscriptions.some(s => s.followerId === currentUser.id && s.followingId === user.id);
    document.getElementById('followFromProfileBtn').textContent = isFollowing ? '✓ Отписаться' : '+ Подписаться';
    
    document.getElementById('userProfileModal').style.display = 'flex';
};

// Рисование аватара
let avatarCanvas, avatarCtx, avatarDrawing = false, avatarColor = '#000000', avatarBrushSize = 5;

window.openAvatarDrawing = function() {
    document.getElementById('avatarDrawingModal').style.display = 'flex';
    setTimeout(initAvatarCanvas, 100);
};

function initAvatarCanvas() {
    avatarCanvas = document.getElementById('avatarDrawingCanvas');
    avatarCtx = avatarCanvas.getContext('2d');
    
    // Устанавливаем белый фон
    avatarCtx.fillStyle = '#ffffff';
    avatarCtx.fillRect(0, 0, avatarCanvas.width, avatarCanvas.height);
    
    avatarCanvas.addEventListener('mousedown', startAvatarDrawing);
    avatarCanvas.addEventListener('mousemove', drawAvatar);
    avatarCanvas.addEventListener('mouseup', stopAvatarDrawing);
    avatarCanvas.addEventListener('mouseleave', stopAvatarDrawing);
    
    avatarCanvas.addEventListener('touchstart', startAvatarDrawing);
    avatarCanvas.addEventListener('touchmove', drawAvatar);
    avatarCanvas.addEventListener('touchend', stopAvatarDrawing);
}

function startAvatarDrawing(e) {
    e.preventDefault();
    avatarDrawing = true;
    const pos = getAvatarCanvasCoordinates(e);
    avatarCtx.beginPath();
    avatarCtx.moveTo(pos.x, pos.y);
}

function drawAvatar(e) {
    e.preventDefault();
    if (!avatarDrawing) return;
    
    const pos = getAvatarCanvasCoordinates(e);
    avatarCtx.lineTo(pos.x, pos.y);
    avatarCtx.strokeStyle = avatarColor;
    avatarCtx.lineWidth = avatarBrushSize;
    avatarCtx.lineCap = 'round';
    avatarCtx.stroke();
    avatarCtx.beginPath();
    avatarCtx.moveTo(pos.x, pos.y);
}

function stopAvatarDrawing() {
    avatarDrawing = false;
}

function getAvatarCanvasCoordinates(e) {
    const rect = avatarCanvas.getBoundingClientRect();
    const scaleX = avatarCanvas.width / rect.width;
    const scaleY = avatarCanvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function clearAvatarCanvas() {
    if (avatarCtx) {
        avatarCtx.fillStyle = '#ffffff';
        avatarCtx.fillRect(0, 0, avatarCanvas.width, avatarCanvas.height);
    }
}

// Рисование для поста
let postCanvas, postCtx, postDrawing = false, postColor = '#000000', postBrushSize = 5;

function initPostCanvas() {
    postCanvas = document.getElementById('postDrawingCanvas');
    if (!postCanvas) return;
    
    postCtx = postCanvas.getContext('2d');
    
    // Устанавливаем белый фон
    postCtx.fillStyle = '#ffffff';
    postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    
    postCanvas.addEventListener('mousedown', startPostDrawing);
    postCanvas.addEventListener('mousemove', drawPost);
    postCanvas.addEventListener('mouseup', stopPostDrawing);
    postCanvas.addEventListener('mouseleave', stopPostDrawing);
    
    postCanvas.addEventListener('touchstart', startPostDrawing);
    postCanvas.addEventListener('touchmove', drawPost);
    postCanvas.addEventListener('touchend', stopPostDrawing);
}

function startPostDrawing(e) {
    e.preventDefault();
    postDrawing = true;
    const pos = getPostCanvasCoordinates(e);
    postCtx.beginPath();
    postCtx.moveTo(pos.x, pos.y);
}

function drawPost(e) {
    e.preventDefault();
    if (!postDrawing) return;
    
    const pos = getPostCanvasCoordinates(e);
    postCtx.lineTo(pos.x, pos.y);
    postCtx.strokeStyle = postColor;
    postCtx.lineWidth = postBrushSize;
    postCtx.lineCap = 'round';
    postCtx.stroke();
    postCtx.beginPath();
    postCtx.moveTo(pos.x, pos.y);
}

function stopPostDrawing() {
    postDrawing = false;
}

function getPostCanvasCoordinates(e) {
    const rect = postCanvas.getBoundingClientRect();
    const scaleX = postCanvas.width / rect.width;
    const scaleY = postCanvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function clearPostCanvas() {
    if (postCtx) {
        postCtx.fillStyle = '#ffffff';
        postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    }
}

function updateBrushPreview() {
    const preview = document.getElementById('brushPreview');
    if (preview) {
        preview.style.background = postColor;
        preview.style.width = postBrushSize * 2 + 'px';
        preview.style.height = postBrushSize * 2 + 'px';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Void загружен');
    
    // Автоматически входим в демо-пользователя
    currentUser = users[0];
    
    // Обновляем UI
    document.getElementById('userInfo').style.display = 'flex';
    updateUI();

    // Получаем элементы
    const themeIcon = document.getElementById('themeIcon');
    const logoutBtn = document.getElementById('logoutBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const hashtagBtn = document.getElementById('hashtagBtn');
    const drawingBtn = document.getElementById('drawingBtn');
    const refreshFeedBtn = document.getElementById('refreshFeedBtn');
    const navItems = document.querySelectorAll('.nav-item');
    const clearPostDrawingBtn = document.getElementById('clearPostDrawingBtn');
    const newAvatarBtn = document.getElementById('newAvatarBtn');
    const deleteAvatarBtn = document.getElementById('deleteAvatarBtn');
    
    // Элементы для рисования аватара
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    const cancelAvatarBtn = document.getElementById('cancelAvatarBtn');
    const clearAvatarBtn = document.getElementById('clearAvatarBtn');
    
    // Элементы для хештегов
    const closeHashtagBtn = document.getElementById('closeHashtagBtn');
    
    // Элементы для профиля
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const followFromProfileBtn = document.getElementById('followFromProfileBtn');
    
    // Элементы для подписчиков и подписок
    const closeFollowersBtn = document.getElementById('closeFollowersBtn');
    const closeFollowingBtn = document.getElementById('closeFollowingBtn');

    // Нижняя навигация
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const nav = this.dataset.nav;
            
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            document.getElementById('profileSection').style.display = 'none';
            document.getElementById('createPostSection').style.display = 'none';
            document.getElementById('feedSection').style.display = 'none';
            document.getElementById('editProfileForm').style.display = 'none';
            document.getElementById('avatarActions').style.display = 'none';
            
            if (nav === 'feed') {
                document.getElementById('feedSection').style.display = 'block';
                updateFeed();
            } else if (nav === 'profile') {
                document.getElementById('profileSection').style.display = 'block';
                document.getElementById('createPostSection').style.display = 'block';
                updateUserPosts();
            }
        });
    });

    // Обновление ленты
    if (refreshFeedBtn) {
        refreshFeedBtn.onclick = function() {
            updateFeed();
            showNotification('Лента обновлена');
        };
    }

    // Редактирование профиля - ИСПРАВЛЕНО
    if (editProfileBtn) {
        editProfileBtn.onclick = function() {
            document.getElementById('profileSection').style.display = 'none';
            document.getElementById('createPostSection').style.display = 'none';
            document.getElementById('editProfileForm').style.display = 'block';
            document.getElementById('avatarActions').style.display = 'flex';
            
            document.getElementById('editName').value = currentUser.name;
            document.getElementById('editUsername').value = currentUser.username;
            document.getElementById('editBio').value = currentUser.bio || '';
        };
    }

    if (cancelEditBtn) {
        cancelEditBtn.onclick = function() {
            document.getElementById('editProfileForm').style.display = 'none';
            document.getElementById('profileSection').style.display = 'block';
            document.getElementById('createPostSection').style.display = 'block';
            document.getElementById('avatarActions').style.display = 'none';
        };
    }

    // Управление аватаркой
    if (newAvatarBtn) {
        newAvatarBtn.onclick = openAvatarDrawing;
    }

    if (deleteAvatarBtn) {
        deleteAvatarBtn.onclick = function() {
            if (confirm('Удалить аватар?')) {
                currentUser.avatar = null;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].avatar = null;
                    saveUsers();
                }
                updateUI();
                showNotification('Аватар удален');
            }
        };
    }

    // Рисование для поста
    if (drawingBtn) {
        drawingBtn.onclick = function() {
            const container = document.getElementById('drawingContainer');
            if (container.style.display === 'none' || container.style.display === '') {
                container.style.display = 'block';
                setTimeout(() => {
                    initPostCanvas();
                    // Устанавливаем цвета по умолчанию
                    document.querySelector('.color-btn[data-color="#000000"]').classList.add('active');
                    document.querySelector('.brush-size-btn[data-size="5"]').classList.add('active');
                    updateBrushPreview();
                }, 100);
            } else {
                container.style.display = 'none';
            }
        };
    }

    // Цвета для рисования поста
    document.querySelectorAll('.color-btn[data-color]').forEach(btn => {
        btn.addEventListener('click', function() {
            postColor = this.dataset.color;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateBrushPreview();
        });
    });

    // Размер кисти для поста
    document.querySelectorAll('.brush-size-btn[data-size]').forEach(btn => {
        btn.addEventListener('click', function() {
            postBrushSize = parseInt(this.dataset.size);
            document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateBrushPreview();
        });
    });

    // Очистка рисунка поста
    if (clearPostDrawingBtn) {
        clearPostDrawingBtn.onclick = clearPostCanvas;
    }

    // Цвета для аватара
    document.querySelectorAll('[data-avatar-color]').forEach(btn => {
        btn.addEventListener('click', function() {
            avatarColor = this.dataset.avatarColor;
            document.querySelectorAll('[data-avatar-color]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Размер кисти для аватара
    document.querySelectorAll('[data-avatar-size]').forEach(btn => {
        btn.addEventListener('click', function() {
            avatarBrushSize = parseInt(this.dataset.avatarSize);
            document.querySelectorAll('[data-avatar-size]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if (clearAvatarBtn) {
        clearAvatarBtn.onclick = clearAvatarCanvas;
    }

    // Сохранение аватара - ИСПРАВЛЕНО
    if (saveAvatarBtn) {
        saveAvatarBtn.onclick = function() {
            // Проверяем, не пустой ли рисунок
            const imageData = avatarCtx.getImageData(0, 0, avatarCanvas.width, avatarCanvas.height).data;
            let hasDrawing = false;
            for (let i = 0; i < imageData.length; i += 4) {
                // Проверяем, отличается ли пиксель от белого
                if (imageData[i] < 250 || imageData[i+1] < 250 || imageData[i+2] < 250) {
                    hasDrawing = true;
                    break;
                }
            }
            
            if (hasDrawing) {
                // Создаем изображение правильного размера для аватара
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 200;
                tempCanvas.height = 200;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Рисуем белый фон
                tempCtx.fillStyle = '#ffffff';
                tempCtx.fillRect(0, 0, 200, 200);
                
                // Рисуем рисунок с масштабированием
                tempCtx.drawImage(avatarCanvas, 0, 0, 200, 200);
                
                const avatarData = tempCanvas.toDataURL('image/png');
                currentUser.avatar = avatarData;
                
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].avatar = avatarData;
                    saveUsers();
                }
                
                document.getElementById('avatarDrawingModal').style.display = 'none';
                updateUI();
                showNotification('Аватар сохранен');
            } else {
                showNotification('Нарисуйте что-нибудь');
            }
        };
    }

    if (cancelAvatarBtn) {
        cancelAvatarBtn.onclick = function() {
            document.getElementById('avatarDrawingModal').style.display = 'none';
        };
    }

    // Закрытие модальных окон
    if (closeHashtagBtn) {
        closeHashtagBtn.onclick = function() {
            document.getElementById('hashtagModal').style.display = 'none';
        };
    }

    if (closeProfileBtn) {
        closeProfileBtn.onclick = function() {
            document.getElementById('userProfileModal').style.display = 'none';
        };
    }

    if (closeFollowersBtn) {
        closeFollowersBtn.onclick = function() {
            document.getElementById('followersModal').style.display = 'none';
        };
    }

    if (closeFollowingBtn) {
        closeFollowingBtn.onclick = function() {
            document.getElementById('followingModal').style.display = 'none';
        };
    }

    if (followFromProfileBtn) {
        followFromProfileBtn.onclick = function() {
            if (viewingUser) {
                const existing = subscriptions.find(s => s.followerId === currentUser.id && s.followingId === viewingUser.id);
                
                if (existing) {
                    subscriptions = subscriptions.filter(s => s.id !== existing.id);
                    this.textContent = '+ Подписаться';
                    showNotification('Вы отписались');
                } else {
                    subscriptions.push({
                        id: Date.now().toString(),
                        followerId: currentUser.id,
                        followingId: viewingUser.id
                    });
                    this.textContent = '✓ Отписаться';
                    showNotification('Вы подписались');
                }
                
                saveSubscriptions();
                
                const followers = subscriptions.filter(s => s.followingId === viewingUser.id).length;
                document.getElementById('otherFollowersCount').textContent = followers;
                const following = subscriptions.filter(s => s.followerId === viewingUser.id).length;
                document.getElementById('otherFollowingCount').textContent = following;
            }
        };
    }

    // Закрытие модальных окон по клику вне
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Добавление хештега
    if (hashtagBtn) {
        hashtagBtn.onclick = function() {
            const textarea = document.getElementById('postContent');
            textarea.value += ' #';
            textarea.focus();
        };
    }

    // Выход
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            if (confirm('Выйти из аккаунта?')) {
                localStorage.clear();
                location.reload();
            }
        };
    }

    // Создание поста
    if (createPostBtn) {
        createPostBtn.onclick = function() {
            const content = document.getElementById('postContent').value.trim();
            
            let drawingData = null;
            if (postCanvas) {
                // Проверяем, не пустой ли рисунок
                const imageData = postCtx.getImageData(0, 0, postCanvas.width, postCanvas.height).data;
                let hasDrawing = false;
                for (let i = 0; i < imageData.length; i += 4) {
                    // Проверяем, отличается ли пиксель от белого
                    if (imageData[i] < 250 || imageData[i+1] < 250 || imageData[i+2] < 250) {
                        hasDrawing = true;
                        break;
                    }
                }
                
                if (hasDrawing) {
                    drawingData = postCanvas.toDataURL('image/png');
                }
            }
            
            if (!content && !drawingData) {
                alert('Добавьте текст или рисунок');
                return;
            }

            const hashtags = extractHashtags(content);
            const mentions = extractMentions(content);

            const newPost = {
                id: Date.now().toString(),
                authorId: currentUser.id,
                content: content || '',
                drawing: drawingData,
                hashtags: hashtags,
                mentions: mentions,
                timestamp: Date.now()
            };

            posts.push(newPost);
            savePosts();
            
            document.getElementById('postContent').value = '';
            document.getElementById('drawingContainer').style.display = 'none';
            clearPostCanvas();
            
            updateUserPosts();
            updateUI();
            showNotification('Пост опубликован');
        };
    }

    // Сохранение профиля
    if (saveProfileBtn) {
        saveProfileBtn.onclick = function() {
            const newName = document.getElementById('editName').value.trim();
            const newUsername = document.getElementById('editUsername').value.trim();
            const newBio = document.getElementById('editBio').value.trim();

            if (!newName || !newUsername) {
                alert('Заполните имя и юзернейм');
                return;
            }

            if (!isValidUsername(newUsername)) {
                alert('Юзернейм должен содержать только латинские буквы, цифры и нижнее подчеркивание (от 5 до 50 символов)');
                return;
            }

            const cleanUsername = newUsername.toLowerCase();
            const existingUser = users.find(u => u.username === cleanUsername && u.id !== currentUser.id);
            
            if (existingUser) {
                alert('Юзернейм занят');
                return;
            }

            currentUser.name = newName;
            currentUser.username = cleanUsername;
            currentUser.bio = newBio;

            const index = users.findIndex(u => u.id === currentUser.id);
            if (index !== -1) users[index] = currentUser;
            saveUsers();

            document.getElementById('editProfileForm').style.display = 'none';
            document.getElementById('profileSection').style.display = 'block';
            document.getElementById('createPostSection').style.display = 'block';
            document.getElementById('avatarActions').style.display = 'none';
            updateUI();
            showNotification('Профиль обновлен');
        };
    }

    // Тема
    if (themeIcon) {
        themeIcon.onclick = function() {
            document.body.classList.toggle('light-theme');
            this.textContent = document.body.classList.contains('light-theme') ? '☀️' : '🌙';
            localStorage.setItem('void_theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            
            // Обновляем стили
            const activeNav = document.querySelector('.nav-item.active')?.dataset.nav;
            if (activeNav === 'profile') {
                updateUserPosts();
            } else {
                updateFeed();
            }
        };
    }

    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('void_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
    }

    // По умолчанию показываем ленту
    document.querySelector('[data-nav="feed"]').click();
});