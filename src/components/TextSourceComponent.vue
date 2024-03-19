<template>
  <section>
    <header>
      <audio controls @timeupdate="updateTime($event)">
        <source :src="audiosource" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </header>
    <div>
      <div class="container" v-if="jsonData">
        <span
          v-for="(item, index) in jsonData.data.words"
          :key="index"
          :class="{
            highlight: currentWordIndices.includes(index),
            word: true,
          }"
          :ref="currentWordIndices.includes(index) ? 'highlightedWord' : null"
          :id="'word-' + index"
        >
          <div>
            {{ item.words }}
          </div>
        </span>
      </div>
    </div>
    <footer>
      <p>Current time: {{ currentTime }}</p>
    </footer>
  </section>
</template>

<script>
export default {
  name: "TextSourceComponent",
  props: ['audiosource','textsource'],
  data() {
    return {
      jsonData: null,
      currentTime: 0,
      shouldLoadHypothesis: true,
    };
  },
  mounted() {
    if (this.shouldLoadHypothesis) {
      const script = document.createElement("script");
      script.src = "https://hypothes.is/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
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

      this.jsonData.data.words.forEach((item, index) => {
        if (this.currentTime >= item.start) {
          indices.push(index);
        }
      });

      return indices;
    },
  },
  methods: {
    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
  },
  async created() {
    const response = await fetch(this.textsource);
    this.jsonData = await response.json();
    console.log(this.jsonData.data.words);
  },
};
</script>

<style lang="scss" scoped>
audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-panel {
  background-color: rgb(240, 240, 240);
  color: #fff;
}
section {
  display: grid;
  justify-content: center;
}
*::-webkit-scrollbar {
  display: none;
}
header {
  position: absolute;
  top: 0;
  left: 0;
}
footer {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  font-size: 1rem;
  p {
    margin: 0;
    font-family: "castledownReg";
  }
}
.highlight {
  font-family: "castledownDotted";
  letter-spacing: 0.016em;
}

.word {
  margin-right: 0.25em;
}
</style>
