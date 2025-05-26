import { ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'vue-router'

const user = ref(null)
const router = useRouter()

export function useUser() {
  function loadUserFromToken() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        user.value = jwtDecode(token)
      } catch (err) {
        console.error('Greška kod dekodiranja tokena:', err)
        user.value = null
      }
    }
  }

  function logout() {
    localStorage.removeItem('token')
    user.value = null
    router.push('/login')
  }

  return {
    user,
    isAuthenticated: () => !!user.value,
    isAdmin: () => user.value?.uloga === 'admin',
    loadUserFromToken,
    logout,
  }
}
