<template>
  <section>
    <header>
      <audio ref="audio" @timeupdate="updateTime($event)">
        <source :src="audiosource" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <button @click="togglePlay">{{ isPlaying ? "Pause" : "Play" }}</button>
      <input
        type="range"
        min="0"
        :max="duration"
        v-model="currentTime"
        @input="changeTime"
      />
    </header>
    <div v-for="(color, user) in userColors" :key="user">
      <input type="checkbox" :id="user" v-model="userColors[user].checked" />
      <label :for="user">{{ user }}</label>
    </div>
    <div>
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
          <div
            v-if="item.isAnnotation"
            :style="{ backgroundColor: userColors[item.user] }"
          >
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
    <footer>
      <p>Current time: {{ currentTime }}</p>
    </footer>
  </section>
</template>

<script>
export default {
  name: "TextAudioPlayer",
  props: ['textsource', 'audiosource', 'hypothesissource'],
  data() {
    return {
      jsonData: null,
      currentTime: 0,
      annotations: null,
      userColors: {},
      isPlaying: false,
      duration: 0,
    };
  },
  mounted() {
    this.$refs.audio.addEventListener("loadedmetadata", () => {
      this.duration = this.$refs.audio.duration;
    });
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

      // Iterate over the annotations in reverse order
      for (let i = sortedAnnotations.length - 1; i >= 0; i--) {
        const annotation = sortedAnnotations[i];
        // Extract the word index from the XPath expression
        const xpath = annotation.target[0].selector.find(
          (selector) => selector.type === "RangeSelector"
        ).endContainer; // Use endContainer to get the end of the annotation range
        const match = xpath.match(/span\[(\d+)\]/);
        console.log(xpath);
        // Check if a match was found
        if (match) {
          let wordIndex = parseInt(match[1]);
          console.log(wordIndex, annotation.text);

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
      }

      return combined;
    },
  },
  methods: {
    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
    togglePlay() {
      if (this.isPlaying) {
        this.$refs.audio.pause();
      } else {
        this.$refs.audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    updateTime(event) {
      this.currentTime = event.target.currentTime;
    },
    changeTime() {
      this.$refs.audio.currentTime = this.currentTime;
    },
  },
  async created() {
    const response = await fetch(this.textsource);
    this.jsonData = await response.json();
    console.log(this.jsonData.data.words);
    const apiKey = "6879-eAvMUbHdA3Upm3zC8w4e9uTQnw4LkSnpHP2yd6v3X2U";
    const annotationsResponse = await fetch(
      "https://api.hypothes.is/api/search?uri=" +
        encodeURIComponent(this.hypothesissource),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    this.annotations = await annotationsResponse.json();
    const users = [
      ...new Set(
        this.annotations.rows.map((a) =>
          a.user_info ? a.user_info.display_name : a.user
        )
      ),
    ];

    // Assign a color to each user
    users.forEach((user, index) => {
      this.userColors[user] = `hsl(${(index / users.length) * 360}, 100%, 75%)`; // Change color generation as needed
    });
  },
};
</script>

<style lang="scss" scoped>
audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-panel {
  background-color: rgb(240, 240, 240);
  color: #fff;
}

header {
  display: flex;
  align-items: center;
  width: 100%;
  button {
    margin-right: 10px;
    background-color: none;
    font-family: "castledownReg";
    border: none;
    font-size: 2em;
  }
  input[type="range"] {
    flex-grow: 1;
  }
}

section {
  display: grid;
  justify-content: center;
}
.container {
  font-size: 2.5rem;
  line-height: 1.34;
  letter-spacing: 0.01em;
  position: relative;
  height: calc(100vh - 13rem);
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  box-shadow: inset 0 10px 10px -10px rgba(0, 0, 0, 0.5),
    inset 0 -10px 10px -10px rgba(0, 0, 0, 0.5);
  font-size: 3em;
  padding: 0.5em;
}
*::-webkit-scrollbar {
  display: none;
}
.annotation {
  display: inline-block;
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

.annotation {
  font-size: 0.5em;
  margin-right: 0.5em;
  max-width: 20em;
}

.annotation img {
  width: 20em;
}

.annotation .username {
  font-size: 0.5em;
  font-family: "castledownDotted";
  display: none;
}

.word {
  margin-right: 0.25em;
}
</style>
