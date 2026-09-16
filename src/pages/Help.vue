<template>
  <div id="help-page">
    <div class="side-nav">
      <h2> Help Pages </h2>
      <br><br>

      <!-- For your page to be viewable add a link like these. Just replace the
         string in open() with a simple name for your page. -->
      <a @click="open('intro')"> Introduction </a>
      <a @click="open('play')"> Card Types</a>
      <a @click="open('game')"> Gameplay</a>

      <a
        class="back-home"
        @click="goHome()"
      >
        ← Back to Home
      </a>
    </div>

    <div class="help-content">
      <!-- These create components using the markdown in your markdown file
         for the page. Save the imported page into a data member and use it
         as the source. The text in isOpen() should be the name you used with
         your link in the nav list. -->
      <vue-markdown
        v-if="isOpen('intro')"
        :source="intro"
      />
      <vue-markdown
        v-if="isOpen('play')"
        :source="play"
      />
      <vue-markdown
        v-if="isOpen('game')"
        :source="game"
      />
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown-render'

// Loading your markdown file requires the 'raw-loader!' prefix to load the
// markdown as a string. Save the import into a data member so you can access it
// in the component.
import helpIntro from '@/markdown/helpIntro.md?raw'
import howToPlay from '@/markdown/howToPlay.md?raw'
import gameplay from  '@/markdown/gameplay.md?raw'



export default {
  name: 'HelpPage',
  components: {
    'vue-markdown': VueMarkdown
  },
  data () {
    return {
      page: 'intro',
      // Add your markdown page text to a member here
      intro: helpIntro,
      play: howToPlay,
      game: gameplay
    }
  },
  methods: {
    open (page) {
      this.page = page
      window.scrollTo(0, 0) // move content back to top
    },
    isOpen (page) {
      return this.page === page
    },
    goHome () {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
#help-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.side-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 20%;
  height: 100vh;
  padding: 1rem;
  color: white;
  background-color: #333333;
}

.side-nav a {
  display: block;
  font-size: 1.5rem;
}

.side-nav a:hover {
  color: #0077FF;
  cursor: pointer;
}

.side-nav .back-home {
  margin-top: 2.5rem;
  padding-top: 1rem;
  border-top: 1px solid #666;
  color: #9fd0ff;
  font-size: 1.25rem;
}

.side-nav .back-home:hover {
  color: #fff;
}

.help-content {
  position: absolute;
  top: 0;
  left: 20%;
  width: 80%;
  text-align: left;
  padding: 1rem 3rem;
}

/* Markdown-rendered card images are generated nodes, so :deep() is needed to
   size them down (they render at full size otherwise). */
.help-content :deep(img) {
  width: 6.5rem;
  height: auto;
  margin: 0.35rem 0.45rem 0.35rem 0;
  vertical-align: top;
  border-radius: 0.35rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
</style>
