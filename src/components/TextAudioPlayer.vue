<template>
    <div >
        <audio controls @timeupdate="updateTime($event)">
            <source src="../assets/audio_rossmann.m4a" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>

        <div class="container" v-if="jsonData">
            <span v-for="(word, index) in jsonData.data.words" :key="index"
            :class="{ 'highlight': currentWordIndices.includes(index), 'word': true }"
            :ref="currentWordIndices.includes(index) ? 'highlightedWord' : null">{{ word.words }}</span>       
        </div>
        <p>Current time: {{ currentTime }}</p>
    </div>  
</template>
  
<script>
export default {
    name: "TextAudioPlayer",
    data() {
      return {
        jsonData: null,
        currentTime: 0
      }
    },
    watch: {
        currentWordIndices() {
            this.$nextTick(() => {
                const highlightedWords = document.querySelectorAll('.highlight');
                if (highlightedWords && highlightedWords.length > 0) {
                    const lastHighlightedWord = highlightedWords[highlightedWords.length - 1];
                    const container = document.querySelector('.container');
                    const containerRect = container.getBoundingClientRect();
                    const wordRect = lastHighlightedWord.getBoundingClientRect();
                    if (wordRect.bottom > containerRect.bottom || wordRect.top < containerRect.top) {
                        container.scrollTop += wordRect.top - containerRect.top;
                    }
                }
            });
        }
    },
    computed: {
      currentWordIndices() {
        if (!this.jsonData) return [];
        let indices = [];
        
        this.jsonData.data.words.forEach((word, index) => {
          if (this.currentTime >= word.start ) {
            indices = [...Array(index + 1).keys()];
          }
        });
        return indices;
      }
    },
    methods: {
      updateTime(event) {
        this.currentTime = event.target.currentTime;
      }
    },
    async created() {
      const response = await fetch('/Michael_Lenarz_Rossmann_Synagoge.json');
      this.jsonData = await response.json();
      console.log(this.jsonData.data.words)
    }
}
</script>  
  
<style scoped>
.container {
    position: relative;
    width: 100%;
    height: 80vh;
    display: flex;
    flex-wrap: wrap;
    overflow-y: scroll;
}
.highlight {
    font-weight: bold;
}

.word{
    margin-right: 0.5em;
}
</style>