<template>
  <base-page class="password-reset-container">
    <div class="password-reset-card">
      <h1>{{ emailSent ? "Проверьте почту" : "Сброс пароля" }}</h1>
      <p class="subtitle">
        {{
          emailSent ? "Мы отправили вам письмо с инструкциями по сбросу пароля" : "Введите ваш email для сброса пароля"
        }}
      </p>

      <template v-if="!emailSent">
        <base-form
          class="password-reset-form d-flex __column gap-4"
          :fields="formFields"
          :values="formValues"
          :error-fields="errorFields"
          @input="onFormInput"
          @submit="handlePasswordReset"
        />

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <base-button
          class="password-reset-form__submit mt-5"
          full-width
          :loading="loading"
          @click="handlePasswordReset"
        >
          Отправить письмо
        </base-button>
      </template>

      <template v-else>
        <div class="success-message">
          Письмо отправлено на {{ formValues.email }}.
          <br />
          Проверьте папку "Спам", если не видите письмо.
        </div>

        <base-button class="mt-5" full-width @click="router.push('/login')">Вернуться ко входу</base-button>
      </template>

      <div v-if="!emailSent" class="back-to-login">
        <button type="button" @click="router.push('/login')" class="link-button">← Назад</button>
      </div>
    </div>
  </base-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import BasePage from "@/components/BasePage.vue";
import BaseForm from "@/components/BaseForm.vue";
import BaseButton from "@/components/BaseButton.vue";
import type { FormField, FormValues } from "@/types";

const router = useRouter();
const error = ref("");
const success = ref("");
const loading = ref(false);
const emailSent = ref(false);

const formValues = ref<FormValues>({
  email: "",
});

const formFields = computed<FormField[]>(() => [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "your@email.com",
  },
]);

const errorFields = ref<string[]>([]);

const onFormInput = (values: FormValues) => {
  formValues.value = values;
  errorFields.value = [];
  error.value = "";
  success.value = "";
};

const handlePasswordReset = async () => {
  error.value = "";
  success.value = "";
  errorFields.value = [];
  loading.value = true;

  try {
    const email = formValues.value.email as string;

    if (!email) {
      errorFields.value = ["email"];
      error.value = "Введите email";
      return;
    }

    await sendPasswordResetEmail(auth, email);
    emailSent.value = true;
    success.value = "Письмо для сброса пароля отправлено!";
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      errorFields.value = ["email"];
      error.value = "Пользователь с таким email не найден.";
    } else if (err.code === "auth/invalid-email") {
      errorFields.value = ["email"];
      error.value = "Неверный формат email.";
    } else if (err.code === "auth/too-many-requests") {
      error.value = "Слишком много попыток. Попробуйте позже.";
    } else {
      error.value = err.message;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.password-reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.password-reset-card {
  background: var(--palette-bg-secondary);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: var(--palette-fg);
  text-align: center;
}

.subtitle {
  margin: 0 0 32px 0;
  color: var(--palette-fg);
  text-align: center;
  font-size: 14px;
}

.password-reset-form {
  &__submit {
    margin-top: 8px;
  }
}

.error-message {
  background: var(--palette-bg);
  color: var(--palette-negative);
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
}

.success-message {
  background: var(--palette-bg);
  color: var(--palette-fg);
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.back-to-login {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: var(--palette-primary);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  font-size: 14px;
}

.link-button:hover {
  text-decoration: underline;
}
</style>
