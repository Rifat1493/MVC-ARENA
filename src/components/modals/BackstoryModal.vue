<template>
  <div
    id="rules-modal"
    style="color: initial;"
  >
    <div
      class="modal-dialog"
      role="document"
      data-backdrop="static"
      data-keyboard="false"
    >
      <div class="modal-content my-content">
        <div class="modal-body">
          <div class="video-wrap">
            <iframe
              src="https://www.youtube.com/embed/JmkWBqwVZxA"
              title="MVC-ARENA gameplay"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
          </div>
        </div>

        <div
          class="modal-footer"
          style="border: none"
        >
          <button
            class="btn btn-primary"
            data-dismiss="modal"
            style="float: right; margin: 1rem;"
          >
            Let's go!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Modal for displaying the game intro video.
 */
export default {
  name: 'BackstoryModal'
}
</script>

<style scoped>
.my-content {
  position: fixed;
  width: 60%;
  top: 5%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  border-radius: 2em;
}

.video-wrap {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 0.75rem;
}

.video-wrap iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
