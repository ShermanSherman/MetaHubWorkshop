<template>
  <div>
    <audio controls @timeupdate="updateTime($event)">
      <source src="../assets/audio_rossmann.m4a" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
    <p>Current time: {{ currentTime }}</p>
    <div class="container" v-if="jsonData">
      <span
        v-for="(item, index) in wordsWithAnnotations"
        :key="index"
        :class="{
          highlight: currentWordIndices.includes(index),
          word: !item.isAnnotation,
          annotation: item.isAnnotation,
        }"
        :ref="currentWordIndices.includes(index) ? 'highlightedWord' : null"
        :id="'word-' + index"
      >
        <div v-if="item.isAnnotation">
          <div v-if="item.isImage">
            <img :src="item.words" alt="Annotation image" />
          </div>
          <div v-else>
            {{ item.words }} <span class="username">{{ item.user }}</span>
          </div>
        </div>
        <div v-else>
          {{ item.words }}
        </div>
      </span>
    </div>
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

      this.wordsWithAnnotations.forEach((item, index) => {
        if (!item.isAnnotation && this.currentTime >= item.start) {
          indices.push(index);
        }
      });

      return indices;
    },
    wordsWithAnnotations() {
      if (!this.jsonData || !this.annotations) return [];
      let words = [...this.jsonData.data.words]; // Create a copy of the words array
      let combined = [...words]; // Create a new array for combined words and annotations

      // Sort the annotations by their position in the text
      const sortedAnnotations = [...this.annotations.rows].sort((a, b) => {
        const xpathA = a.target[0].selector.find(
          (selector) => selector.type === "RangeSelector"
        ).startContainer;
        const xpathB = b.target[0].selector.find(
          (selector) => selector.type === "RangeSelector"
        ).startContainer;
        const matchA = xpathA.match(/span\[(\d+)\]/);
        const matchB = xpathB.match(/span\[(\d+)\]/);
        return parseInt(matchA[1]) - parseInt(matchB[1]);
      });

      sortedAnnotations.forEach((annotation) => {
        // Extract the word index from the XPath expression
        const xpath = annotation.target[0].selector.find(
          (selector) => selector.type === "RangeSelector"
        ).endContainer; // Use endContainer to get the end of the annotation range
        const match = xpath.match(/span\[(\d+)\]/);

        // Check if a match was found
        if (match) {
          let wordIndex = parseInt(match[1]);

          // Check if the annotation text is an image URL
          const imageUrlPattern = /!\[\]\((http[s]?:\/\/.*\.(?:png|jpg|jpeg|gif))\)/i;
          const imageUrlMatch = annotation.text.match(imageUrlPattern);
          const isImage = !!imageUrlMatch;
          const text = isImage ? imageUrlMatch[1] : annotation.text;

          // Insert the annotation at the correct position in the combined array
          combined.splice(wordIndex, 0, {
            words: text,
            user: annotation.user_info
              ? annotation.user_info.display_name
              : annotation.user,
            isAnnotation: true,
            isImage: isImage,
          });
        }
      });

      return combined;
    },
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
  box-shadow: inset 0 10px 10px -10px rgba(0, 0, 0, 0.5),
    inset 0 -10px 10px -10px rgba(0, 0, 0, 0.5);
  font-size: 3em;
  padding: 0.5em;
}
.highlight {
  font-weight: bold;
}

.annotation {
  font-size: 0.5em;
  border: 1px solid grey;
  margin-right: 0.5em;
}

.annotation img{
    width: 20em;
}

.word {
  margin-right: 0.5em;
}
</style>
