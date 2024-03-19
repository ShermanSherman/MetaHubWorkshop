<script setup>
import { marked } from "marked";
</script>
<template>
  <section>
    <div id="print_title">
      Mapping Offenbach
    </div>
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
      <ul>
        <li
          v-for="(color, user) in userColors"
          :key="user"
          :style="{ backgroundColor: color }"
        >
          <input type="checkbox" :id="user" v-model="userColors[user].checked" />
          <label :for="user">{{ user }}</label>
        </li>
        <li @click="toggleWords">
          <input type="checkbox" v-model="showWords" />Show Words
        </li>
      </ul>
    </header>
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
            :style="{
              color: userColors[item.user],
              fontSize: scaleFactor[index]+'em',
              maxWidth: scaleFactor[index]*20+'em',
            }"
          >
            <div v-html="item.words"></div>
            <span class="username">{{ item.user }}</span>
          </div>
          <div v-else v-if="showWords">
            {{ item.words }}
          </div>
        </span>
      </div>
    </div>
    <!-- <footer>
      <p>Current time: {{ currentTime }}</p>
    </footer> -->
  </section>
</template>

<script>
export default {
  name: "TextAudioPlayer",
  props: ["textsource", "audiosource", "hypothesissource"],
  data() {
    return {
      jsonData: null,
      currentTime: 0,
      annotations: null,
      userColors: {},
      isPlaying: false,
      showWords: true,
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
    scaleFactor() {
      const lastHighlightedIndex = this.currentWordIndices[
        this.currentWordIndices.length - 1
      ];
      return this.wordsWithAnnotations.map((item, index) => {
        const distance = Math.abs(index - lastHighlightedIndex);
        if (distance <= 3) {
          return 1.2 + (3 - distance) * 0.2; // Adjust the scaling factor as needed
        } else {
          return 1.2;
        }
      });
    },
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

          // Convert the annotation text from Markdown to HTML
          const text = marked(annotation.text);

          // Insert the annotation at the correct position in the combined array
          combined.splice(wordIndex, 0, {
            words: text,
            user: annotation.user_info
              ? annotation.user_info.display_name
              : annotation.user,
            isAnnotation: true,
          });
        }
      }

      return combined;
    },
  },
  methods: {
    toggleWords(event) {
      console.log(this.showWords);
      this.showWords = !this.showWords;
    },
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

    // Assign a color to each user from a predefined list of colors
    const colorList = ["#623CEA", "#FF715B", "#1EA896", "#a3bcf5", "#31E981", "#A36D90"];
    users.forEach((user, index) => {
      this.userColors[user] = colorList[index % colorList.length];
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
input[type="range"]::-webkit-slider-runnable-track {
  background: rgb(100, 100, 100);
  height: 1px;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  margin-top: -0.5em; /* Centers thumb on the track */
  //background-color: black;
  color: red;
  //height: 2rem;
  //width: 10rem;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: goldenrod;
  margin-top: -4px;
}


section {
  display: grid;
  justify-content: center;
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

  transition: all 0.3s ease; // Adjust the duration and easing function as needed
}

.annotation > div{
  max-width: 20em;
}
.annotation div{
  transition: all 1s ease; // Adjust the duration and easing function as needed

}



.annotation .username {
  font-size: 0.5em;
  font-family: "castledownDotted";
  display: none;
}

.word {
  margin-right: 0.25em;
}

img {
  display: block;
}
</style>
