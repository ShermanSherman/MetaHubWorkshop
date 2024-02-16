<script setup>
import RossmannSynagoge from "../src/components/RossmannSynagoge.vue"
</script>
<template>
  <h1>Comment here:</h1>
    <router-link to="/textsource/1">Text Source 1: Capitol</router-link><br>
    <router-link to="/textsource/2">Text Source 2: Friedhof</router-link><br>
    <router-link to="/textsource/3">Text Source 3: Rossmann</router-link><br>
  <br>
  <h1>Read / show here:</h1>
    <router-link to="/text/1">Text  1: Capitol</router-link><br>
    <router-link to="/text/2">Text  2: Friedhof</router-link><br>
    <router-link to="/text/3">Text  3: Rossmann</router-link><br>
    <RossmannSynagoge />
</template>

<script>
export default {
  name: "Home"
}
</script>

<style scoped>

</style>
