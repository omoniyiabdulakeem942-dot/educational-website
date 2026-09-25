const postForm = document.getElementById('postForm');
const postsContainer = document.getElementById('postsContainer');
const notificationBanner = document.getElementById('notificationBanner');
const postCount = document.getElementById('postCount');
const loginModal = document.getElementById('loginModal');
const contactModal = document.getElementById('contactModal');
const filterButtons = document.querySelectorAll('[data-filter]');
const themeToggle = document.getElementById('themeToggle');

const notices = [];
let activeFilter = 'All';
let notificationTimeout;
let contactTarget = '';

function setTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
    themeToggle.querySelector('.theme-label').textContent = isDark ? 'Light mode' : 'Dark mode';
}

const savedTheme = localStorage.getItem('study-circle-theme');
setTheme(savedTheme === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('study-circle-theme', nextTheme);
});

document.querySelectorAll('[data-scroll-to-form]').forEach((button) => {
    button.addEventListener('click', () => {
        document.getElementById('share-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('userName').focus({ preventScroll: true });
    });
});

function showNotification(message) {
    notificationBanner.textContent = message;
    notificationBanner.classList.add('show');
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => notificationBanner.classList.remove('show'), 4000);
}

function createBadge(text, className) {
    const badge = document.createElement('span');
    badge.className = `notice-badge ${className}`;
    badge.textContent = text;
    return badge;
}

function createNewPostCard(notice) {
    const postCard = document.createElement('article');
    postCard.className = 'post-card';
    postCard.dataset.category = notice.category;

    const header = document.createElement('div');
    header.className = 'post-card-header';
    const subjectTitle = document.createElement('h3');
    subjectTitle.textContent = notice.subject;
    const bookmarkButton = document.createElement('button');
    bookmarkButton.className = 'bookmark-button';
    bookmarkButton.type = 'button';
    bookmarkButton.setAttribute('aria-label', `Bookmark ${notice.subject}`);
    bookmarkButton.setAttribute('aria-pressed', 'false');
    bookmarkButton.textContent = '☆';
    bookmarkButton.addEventListener('click', () => {
        const saved = bookmarkButton.getAttribute('aria-pressed') === 'true';
        bookmarkButton.setAttribute('aria-pressed', String(!saved));
        bookmarkButton.textContent = saved ? '☆' : '★';
        bookmarkButton.classList.toggle('is-saved', !saved);
        showNotification(saved ? 'Notice removed from bookmarks.' : 'Notice saved to your bookmarks.');
    });
    header.append(subjectTitle, bookmarkButton);

    const metadata = document.createElement('div');
    metadata.className = 'notice-metadata';
    metadata.append(createBadge(notice.category, 'category-badge'), createBadge(notice.sessionType, 'session-badge'), createBadge(notice.availability, 'availability-badge'));

    const messageText = document.createElement('p');
    messageText.className = 'post-message';
    messageText.textContent = notice.message;
    const footer = document.createElement('div');
    footer.className = 'post-card-footer';
    const authorText = document.createElement('p');
    authorText.className = 'author';
    authorText.textContent = `Posted by ${notice.name}`;
    const connectButton = document.createElement('button');
    connectButton.className = 'connect-button';
    connectButton.type = 'button';
    connectButton.textContent = 'Connect ↗';
    connectButton.addEventListener('click', () => openContact(notice.name));
    footer.append(authorText, connectButton);

    postCard.append(header, metadata, messageText, footer);
    return postCard;
}

function renderNotices() {
    const visibleNotices = activeFilter === 'All' ? notices : notices.filter((notice) => notice.category === activeFilter);
    postsContainer.replaceChildren();
    if (!visibleNotices.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<span aria-hidden="true">✦</span><p>No notices in this category yet.<br>Start the conversation from the left.</p>';
        postsContainer.append(emptyState);
    } else {
        visibleNotices.forEach((notice) => postsContainer.append(createNewPostCard(notice)));
    }
    postCount.textContent = notices.length;
    document.querySelector('[data-filter="All"] span').textContent = notices.length;
}

postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(postForm);
    const notice = {
        name: formData.get('userName'),
        subject: formData.get('subject'),
        category: formData.get('category'),
        sessionType: formData.get('sessionType'),
        availability: formData.get('availability'),
        message: formData.get('message')
    };
    notices.unshift(notice);
    renderNotices();
    showNotification(`Notice published in ${notice.category}.`);
    postForm.reset();
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((item) => {
            const isActive = item === button;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', String(isActive));
        });
        renderNotices();
    });
});

function setModalState(modal, isOpen) {
    modal.classList.toggle('is-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('modal-open', isOpen);
}

function setLoginState(isOpen) {
    setModalState(loginModal, isOpen);
    if (isOpen) document.getElementById('loginEmail').focus();
}

function openContact(name) {
    contactTarget = name;
    document.getElementById('contactName').textContent = name + '.';
    setModalState(contactModal, true);
    document.getElementById('contactMessage').focus();
}

document.querySelectorAll('[data-open-login]').forEach((button) => button.addEventListener('click', () => setLoginState(true)));
document.querySelectorAll('[data-close-login]').forEach((button) => button.addEventListener('click', () => setLoginState(false)));
document.querySelectorAll('[data-close-contact]').forEach((button) => button.addEventListener('click', () => setModalState(contactModal, false)));
document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (loginModal.classList.contains('is-open')) setLoginState(false);
    if (contactModal.classList.contains('is-open')) setModalState(contactModal, false);
});

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    setLoginState(false);
    showNotification('Welcome back to your study circle.');
});

document.getElementById('contactForm').addEventListener('submit', (event) => {
    event.preventDefault();
    setModalState(contactModal, false);
    showNotification(`Reply prepared for ${contactTarget}.`);
    event.target.reset();
});

renderNotices();
