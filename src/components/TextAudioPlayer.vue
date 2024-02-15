<template>
    <div class="container">
  
    </div>  
  </template>
  
  <script>
  export default {
    name: "TextAudioPlayer",
    data() {
      return {
        jsonData: null
      }
    },
    async created() {
      const response = await fetch('/transcript.json');
      this.jsonData = await response.json();
      
    }
  }
  </script>  
  
  <style scoped>
    .container {
      position: relative;
    }
  </style>