<template>
  <div>
    <audio controls @timeupdate="updateTime($event)">
      <source src="../assets/audio_rossmann.m4a" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>

    <div class="container" v-if="jsonData">
      <span
        v-for="(word, index) in wordsWithAnnotations"
        :key="index"
        :class="{
          highlight: currentWordIndices.includes(index),
          word: !word.isAnnotation,
          annotation: word.isAnnotation,
        }"
        :ref="currentWordIndices.includes(index) ? 'highlightedWord' : null"
        :id="'word-' + index"
      >
        <span v-if="word.isAnnotation">
          <strong>{{ word.user }}:</strong> {{ word.words }}
        </span>
        <span v-else>
          {{ word.words }}
        </span>
      </span>
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
      currentTime: 0,
      annotations: null,
    };
  },
  watch: {
    currentWordIndices() {
      this.$nextTick(() => {
        const highlightedWords = document.querySelectorAll(".highlight");
        if (highlightedWords && highlightedWords.length > 0) {
          const lastHighlightedWord = highlightedWords[highlightedWords.length - 1];
          const container = document.querySelector(".container");
          const containerRect = container.getBoundingClientRect();
          const wordRect = lastHighlightedWord.getBoundingClientRect();
          if (
            wordRect.bottom > containerRect.bottom ||
            wordRect.top < containerRect.top
          ) {
            container.scrollTop += wordRect.top - containerRect.top;
          }
        }
      });
    },
  },
  computed: {
    currentWordIndices() {
      if (!this.jsonData) return [];
      let indices = [];

      this.jsonData.data.words.forEach((word, index) => {
        if (this.currentTime >= word.start) {
          indices = [...Array(index + 1).keys()];
        }
      });
      return indices;
    },
    wordsWithAnnotations() {
    if (!this.jsonData || !this.annotations) return [];
    let words = [...this.jsonData.data.words]; // Create a copy of the words array

    this.annotations.rows.forEach(annotation => {
      // Extract the word index from the XPath expression
      const xpath = annotation.target[0].selector.find(selector => selector.type === 'RangeSelector').startContainer;
      const match = xpath.match(/span\[(\d+)\]/);
      
      // Check if a match was found
      if (match) {
        const wordIndex = parseInt(match[1]) - 1;

        // Insert the annotation at the correct position
        words.splice(wordIndex, 0, {
          words: annotation.text,
          user: annotation.user,
          isAnnotation: true
        });
      }
    });

    return words;
  }
  },
  methods: {
    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
  },
  async created() {
    const response = await fetch("/Michael_Lenarz_Rossmann_Synagoge.json");
    this.jsonData = await response.json();
    console.log(this.jsonData.data.words);
    const apiKey = "6879-eAvMUbHdA3Upm3zC8w4e9uTQnw4LkSnpHP2yd6v3X2U";
    const annotationsResponse = await fetch(
      "https://api.hypothes.is/api/search?uri=" +
        encodeURIComponent(window.location.href),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    this.annotations = await annotationsResponse.json();
    console.log(this.annotations);
  },
};
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

.word {
  margin-right: 0.5em;
}
</style>
