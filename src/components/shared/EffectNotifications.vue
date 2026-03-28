<template>
  <div
    v-if="showing"
    id="effect-notifications"
  >
    <img
      class="icon highlight"
      :src="imagePath"
    >
  </div>
  <div
    v-if="showingCollision"
    id="collision-notification"
  >
    <div class="collision-stage">
      <img
        class="collision-card left"
        :src="collisionLeft"
      >
      <div class="collision-message">
        {{ collisionMessage }}
      </div>
      <img
        class="collision-card right"
        :src="collisionRight"
      >
    </div>
  </div>
</template>


<script>
import { bus } from '@/components/shared/Bus'
import { mapGetters } from 'vuex'

/**
 * Responds to effect events to breifly display an icon in the center of the
 * screen to help make users aware of the effect.
 *
 * ### Events to Respond to
 * - `mimic-played` - Shows a `trojan` icon to let the player know that the card
 * that was played was a mimic.
 * - `scan-used` - Shows a scan icon to let the player know when an attack was
 * blocked by a scan.
 *
 * @vue-data {bool} showing - True if an effect icon should be visible.
 * @vue-data {string} imgPath - A path to the image icon to show.
 * @vue-data {int} timeout - The time in milliseconds to keep the icon visible for
 * when it is shown.
 */
export default {
  name: 'EffectNotifications',
  data () {
    return {
      showing: false,
      imagePath: 'static/cardImages/effects/SCAN.png',
      timeout: 1000,
      showingCollision: false,
      collisionLeft: '',
      collisionRight: '',
      collisionMessage: '',
      collisionTimeout: 4800
    }
  },
  computed: {
    ...mapGetters(['game'])
  },
  created () {
    // Add listeners for the effect events
    bus.on('mimic-played', this.mimicPlayed)
    bus.on('scan-used', this.scanUsed)
    bus.on('attack-blocked', this.attackBlocked)
  },
  beforeUnmount () {
    // Remove listeners for the events before the module is destroyed
    bus.off('mimic-played', this.mimicPlayed)
    bus.off('scan-used', this.scanUsed)
    bus.off('attack-blocked', this.attackBlocked)
  },
  methods: {
    /**
     * Shows the `trojan` icon for `timeout` milliseconds.
     */
    mimicPlayed () {
      this.showing = true
      this.imagePath = 'static/cardImages/effects/TROJAN.png'
      setTimeout(() => { this.showing = false }, this.timeout)
    },
    /**
     * Shows the `scan` icon for `timeout` milliseconds.
     */
    scanUsed () {
      this.showing = true
      this.imagePath = 'static/cardImages/effects/SCAN.png'
      setTimeout(() => { this.showing = false }, this.timeout)
    },
    /**
     * Shows a collision animation for a blocked attack.
     * @param {Object} payload - The collision payload.
     */
    attackBlocked (payload) {
      this.showingCollision = true
      this.collisionLeft = payload.defenseImage
      this.collisionRight = payload.attackImage
      this.collisionMessage = payload.message
      setTimeout(() => { this.showingCollision = false }, this.collisionTimeout)
    }
  }
}
</script>


<style scoped>
#effect-notifications {
  position: absolute;
  top: 35%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 100;
}

.icon {
  width: 20%;
}

.highlight {
  -webkit-box-shadow: 0 0 1rem 3rem rgba(255,255,0,1);
  -moz-box-shadow: 0 0 1rem 3rem rgba(255,255,0,1);
  box-shadow: 0 0 1rem 3rem rgba(255,255,0,1);
  border-radius: 2rem;
}

#collision-notification {
  position: absolute;
  top: 26%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 120;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.collision-stage {
  position: relative;
  width: 70%;
  height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collision-card {
  width: 6.4rem;
  height: auto;
  position: absolute;
  top: 0.8rem;
  filter: drop-shadow(0 0 0.6rem rgba(255, 214, 0, 0.6));
}

.collision-card.left {
  left: 0;
  animation: collide-left 2.2s ease-out;
}

.collision-card.right {
  right: 0;
  animation: collide-right 2.2s ease-out;
}

.collision-message {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 0.9rem rgba(0,0,0,0.85);
  background: rgba(244, 10, 10, 0.94);
  padding: 0.5rem 1rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 214, 0, 0.6);
  animation: message-pop 3.6s ease-out;
}

@keyframes collide-left {
  0% { transform: translateX(-8rem) rotate(-12deg); opacity: 0; }
  45% { transform: translateX(16rem) rotate(4deg); opacity: 1; }
  60% { transform: translateX(16rem) rotate(2deg) scale(1.06); }
  80% { transform: translateX(14rem) rotate(-3deg) scale(0.98); opacity: 1; }
  100% { transform: translateX(14rem) rotate(-2deg); opacity: 0; }
}

@keyframes collide-right {
  0% { transform: translateX(8rem) rotate(12deg); opacity: 0; }
  45% { transform: translateX(-16rem) rotate(-4deg); opacity: 1; }
  60% { transform: translateX(-16rem) rotate(-2deg) scale(1.06); }
  80% { transform: translateX(-14rem) rotate(3deg) scale(0.98); opacity: 1; }
  100% { transform: translateX(-14rem) rotate(2deg); opacity: 0; }
}

@keyframes message-pop {
  0% { transform: scale(0.9); opacity: 0; }
  20% { transform: scale(1.02); opacity: 1; }
  80% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(0.98); opacity: 0; }
}

</style>

