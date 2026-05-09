export const SESSION_KEY = 'tuai-session';
export const TUAI_USERS_DB_KEY = 'tuai-users-db-v3';
const TUAI_DEVICE_ID_KEY = 'tuai-deviceId';
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export type User = {
  username: string;
  password_plaintext: string;
  passwordChangedAt?: number;
  deviceId?: string | null;
};

type Session = {
    username: string;
    loginTime: number;
};

const generateRandomPassword = (length = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const getUsersFromDb = (): User[] => {
    try {
        return JSON.parse(localStorage.getItem(TUAI_USERS_DB_KEY) || '[]');
    } catch (e) {
        return [];
    }
};

const saveUsersToDb = (users: User[]) => {
    localStorage.setItem(TUAI_USERS_DB_KEY, JSON.stringify(users));
};

export const getCurrentUserDetails = (): User | null => {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    if (!sessionJson) return null;

    try {
        const session: Session = JSON.parse(sessionJson);
        if (Date.now() - session.loginTime > SESSION_DURATION) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        const users = getUsersFromDb();
        const userDetails = users.find(u => u.username === session.username);

        if (!userDetails || (userDetails.passwordChangedAt && userDetails.passwordChangedAt > session.loginTime)) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        return userDetails;
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};

export const getCurrentUser = (): string | null => {
    return getCurrentUserDetails()?.username || null;
};

export const login = (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        initializeUsers();
        const users = getUsersFromDb();
        const trimmedUsername = username.trim().toLowerCase();
        const user = users.find(u => u.username === trimmedUsername);

        if (!user || user.password_plaintext !== password.trim().toLowerCase()) {
            return reject(new Error('Tên đăng nhập hoặc mật khẩu không chính xác.'));
        }

        const localDeviceId = localStorage.getItem(TUAI_DEVICE_ID_KEY);

        if (user.deviceId) {
            if (user.deviceId !== localDeviceId) {
                return reject(new Error('Tài khoản này đã được đăng nhập trên một thiết bị khác. Vui lòng liên hệ quản trị viên để reset.'));
            }
        } else {
            const newDeviceId = localDeviceId || crypto.randomUUID();
            if (!localDeviceId) {
                localStorage.setItem(TUAI_DEVICE_ID_KEY, newDeviceId);
            }
            
            const userIndex = users.findIndex(u => u.username === user.username);
            if (userIndex !== -1) {
                users[userIndex].deviceId = newDeviceId;
                user.deviceId = newDeviceId;
                saveUsersToDb(users);
            }
        }

        const sessionData: Session = { username: user.username, loginTime: Date.now() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        resolve(user);
    });
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        const users = getUsersFromDb();
        resolve(users.filter(u => u.username.toLowerCase() !== 'admin'));
    });
};

export const addUser = (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const users = getUsersFromDb();
        
        if (!username.trim() || !password.trim()) {
            return reject(new Error('Tên đăng nhập và mật khẩu không được để trống.'));
        }

        const standardizedUsername = username.trim().toLowerCase();
        const standardizedPassword = password.trim().toLowerCase();

        if (users.some(u => u.username === standardizedUsername)) {
            return reject(new Error(`Tên đăng nhập '${username.trim()}' đã tồn tại.`));
        }

        const newUser: User = {
            username: standardizedUsername,
            password_plaintext: standardizedPassword,
            passwordChangedAt: Date.now(),
            deviceId: null,
        };

        const updatedUsers = [newUser, ...users];
        saveUsersToDb(updatedUsers);
        resolve(newUser);
    });
};

export const resetUserDevice = (username: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const users = getUsersFromDb();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return reject(new Error(`Không tìm thấy người dùng '${username}'.`));
        }

        users[userIndex].deviceId = null;
        saveUsersToDb(users);
        resolve();
    });
};

const initializeUsers = () => {
    const dbJson = localStorage.getItem(TUAI_USERS_DB_KEY);
    let users: User[] = [];
    let dbIsValid = false;

    if (dbJson) {
        try {
            const parsed = JSON.parse(dbJson);
            if (Array.isArray(parsed) && parsed.some(u => u.username === 'admin')) {
                users = parsed;
                dbIsValid = true;
            }
        } catch (e) {}
    }

    if (!dbIsValid) {
        const predefinedUsers: User[] = [
            { username: 'admin', password_plaintext: 'admin123', passwordChangedAt: 0, deviceId: null },
        ];
        
        for (let i = 1; i <= 20; i++) {
            const userNumber = i.toString().padStart(2, '0');
            predefinedUsers.push({
                username: `user${userNumber}`,
                password_plaintext: `pass${userNumber}`,
                passwordChangedAt: 0,
                deviceId: null,
            });
        }
        
        saveUsersToDb(predefinedUsers);
    } else {
        try {
            let needsUpdate = false;
            users.forEach(user => {
                if (typeof user.passwordChangedAt === 'undefined') {
                    user.passwordChangedAt = 0;
                    needsUpdate = true;
                }
                 if (typeof user.deviceId === 'undefined') {
                    user.deviceId = null;
                    needsUpdate = true;
                }
            });
            if (needsUpdate) {
                saveUsersToDb(users);
            }
        } catch (e) {}
    }
};
