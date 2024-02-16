<script setup>
import { useRoute } from 'vue-router';
import TextSourceComponent from "../src/components/TextSourceComponent.vue";

const route = useRoute();
const id = route.params.id;
const textsource = `/${id}.json`;
const audiosource = `/audio_${id}.m4a`;
const hypothesissource = `https://mapping-offenbach.nodeforum.org/textsource/${id}`;
</script>

<template>
  <TextSourceComponent 
    :textsource="textsource" 
    :audiosource="audiosource" 
  />
</template>
