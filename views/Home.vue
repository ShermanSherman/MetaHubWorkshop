<script setup>
import RossmannSynagoge from "../src/components/RossmannSynagoge.vue"
</script>
<template>
    <router-link to="/textsource/1">Text Source 1</router-link>
    <router-link to="/textsource/2">Text Source 2</router-link>
    <router-link to="/textsource/3">Text Source 3</router-link>
  <br>
    <router-link to="/text/1">Text  1</router-link>
    <router-link to="/text/2">Text  2</router-link>
    <router-link to="/text/3">Text  3</router-link>
    <RossmannSynagoge />
</template>

<script>
export default {
  name: "Home"
}
</script>

<style scoped>

</style>
