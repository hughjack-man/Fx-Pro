// Notification System for Coinnex Platform
// Handles notification bell, dropdown, unread counts, and polling

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.pollingInterval = null;
    this.dropdownOpen = false;
    this.initialized = false;
  }

  // Initialize the notification system
  init() {
    if (this.initialized) return;
    
    this.renderNotificationButton();
    this.attachEventListeners();
    this.startPolling();
    this.initialized = true;
  }

  // Render the notification button in the header
  renderNotificationButton() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;

    // Check if notification button already exists
    if (document.querySelector('.notification-dropdown')) return;

    const notificationHTML = `
      <div class="notification-dropdown">
        <button class="notification-btn" id="notificationBtn" title="Notifications">
          <i class="fas fa-bell"></i>
          <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
        </button>
        <div class="notification-dropdown-menu" id="notificationDropdown">
          <div class="notification-header">
            <h3>Notifications</h3>
            <button class="btn btn-sm btn-secondary" id="markAllReadBtn" style="display: none;">
              Mark all read
            </button>
          </div>
          <div class="notification-list" id="notificationList">
            <div class="notification-empty">
              <i class="fas fa-bell-slash"></i>
              <p>No notifications yet</p>
            </div>
          </div>
          <div class="notification-footer">
            <a href="#" id="viewAllNotifications">View all notifications</a>
          </div>
        </div>
      </div>
    `;

    // Insert before the first header button
    const firstBtn = headerRight.querySelector('.header-btn');
    if (firstBtn) {
      firstBtn.insertAdjacentHTML('beforebegin', notificationHTML);
    } else {
      headerRight.insertAdjacentHTML('afterbegin', notificationHTML);
    }
  }

  // Attach event listeners
  attachEventListeners() {
    // Notification button click
    document.addEventListener('click', (e) => {
      const notificationBtn = e.target.closest('#notificationBtn');
      const notificationDropdown = document.getElementById('notificationDropdown');
      
      if (notificationBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      } else if (notificationDropdown && !notificationDropdown.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Mark all as read
    document.addEventListener('click', (e) => {
      if (e.target.closest('#markAllReadBtn')) {
        e.preventDefault();
        this.markAllAsRead();
      }
    });

    // View all notifications
    document.addEventListener('click', (e) => {
      if (e.target.closest('#viewAllNotifications')) {
        e.preventDefault();
        this.showAllNotificationsModal();
      }
    });

    // Individual notification click
    document.addEventListener('click', (e) => {
      const notificationItem = e.target.closest('.notification-item');
      if (notificationItem) {
        const notificationId = notificationItem.dataset.id;
        if (notificationItem.classList.contains('unread')) {
          this.markAsRead(notificationId);
        }
        // Handle notification action based on type
        this.handleNotificationClick(notificationItem.dataset.type, notificationItem.dataset.data);
      }
    });
  }

  // Toggle dropdown
  toggleDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    this.dropdownOpen = !this.dropdownOpen;
    dropdown.classList.toggle('show', this.dropdownOpen);

    if (this.dropdownOpen) {
      this.loadNotifications();
    }
  }

  // Close dropdown
  closeDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    this.dropdownOpen = false;
    dropdown.classList.remove('show');
  }

  // Start polling for new notifications
  startPolling() {
    // Initial fetch
    this.fetchUnreadCount();

    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.fetchUnreadCount();
    }, 10000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Fetch unread count
  async fetchUnreadCount() {
    try {
      const data = await API.notification.getUnreadCount();
      this.unreadCount = data.count || 0;
      this.updateBadge();
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }

  // Update badge display
  updateBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  // Load notifications
  async loadNotifications() {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;

    try {
      listContainer.innerHTML = `
        <div class="loading" style="padding: 2rem;">
          <div class="spinner" style="width: 30px; height: 30px;"></div>
        </div>
      `;

      const data = await API.notification.getAll(1, 10);
      this.notifications = data.notifications || [];
      this.renderNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
      listContainer.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load notifications</p>
        </div>
      `;
    }
  }

  // Render notifications in dropdown
  renderNotifications() {
    const listContainer = document.getElementById('notificationList');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (!listContainer) return;

    if (this.notifications.length === 0) {
      listContainer.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      `;
      if (markAllReadBtn) markAllReadBtn.style.display = 'none';
      return;
    }

    if (markAllReadBtn) {
      const hasUnread = this.notifications.some(n => !n.isRead);
      markAllReadBtn.style.display = hasUnread ? 'block' : 'none';
    }

    listContainer.innerHTML = this.notifications.map(notification => `
      <div class="notification-item ${notification.isRead ? '' : 'unread'}" 
           data-id="${notification._id}" 
           data-type="${notification.type}"
           data-data='${JSON.stringify(notification.data || {})}'>
        <div class="notification-icon ${notification.type}">
          <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">${this.escapeHtml(notification.title)}</div>
          <div class="notification-message">${this.escapeHtml(notification.message)}</div>
        </div>
        <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
      </div>
    `).join('');
  }

  // Get icon for notification type
  getNotificationIcon(type) {
    const icons = {
      deposit: 'fa-arrow-down',
      withdrawal: 'fa-arrow-up',
      investment: 'fa-chart-line',
      loan: 'fa-hand-holding-usd',
      kyc: 'fa-id-card',
      message: 'fa-envelope',
      system: 'fa-info-circle',
      broadcast: 'fa-bullhorn',
      referral: 'fa-users'
    };
    return icons[type] || 'fa-bell';
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await API.notification.markAsRead(notificationId);
      
      // Update local state
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await API.notification.markAllAsRead();
      
      // Update local state
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.updateBadge();
      this.renderNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Handle notification click
  handleNotificationClick(type, dataStr) {
    let data = {};
    try {
      data = JSON.parse(dataStr);
    } catch (e) {}

    // Navigate based on notification type
    const routes = {
      deposit: 'transactions.html',
      withdrawal: 'transactions.html',
      investment: 'invest.html',
      loan: 'loans.html',
      kyc: 'kyc.html',
      message: 'support.html',
      referral: 'referrals.html'
    };

    if (routes[type]) {
      window.location.href = routes[type];
    }
  }

  // Show all notifications modal
  showAllNotificationsModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'notificationsModal';
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">All Notifications</h3>
          <button class="modal-close" onclick="notificationSystem.closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
          <div id="allNotificationsList">
            <div class="loading">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.loadAllNotifications();
  }

  // Load all notifications for modal
  async loadAllNotifications() {
    const container = document.getElementById('allNotificationsList');
    if (!container) return;

    try {
      const data = await API.notification.getAll(1, 50);
      const notifications = data.notifications || [];

      if (notifications.length === 0) {
        container.innerHTML = `
          <div class="notification-empty">
            <i class="fas fa-bell-slash"></i>
            <p>No notifications yet</p>
          </div>
        `;
        return;
      }

      container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.isRead ? '' : 'unread'}" 
             data-id="${notification._id}" 
             data-type="${notification.type}"
             style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="notification-icon ${notification.type}">
            <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">${this.escapeHtml(notification.title)}</div>
            <div class="notification-message">${this.escapeHtml(notification.message)}</div>
            <div style="font-size: 0.75rem; color: var(--gray); margin-top: 0.25rem;">
              ${API.utils.formatDateTime(notification.createdAt)}
            </div>
          </div>
        </div>
      `).join('');

      // Add click handlers
      container.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
          const notificationId = item.dataset.id;
          if (item.classList.contains('unread')) {
            this.markAsRead(notificationId);
          }
          this.handleNotificationClick(item.dataset.type, item.dataset.data);
        });
      });
    } catch (error) {
      container.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load notifications</p>
        </div>
      `;
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
      modal.remove();
    }
  }

  // Format relative time
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return API.utils.formatDate(dateString);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const notificationSystem = new NotificationSystem();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on authenticated pages
  if (API.utils.isAuthenticated()) {
    notificationSystem.init();
  }
});


const toggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  root.classList.add('light-mode');
  toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
} else if (savedTheme === 'dark') {
  root.classList.remove('light-mode');
}

// Toggle click
toggleBtn.addEventListener('click', () => {
  root.classList.toggle('light-mode');

  if (root.classList.contains('light-mode')) {
    localStorage.setItem('theme', 'light');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem('theme', 'dark');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

