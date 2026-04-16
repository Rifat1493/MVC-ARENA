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
        <div
          class="modal-header"
          style="border: none"
        > 
          <h2
            class="modal-title"
            style="border-radius: 1rem;"
          >
            In the not too distant future...
          </h2>
        </div>

        <div class="modal-body">
          <p style="font-size: 1.3rem; text-align: left;">
            MVC-ARENA drops players into a futuristic world where coding is the ultimate weapon. 
            In a time when machines dominate through superior programming, humans must rely on strategy, logic, and 
            efficient design patterns to compete and survive.
            <br>
            <br>
          As part of the resistance, players use MVC principles to outmaneuver opponents, optimize their decisions, and 
          reclaim control one challenge at a time. Every move is a balance between attack, defense, and smart resource management—turning 
          coding knowledge into a competitive advantage in the fight to restore human freedom.
          </p>
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
 * Modal for displaying the games backstory.
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

h2 {
  padding: 0;
  margin: 0;
}
</style>
