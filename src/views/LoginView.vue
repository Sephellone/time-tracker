<template>
  <div class="login-container">
    <div class="login-card">
      <h1>{{ isLogin ? "Вход" : "Регистрация" }}</h1>
      <p class="subtitle">Трекер времени</p>

      <form @submit.prevent="handleEmailAuth" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="your@email.com" />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••" minlength="6" />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться" }}
        </button>
      </form>

      <div class="divider">
        <span>или</span>
      </div>

      <button @click="handleGoogleAuth" class="btn btn-google" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            fill="#4285F4"
          />
          <path
            d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
            fill="#34A853"
          />
          <path
            d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
            fill="#FBBC05"
          />
          <path
            d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
            fill="#EA4335"
          />
        </svg>
        Войти через Google
      </button>

      <div class="toggle-mode">
        <span>{{ isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?" }}</span>
        <button type="button" @click="toggleMode" class="link-button">
          {{ isLogin ? "Зарегистрироваться" : "Войти" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

const router = useRouter();
const email = ref("");
const password = ref("");
const isLogin = ref(true);
const error = ref("");
const loading = ref(false);

const createUserDocument = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      createTime: serverTimestamp(),
    });
  }
};

const handleEmailAuth = async () => {
  error.value = "";
  loading.value = true;

  try {
    let userCredential;
    if (isLogin.value) {
      userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      await createUserDocument(userCredential.user);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      await createUserDocument(userCredential.user);
    }
    router.push("/dashboard");
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      error.value = "Ошибка доступа к базе данных. Пожалуйста, настройте правила безопасности Firestore. Аккаунт создан, попробуйте войти.";
    } else if (err.code === 'auth/email-already-in-use') {
      error.value = "Этот email уже используется. Попробуйте войти.";
    } else if (err.code === 'auth/weak-password') {
      error.value = "Пароль слишком слабый. Используйте минимум 6 символов.";
    } else if (err.code === 'auth/invalid-email') {
      error.value = "Неверный формат email.";
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      error.value = "Неверный email или пароль.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};

const handleGoogleAuth = async () => {
  error.value = "";
  loading.value = true;

  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await createUserDocument(userCredential.user);
    router.push("/dashboard");
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message.includes('Missing or insufficient permissions')) {
      error.value = "Ошибка доступа к базе данных. Пожалуйста, настройте правила безопасности Firestore. Аккаунт создан, попробуйте войти.";
    } else if (err.code === 'auth/popup-closed-by-user') {
      error.value = "Вход через Google отменен.";
    } else if (err.code === 'auth/cancelled-popup-request') {
      return;
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = "";
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
  text-align: center;
}

.subtitle {
  margin: 0 0 32px 0;
  color: #666;
  text-align: center;
  font-size: 14px;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-google {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-google:hover:not(:disabled) {
  background: #f8f8f8;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #ddd;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 16px;
  color: #999;
  font-size: 14px;
}

.toggle-mode {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  margin-left: 4px;
  font-size: 14px;
}

.link-button:hover {
  text-decoration: underline;
}
</style>
