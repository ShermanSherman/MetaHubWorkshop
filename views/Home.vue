<script setup>
import RossmannSynagoge from "../src/components/RossmannSynagoge.vue"
</script>
<template>
  <!-- <h1>Comment here:</h1>
    <router-link to="/textsource/1">Text Source 1: Capitol</router-link><br>
    <router-link to="/textsource/2">Text Source 2: Friedhof</router-link><br>
    <router-link to="/textsource/3">Text Source 3: Rossmann</router-link><br>
  <br> -->
  <h1>Mapping Offenbach / 11.Februar – 16.Februar 2024 </h1>
    <router-link to="/text/3">Rossmann</router-link><br>
    <router-link to="/text/1">Capitol</router-link><br>
    <router-link to="/text/2">Friedhof</router-link><br>
    
  
</template>

<script>
export default {
  name: "Home"
}
</script>

<style scoped>

h1{
  font-family: "castledownDotted";
  letter-spacing: 0.016em;
  padding-left: 0.2em;
}
a{
  font-size: 5em;
  color: black;
  text-decoration: none;
}

a:hover{
  font-size: 5em;
  color: red;
  text-decoration: none;
}
</style>
