import { Akoma } from '@rafael_dias/akoma'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Akoma)
})
