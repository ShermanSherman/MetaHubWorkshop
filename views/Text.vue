<script setup>
import { useRoute } from 'vue-router';
import TextAudioPlayer from "../src/components/TextAudioPlayer.vue";

console.log("hello");
const route = useRoute();
const id = route.params.id;
const textsource = `/${id}.json`;
const audiosource = `/audio_${id}.m4a`;
const hypothesissource = `https://mapping-offenbach.nodeforum.org/textsource/${id}`;
</script>

<template>
  <TextAudioPlayer 
    :textsource="textsource" 
    :audiosource="audiosource" 
    :hypothesissource="hypothesissource"
  />
</template>