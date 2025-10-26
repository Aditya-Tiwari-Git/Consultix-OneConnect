let currentRole = 'user';

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
});

function setupAuth() {
    if (getCurrentUser()) {
        const user = getCurrentUser();
        navigateTo(null, user.role);
        return;
    }

    setupAuthTabs();
    setupLoginPage();
    setupRegistrationPage();
    setupMFAModals();
}

function setupAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            if (tabName === 'login') {
                document.getElementById('login-tab').classList.add('active');
            } else {
                document.getElementById('register-tab').classList.add('active');
            }
        });
    });
}

function setupLoginPage() {
    const roleButtons = document.querySelectorAll('#login-tab .role-btn');
    const loginForm = document.getElementById('login-form');
    const loginId = document.getElementById('login-id');
    const idLabel = document.getElementById('id-label');
    const hint = document.querySelector('#login-tab .hint');

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#login-tab .role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.dataset.role;

            switch(currentRole) {
                case 'user':
                    idLabel.textContent = 'Customer ID';
                    loginId.placeholder = 'Enter your Customer ID';
                    hint.textContent = 'Example: CUST12345';
                    break;
                case 'support':
                    idLabel.textContent = 'Employee ID';
                    loginId.placeholder = 'Enter your Employee ID';
                    hint.textContent = 'Example: EMP54321';
                    break;
                case 'vendor':
                    idLabel.textContent = 'Vendor ID';
                    loginId.placeholder = 'Enter your Vendor ID';
                    hint.textContent = 'Example: VEN98765';
                    break;
            }
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = loginId.value.trim();
        const password = document.getElementById('login-password').value;

        if (!id || !password) {
            alert('Please enter both ID and password');
            return;
        }

        if (id === DUMMY_CREDENTIALS[currentRole].id && password === DUMMY_CREDENTIALS[currentRole].password) {
            const user = { id, role: currentRole, name: currentRole.charAt(0).toUpperCase() + currentRole.slice(1) + ' User' };
            setCurrentUser(user);
            showMFAModal();
        } else {
            const hashedPassword = simpleHash(password);
            const users = getUsers();
            const registeredUser = users.find(u => u.id === id && u.password === hashedPassword && u.role === currentRole);
            if (registeredUser) {
                setCurrentUser(registeredUser);
                showMFAModal();
            } else {
                alert('Invalid credentials. Please try again.\n\nHint: Use the example ID shown and password: "password"');
            }
        }
    });
}

function setupRegistrationPage() {
    const roleButtons = document.querySelectorAll('#register-tab .role-btn');
    const registerForm = document.getElementById('register-form');

    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#register-tab .role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRole = btn.dataset.role;
        });
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('reg-firstname').value.trim();
        const lastName = document.getElementById('reg-lastname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const department = document.getElementById('reg-department').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (!firstName || !lastName || !email || !phone || !password) {
            alert('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        let prefix = '';
        switch(currentRole) {
            case 'user':
                prefix = 'CUST';
                break;
            case 'support':
                prefix = 'EMP';
                break;
            case 'vendor':
                prefix = 'VEN';
                break;
        }

        const userId = `${prefix}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const newUser = {
            id: userId,
            role: currentRole,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email,
            phone,
            department,
            password: simpleHash(password),
            createdAt: new Date().toISOString()
        };

        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        alert(`Registration successful!\n\nYour ${currentRole === 'user' ? 'Customer' : currentRole === 'support' ? 'Employee' : 'Vendor'} ID: ${userId}\n\nPlease use this ID to login.`);

        registerForm.reset();
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
}

function setupMFAModals() {
    const mfaModal = document.getElementById('mfa-modal');
    const smsModal = document.getElementById('sms-modal');
    const mfaVerifyBtn = document.getElementById('mfa-verify');
    const smsVerifyBtn = document.getElementById('sms-verify');
    const mfaCancelBtn = document.getElementById('mfa-cancel');
    const smsCancelBtn = document.getElementById('sms-cancel');
    const switchToSMS = document.getElementById('switch-to-sms');
    const switchToMFA = document.getElementById('switch-to-mfa');

    switchToSMS.addEventListener('click', (e) => {
        e.preventDefault();
        mfaModal.classList.remove('active');
        smsModal.classList.add('active');
    });

    switchToMFA.addEventListener('click', (e) => {
        e.preventDefault();
        smsModal.classList.remove('active');
        mfaModal.classList.add('active');
    });

    mfaVerifyBtn.addEventListener('click', () => {
        const code = document.getElementById('mfa-code').value;
        if (code === DUMMY_MFA_CODE) {
            mfaModal.classList.remove('active');
            const user = getCurrentUser();
            navigateTo(null, user.role);
        } else {
            alert('Invalid MFA code. Try: 123456');
        }
    });

    smsVerifyBtn.addEventListener('click', () => {
        const code = document.getElementById('sms-code').value;
        if (code === DUMMY_SMS_CODE) {
            smsModal.classList.remove('active');
            const user = getCurrentUser();
            navigateTo(null, user.role);
        } else {
            alert('Invalid SMS code. Try: 654321');
        }
    });

    mfaCancelBtn.addEventListener('click', () => {
        mfaModal.classList.remove('active');
        clearSession();
    });

    smsCancelBtn.addEventListener('click', () => {
        smsModal.classList.remove('active');
        clearSession();
    });
}

function showMFAModal() {
    showModal('mfa-modal');
    document.getElementById('mfa-code').value = '';
}
