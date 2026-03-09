<template>
  <base-page class="profile px-5">
    <page-title class="pt-4 mb-6" title="Профиль" />

    <div class="profile__card d-flex __column __align-center pa-5 gap-4 mb-6">
      <div class="profile__avatar d-center">
        {{ displayName.charAt(0).toUpperCase() }}
      </div>
      <div class="profile__info d-center __column gap-1">
        <div class="profile__name">{{ displayName }}</div>
        <p class="profile__email">{{ user?.email }}</p>
      </div>
      <div class="profile__user-id d-center __column gap-1">
        <div class="profile__id-label">ID пользователя</div>
        <div class="profile__user-id-container d-flex __align-center py-2 px-3" @click="copyUserId">
          <code class="profile__id mr-2">{{ user?.uid }}</code>
          <check v-if="isCopied" :size="16" color="var(--palette-positive)" />
          <copy v-else :size="16" color="var(--palette-primary)" />
        </div>
      </div>
    </div>

    <div class="profile__form d-flex __column gap-4 mb-6">
      <div class="profile__form-title comforta">Изменить имя</div>
      <base-input class="profile__name-field" name="displayName" v-model="newDisplayName" label="Имя" />
      <div v-if="displayNameError" class="error-message">
        {{ displayNameError }}
      </div>
      <div v-if="displayNameSuccess" class="success-message">
        {{ displayNameSuccess }}
      </div>
      <base-button class="profile__form-button" :loading="displayNameLoading" @click="handleUpdateDisplayName">
        Сохранить
      </base-button>
    </div>

    <div class="profile__form d-flex __column gap-4">
      <div class="profile__form-title comforta">Изменить пароль</div>
      <base-form
        class="profile__password d-flex __column gap-3"
        :fields="passwordFormFields"
        :values="passwordFormValues"
        :errorFields="passwordErrorFields"
        @input="onPasswordInput"
      />
      <div v-if="passwordError" class="error-message">
        {{ passwordError }}
      </div>
      <div v-if="passwordSuccess" class="success-message">
        {{ passwordSuccess }}
      </div>
      <base-button class="profile__form-button" :loading="passwordLoading" @click="handleUpdatePassword">
        Изменить пароль
      </base-button>
    </div>
  </base-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Copy, Check } from "lucide-vue-next";
import { useCurrentUser } from "vuefire";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import BasePage from "@/components/BasePage.vue";
import PageTitle from "@/components/PageTitle.vue";
import { useUserStore } from "@/stores/user.ts";
import BaseInput from "@/components/BaseInput.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseForm from "@/components/BaseForm.vue";
import type { FormField, FormValues } from "@/types.ts";

const user = useCurrentUser();

const userStore = useUserStore();

const displayName = computed(() => {
  return userStore.user?.displayName || userStore.user?.email?.split("@")[0] || "Пользователь";
});

const newDisplayName = ref("");
const displayNameError = ref("");
const displayNameSuccess = ref("");
const displayNameLoading = ref(false);

const passwordFormValues = ref<FormValues>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordFormFields = computed<FormField[]>(() => [
  {
    name: "currentPassword",
    label: "Текущий пароль",
    type: "password",
    required: true,
    placeholder: "Введите текущий пароль",
  },
  {
    name: "newPassword",
    label: "Новый пароль",
    type: "password",
    required: true,
    placeholder: "Минимум 6 символов",
  },
  {
    name: "confirmPassword",
    label: "Подтвердите новый пароль",
    type: "password",
    required: true,
    placeholder: "Повторите новый пароль",
  },
]);

const passwordErrorFields = ref<string[]>([]);
const passwordError = ref("");
const passwordSuccess = ref("");
const passwordLoading = ref(false);

const onPasswordInput = (values: FormValues) => {
  passwordFormValues.value = values;
  passwordErrorFields.value = [];
};

const isCopied = ref(false);

onMounted(() => {
  newDisplayName.value = displayName.value;
});

const copyUserId = async () => {
  if (!userStore.user) return;

  try {
    await navigator.clipboard.writeText(userStore.user.uid);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const handleUpdateDisplayName = async () => {
  if (!userStore.user) return;
  displayNameError.value = "";
  displayNameSuccess.value = "";
  displayNameLoading.value = true;

  try {
    await updateProfile(userStore.user, {
      displayName: newDisplayName.value,
    });

    const userRef = doc(db, "users", userStore.user.uid);
    await updateDoc(userRef, {
      displayName: newDisplayName.value,
    });

    userStore.updateUser({ displayName: newDisplayName.value });

    displayNameSuccess.value = "Имя успешно обновлено!";
    setTimeout(() => {
      displayNameSuccess.value = "";
    }, 2000);
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
  if (!userStore.user || !userStore.user.email) return;
  passwordError.value = "";
  passwordSuccess.value = "";
  passwordErrorFields.value = [];
  passwordLoading.value = true;

  try {
    const currentPassword = passwordFormValues.value.currentPassword;
    const newPassword = passwordFormValues.value.newPassword;
    const confirmPassword = passwordFormValues.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      passwordErrorFields.value = ["newPassword", "confirmPassword"];
      passwordError.value = "Пароли не совпадают";
      return;
    }

    if (newPassword.length < 6) {
      passwordErrorFields.value = ["newPassword"];
      passwordError.value = "Пароль должен содержать минимум 6 символов";
      return;
    }

    const credential = EmailAuthProvider.credential(userStore.user.email, currentPassword);
    await reauthenticateWithCredential(userStore.user, credential);

    await updatePassword(userStore.user, newPassword);

    passwordSuccess.value = "Пароль успешно изменен!";
    passwordFormValues.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    setTimeout(() => {
      passwordSuccess.value = "";
    }, 2000);
  } catch (err: any) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      passwordErrorFields.value = ["currentPassword"];
      passwordError.value = "Неверный текущий пароль";
    } else if (err.code === "auth/weak-password") {
      passwordErrorFields.value = ["newPassword"];
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

<style scoped lang="scss">
.profile {
  min-height: 100vh;
  color: var(--palette-fg);

  &__card {
    background: var(--palette-bg-secondary);
    border-radius: 12px;
  }

  &__avatar {
    width: 66px;
    height: 66px;
    font-size: 36px;
    color: var(--palette-white);
    background: var(--palette-primary);
    border-radius: 50%;
  }

  &__name {
    font-size: 24px;
    font-weight: 700;
  }

  &__email {
    color: var(--palette-gray);
    font-size: 14px;
  }

  &__id-label {
    text-transform: uppercase;
    font-size: 12px;
    color: var(--palette-gray);
  }

  &__user-id-container {
    background-color: var(--palette-bg);
    border-radius: 12px;
    box-shadow: inset 0 4px 5px var(--inner-shadow-color);
    cursor: pointer;

    &:hover {
      box-shadow: inset 0 2px 5px var(--palette-primary);
    }
  }

  &__id {
    color: var(--palette-fg-secondary);
  }

  &__form-title {
    font-size: 16px;
    font-weight: 600;
  }
  &__form-button {
    align-self: flex-end;
  }
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.success-message {
  background: #efe;
  color: #3a3;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}
</style>
