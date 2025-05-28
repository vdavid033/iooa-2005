import { boot } from 'quasar/wrappers'
import { useUser } from 'src/composables/useUser'

export default boot(() => {
  const { loadUserFromToken } = useUser()
  loadUserFromToken()
})
