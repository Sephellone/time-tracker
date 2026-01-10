import { defineStore } from "pinia";
import { ref } from "vue";

export const useDarkMode = defineStore("darkMode", () => {
  const isDark = ref(false);

  const getLocalStorage = () => {
    const stored = localStorage.getItem("darkMode");
    isDark.value = stored === "true";
  };

  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark.value.toString());
  };

  const init = () => {
    getLocalStorage();
    document.documentElement.classList.toggle("dark", isDark.value);
  };

  return {
    isDark,
    toggleDarkMode,
    getLocalStorage,
    init,
  };
})
