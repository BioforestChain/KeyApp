<template>
  <a :href="href" v-bind="$attrs">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Props = {
  path: string
}

const props = defineProps<Props>()
const href = ref(`dweb://install?url=${encodeURIComponent(props.path)}`)

onMounted(() => {
  const absUrl = new URL(props.path, window.location.href).toString()
  href.value = `dweb://install?url=${encodeURIComponent(absUrl)}`
})
</script>
