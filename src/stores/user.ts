import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null | undefined>(null)
  const isLoading = ref(true)

  function setUser(newUser: User | null | undefined) {
    user.value = newUser
    isLoading.value = false
  }

  function clearUser() {
    user.value = null
    isLoading.value = false
  }

  return { user, isLoading, setUser, clearUser }
})
