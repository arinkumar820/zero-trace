// Security Chat App - Local Version
let chatApp = {
    // Application state
    contacts: [
        {
            id: 1,
            name: "Sarah Johnson",
            phone: "+1 (555) 234-5678",
            avatar: "SJ",
            lastMessage: "Hey! How are you doing today?",
            timestamp: "2:34 PM",
            unread: 2,
            online: true,
            messages: [
                {id: 1, sender: "Sarah Johnson", content: "Hey there! 👋", time: "2:30 PM", type: "received", status: "read"},
                {id: 2, sender: "me", content: "Hi Sarah! How are you doing?", time: "2:31 PM", type: "sent", status: "read"},
                {id: 3, sender: "Sarah Johnson", content: "I'm doing great, thanks! Just got back from a morning run.", time: "2:32 PM", type: "received", status: "read"},
                {id: 4, sender: "me", content: "That sounds refreshing! I'm working on some projects.", time: "2:33 PM", type: "sent", status: "read"},
                {id: 5, sender: "Sarah Johnson", content: "Hey! How are you doing today?", time: "2:34 PM", type: "received", status: "delivered"}
            ]
        },
        {
            id: 2,
            name: "David Kim",
            phone: "+1 (555) 345-6789",
            avatar: "DK",
            lastMessage: "Thanks for the help!",
            timestamp: "11:22 AM",
            unread: 0,
            online: false,
            messages: [
                {id: 1, sender: "David Kim", content: "Hey, could you help me with something?", time: "10:30 AM", type: "received", status: "read"},
                {id: 2, sender: "me", content: "Sure! What do you need help with?", time: "10:31 AM", type: "sent", status: "read"},
                {id: 3, sender: "David Kim", content: "I need some advice on the new project.", time: "10:32 AM", type: "received", status: "read"},
                {id: 4, sender: "me", content: "I'd be happy to help! Let's discuss it.", time: "11:20 AM", type: "sent", status: "read"},
                {id: 5, sender: "David Kim", content: "Thanks for the help!", time: "11:22 AM", type: "received", status: "read"}
            ]
        },
        {
            id: 3,
            name: "Emma Wilson",
            phone: "+1 (555) 456-7890",
            avatar: "EW",
            lastMessage: "See you later!",
            timestamp: "Yesterday",
            unread: 1,
            online: true,
            messages: [
                {id: 1, sender: "Emma Wilson", content: "Want to grab coffee tomorrow?", time: "4:20 PM", type: "received", status: "read"},
                {id: 2, sender: "me", content: "Absolutely! What time works for you?", time: "4:22 PM", type: "sent", status: "read"},
                {id: 3, sender: "Emma Wilson", content: "How about 3 PM at the usual place?", time: "4:25 PM", type: "received", status: "read"},
                {id: 4, sender: "me", content: "Perfect! See you then", time: "4:26 PM", type: "sent", status: "read"},
                {id: 5, sender: "Emma Wilson", content: "See you later!", time: "Yesterday", type: "received", status: "delivered"}
            ]
        }
    ],
    
    currentChat: null,
    filteredContacts: [],
    nextContactId: 4,
    nextMessageId: 100,

    // Initialize the app
    init() {
        console.log('Initializing chat app...');
        
        // Load contacts from localStorage if available
        this.loadFromLocalStorage();
        
        this.filteredContacts = [...this.contacts];
        this.bindAllEvents();
        this.renderContactList();
        this.showEmptyState();
        console.log('Chat app initialized successfully');
    },

    // Load data from localStorage
    loadFromLocalStorage() {
        try {
            const savedContacts = localStorage.getItem('chatContacts');
            if (savedContacts) {
                this.contacts = JSON.parse(savedContacts);
                this.nextContactId = Math.max(...this.contacts.map(c => c.id)) + 1;
            }
        } catch (error) {
            console.log('No saved contacts found, using default');
        }
    },

    // Save data to localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('chatContacts', JSON.stringify(this.contacts));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    // Bind all event listeners
    bindAllEvents() {
        // Contact list clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.contact-item')) {
                const contactElement = e.target.closest('.contact-item');
                const contactId = parseInt(contactElement.dataset.contactId);
                console.log('Contact clicked, ID:', contactId);
                this.selectContact(contactId);
            }
        });

        // Add contact button
        const addBtn = document.getElementById('addContactBtn');
        if (addBtn) {
            addBtn.onclick = () => this.openAddContactModal();
        }

        // Send message button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.onclick = () => this.sendMessage();
        }

        // Message input enter key
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            };
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.oninput = (e) => this.handleSearch(e.target.value);
        }

        // Modal close buttons
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.onclick = () => this.closeAddContactModal();
        }

        const cancelAdd = document.getElementById('cancelAdd');
        if (cancelAdd) {
            cancelAdd.onclick = () => this.closeAddContactModal();
        }

        const saveContact = document.getElementById('saveContact');
        if (saveContact) {
            saveContact.onclick = () => this.saveNewContact();
        }

        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.onclick = () => this.toggleSidebar();
        }

        const mobileBackdrop = document.getElementById('mobileBackdrop');
        if (mobileBackdrop) {
            mobileBackdrop.onclick = () => this.closeSidebar();
        }

        // Escape key
        document.onkeydown = (e) => {
            if (e.key === 'Escape') {
                this.closeAddContactModal();
            }
        };
    },

    // Render the contact list
    renderContactList() {
        console.log('Rendering contact list...');
        const contactList = document.getElementById('contactList');
        if (!contactList) return;

        contactList.innerHTML = '';

        this.filteredContacts.forEach((contact, index) => {
            const contactDiv = document.createElement('div');
            contactDiv.className = `contact-item ${this.currentChat && this.currentChat.id === contact.id ? 'active' : ''}`;
            contactDiv.dataset.contactId = contact.id;

            const avatarClass = `avatar-${(index % 8) + 1}`;
            const onlineStatus = contact.online ? '<div class="online-status"></div>' : '';
            const unreadBadge = contact.unread > 0 ? `<div class="unread-count">${contact.unread}</div>` : '';

            contactDiv.innerHTML = `
                <div class="contact-avatar ${avatarClass}" style="position: relative;">
                    ${contact.avatar}
                    ${onlineStatus}
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-last-message">${contact.lastMessage}</div>
                </div>
                <div class="contact-meta">
                    <div class="contact-time">${contact.timestamp}</div>
                    ${unreadBadge}
                </div>
            `;

            contactList.appendChild(contactDiv);
        });
        console.log(`Rendered ${this.filteredContacts.length} contacts`);
    },

    // Select a contact and load their chat
    selectContact(contactId) {
        console.log('Selecting contact with ID:', contactId);
        
        // Find the contact
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact) {
            console.error('Contact not found:', contactId);
            return;
        }

        // Set current chat
        this.currentChat = contact;
        contact.unread = 0; // Clear unread count

        console.log('Selected contact:', contact.name);

        // Update UI
        this.renderContactList(); // Re-render to show active state
        this.updateChatHeader();
        this.renderMessages();
        this.showMessageInput();

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    },

    // Update the chat header
    updateChatHeader() {
        if (!this.currentChat) return;

        console.log('Updating chat header for:', this.currentChat.name);

        const chatName = document.getElementById('chatName');
        const chatStatus = document.getElementById('chatStatus');
        const chatAvatar = document.getElementById('chatAvatar');

        if (chatName) chatName.textContent = this.currentChat.name;
        if (chatStatus) chatStatus.textContent = this.currentChat.online ? 'online' : 'last seen recently';
        if (chatAvatar) {
            chatAvatar.textContent = this.currentChat.avatar;
            const contactIndex = this.contacts.findIndex(c => c.id === this.currentChat.id);
            chatAvatar.className = `chat-avatar avatar-${(contactIndex % 8) + 1}`;
        }
    },

    // Render messages for current chat
    renderMessages() {
        console.log('Rendering messages...');
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer || !this.currentChat) return;

        messagesContainer.innerHTML = '';

        this.currentChat.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type}`;

            const statusIcon = message.type === 'sent' ? 
                `<span class="message-status ${message.status === 'read' ? 'read' : ''}">${message.status === 'read' ? '✓✓' : '✓'}</span>` : '';

            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">
                        ${message.time}
                        ${statusIcon}
                    </div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);

        console.log(`Rendered ${this.currentChat.messages.length} messages`);
    },

    // Show message input area
    showMessageInput() {
        const messageInputArea = document.getElementById('messageInputArea');
        if (messageInputArea) {
            messageInputArea.style.display = 'block';
        }
    },

    // Show empty state
    showEmptyState() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <h3>Welcome to Security Chat</h3>
                    <p>Select a contact to start messaging or add a new contact</p>
                </div>
            `;
        }

        const messageInputArea = document.getElementById('messageInputArea');
        if (messageInputArea) {
            messageInputArea.style.display = 'none';
        }
    },

    // Send a message
    sendMessage() {
        console.log('Sending message...');
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.currentChat) {
            console.log('No input or chat available');
            return;
        }

        const content = messageInput.value.trim();
        if (!content) {
            console.log('No message content');
            return;
        }

        // Create new message
        const newMessage = {
            id: this.nextMessageId++,
            sender: 'me',
            content: content,
            time: this.getCurrentTime(),
            type: 'sent',
            status: 'sent'
        };

        // Add to current chat
        this.currentChat.messages.push(newMessage);
        this.currentChat.lastMessage = content;
        this.currentChat.timestamp = newMessage.time;

        // Clear input
        messageInput.value = '';

        // Update UI
        this.renderMessages();
        this.renderContactList();

        // Save to localStorage
        this.saveToLocalStorage();

        console.log('Message sent:', content);

        // Simulate delivery status updates
        setTimeout(() => {
            newMessage.status = 'delivered';
            this.renderMessages();
        }, 1000);

        setTimeout(() => {
            newMessage.status = 'read';
            this.renderMessages();
        }, 2500);

        // Simulate response
        if (Math.random() > 0.3) {
            this.simulateResponse();
        }
    },

    // Simulate automated response
    simulateResponse() {
        const responses = [
            "Thanks for your message! 😊",
            "That sounds great!",
            "I'll get back to you soon.",
            "Interesting!",
            "Absolutely! 👍",
            "I agree with you.",
            "Sure thing!",
            "Perfect! 🎉"
        ];

        setTimeout(() => {
            const response = {
                id: this.nextMessageId++,
                sender: this.currentChat.name,
                content: responses[Math.floor(Math.random() * responses.length)],
                time: this.getCurrentTime(),
                type: 'received',
                status: 'delivered'
            };

            this.currentChat.messages.push(response);
            this.currentChat.lastMessage = response.content;
            this.currentChat.timestamp = response.time;

            this.renderMessages();
            this.renderContactList();

            // Save to localStorage
            this.saveToLocalStorage();
        }, 1500 + Math.random() * 3000);
    },

    // Handle search
    handleSearch(query) {
        console.log('Searching for:', query);
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            this.filteredContacts = [...this.contacts];
        } else {
            this.filteredContacts = this.contacts.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm) ||
                contact.phone.includes(searchTerm) ||
                contact.lastMessage.toLowerCase().includes(searchTerm)
            );
        }

        console.log(`Search results: ${this.filteredContacts.length} contacts`);
        this.renderContactList();
    },

    // Get current time formatted
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    },

    // Modal functions
    openAddContactModal() {
        console.log('Opening add contact modal');
        const modal = document.getElementById('addContactModal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Clear and focus
            const nameInput = document.getElementById('contactName');
            const phoneInput = document.getElementById('contactPhone');
            if (nameInput) {
                nameInput.value = '';
                setTimeout(() => nameInput.focus(), 100);
            }
            if (phoneInput) phoneInput.value = '';
        }
    },

    closeAddContactModal() {
        const modal = document.getElementById('addContactModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    saveNewContact() {
        console.log('Saving new contact');
        const nameInput = document.getElementById('contactName');
        const phoneInput = document.getElementById('contactPhone');

        if (!nameInput || !phoneInput) return;

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name) {
            this.showNotification('Please enter a name', 'error');
            return;
        }

        if (!phone) {
            this.showNotification('Please enter a phone number', 'error');
            return;
        }

        // Check for duplicates
        const exists = this.contacts.find(c => c.phone === phone);
        if (exists) {
            this.showNotification('Contact with this phone already exists', 'error');
            return;
        }

        // Create new contact
        const newContact = {
            id: this.nextContactId++,
            name: name,
            phone: phone,
            avatar: this.generateAvatar(name),
            lastMessage: 'No messages yet',
            timestamp: 'Now',
            unread: 0,
            online: Math.random() > 0.5,
            messages: []
        };

        // Add to contacts
        this.contacts.push(newContact);
        this.filteredContacts = [...this.contacts];

        // Save to localStorage
        this.saveToLocalStorage();

        // Update UI
        this.renderContactList();
        this.closeAddContactModal();
        this.showNotification('Contact added successfully!', 'success');

        // Auto-select new contact
        this.selectContact(newContact.id);
    },

    generateAvatar(name) {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    // Mobile sidebar functions
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobileBackdrop');
        
        if (sidebar && sidebar.classList.contains('open')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },

    openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobileBackdrop');
        
        if (sidebar) sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('active');
    },

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('mobileBackdrop');
        
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
    },

    // Show notifications
    showNotification(message, type = 'success') {
        console.log('Showing notification:', message);
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (!notification || !notificationText) return;

        notificationText.textContent = message;
        notification.style.backgroundColor = type === 'error' ? 'var(--color-error)' : 'var(--color-success)';
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => chatApp.init());
} else {
    chatApp.init();
}