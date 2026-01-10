<template>
  <div class="profile">
    <header class="profile-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">← Назад</button>
        <h1>Профиль</h1>
        <div></div>
      </div>
    </header>

    <main class="profile-main">
      <div class="profile-card">
        <div class="profile-info">
          <div class="avatar">
            {{ displayName.charAt(0).toUpperCase() }}
          </div>
          <h2>{{ displayName }}</h2>
          <p class="email">{{ user?.email }}</p>
          <div class="user-id-section">
            <label>ID пользователя</label>
            <div class="user-id-container">
              <code class="user-id">{{ user?.uid }}</code>
              <button @click="copyUserId" class="btn-copy" :class="{ copied: isCopied }">
                {{ isCopied ? "✓ Скопировано" : "Копировать" }}
              </button>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Изменить отображаемое имя</h3>
          <form @submit.prevent="handleUpdateDisplayName" class="profile-form">
            <div class="form-group">
              <label for="displayName">Отображаемое имя</label>
              <input
                id="displayName"
                v-model="newDisplayName"
                type="text"
                required
                placeholder="Введите новое имя"
              />
            </div>

            <div v-if="displayNameError" class="error-message">
              {{ displayNameError }}
            </div>

            <div v-if="displayNameSuccess" class="success-message">
              {{ displayNameSuccess }}
            </div>

            <button type="submit" class="btn btn-primary" :disabled="displayNameLoading">
              {{ displayNameLoading ? "Сохранение..." : "Сохранить имя" }}
            </button>
          </form>
        </div>

        <div class="form-section">
          <h3>Изменить пароль</h3>
          <form @submit.prevent="handleUpdatePassword" class="profile-form">
            <div class="form-group">
              <label for="currentPassword">Текущий пароль</label>
              <input
                id="currentPassword"
                v-model="currentPassword"
                type="password"
                required
                placeholder="Введите текущий пароль"
              />
            </div>

            <div class="form-group">
              <label for="newPassword">Новый пароль</label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                minlength="6"
                placeholder="Минимум 6 символов"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Подтвердите новый пароль</label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                minlength="6"
                placeholder="Повторите новый пароль"
              />
            </div>

            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>

            <div v-if="passwordSuccess" class="success-message">
              {{ passwordSuccess }}
            </div>

            <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
              {{ passwordLoading ? "Изменение..." : "Изменить пароль" }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCurrentUser } from "vuefire";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";

const router = useRouter();
const user = useCurrentUser();

const displayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "Пользователь";
});

const newDisplayName = ref("");
const displayNameError = ref("");
const displayNameSuccess = ref("");
const displayNameLoading = ref(false);

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const passwordSuccess = ref("");
const passwordLoading = ref(false);

const isCopied = ref(false);

onMounted(() => {
  newDisplayName.value = displayName.value;
});

const goBack = () => {
  router.push("/dashboard");
};

const copyUserId = async () => {
  if (!user.value?.uid) return;

  try {
    await navigator.clipboard.writeText(user.value.uid);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const handleUpdateDisplayName = async () => {
  displayNameError.value = "";
  displayNameSuccess.value = "";
  displayNameLoading.value = true;

  try {
    if (!user.value) {
      throw new Error("Пользователь не авторизован");
    }

    await updateProfile(user.value, {
      displayName: newDisplayName.value,
    });

    const userRef = doc(db, "users", user.value.uid);
    await updateDoc(userRef, {
      displayName: newDisplayName.value,
    });

    displayNameSuccess.value = "Имя успешно обновлено!";
  } catch (err: any) {
    if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
      displayNameError.value = "Ошибка доступа к базе данных. Проверьте правила безопасности Firestore.";
    } else {
      displayNameError.value = err.message || "Произошла ошибка при обновлении имени";
    }
  } finally {
    displayNameLoading.value = false;
  }
};

const handleUpdatePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";
  passwordLoading.value = true;

  try {
    if (!user.value || !user.value.email) {
      throw new Error("Пользователь не авторизован");
    }

    if (newPassword.value !== confirmPassword.value) {
      throw new Error("Пароли не совпадают");
    }

    if (newPassword.value.length < 6) {
      throw new Error("Пароль должен содержать минимум 6 символов");
    }

    const credential = EmailAuthProvider.credential(user.value.email, currentPassword.value);
    await reauthenticateWithCredential(user.value, credential);

    await updatePassword(user.value, newPassword.value);

    passwordSuccess.value = "Пароль успешно изменен!";
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (err: any) {
    if (err.code === "auth/wrong-password") {
      passwordError.value = "Неверный текущий пароль";
    } else if (err.code === "auth/weak-password") {
      passwordError.value = "Пароль слишком слабый";
    } else if (err.code === "auth/requires-recent-login") {
      passwordError.value = "Для изменения пароля необходимо войти заново";
    } else {
      passwordError.value = err.message || "Произошла ошибка при изменении пароля";
    }
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: #f5f5f5;
}

.profile-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.btn-back {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  justify-self: start;
}

.btn-back:hover {
  background: #e0e0e0;
}

.profile-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  text-align: center;
}

.profile-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-info {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e0e0e0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.profile-info h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.email {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 16px;
}

.user-id-section {
  margin-top: 20px;
}

.user-id-section label {
  display: block;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.user-id-container {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.user-id {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
  font-family: monospace;
  word-break: break-all;
  flex: 1;
  max-width: 400px;
}

.btn-copy {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #5568d3;
}

.btn-copy.copied {
  background: #48bb78;
}

.form-section {
  margin-bottom: 40px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.profile-form {
  max-width: 500px;
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

.success-message {
  background: #efe;
  color: #3a3;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
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
</style>
