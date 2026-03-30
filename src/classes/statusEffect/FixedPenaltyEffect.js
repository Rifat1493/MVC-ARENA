import StatusEffect from '@/classes/statusEffect/StatusEffect'

/**
 * Status effect that applies a fixed, permanent penalty.
 * @extends StatusEffect
 */
class FixedPenaltyEffect extends StatusEffect {
  /**
   * Creates a fixed penalty effect.
   * @param {string} type - The effect type.
   * @param {Player} player - The player affected.
   * @param {int} penalty - The penalty value to apply.
   */
  constructor (type, player, penalty) {
    super(type, player, -1, false)
    this.penalty = penalty
  }

  /**
   * Returns the fixed penalty.
   * @return {int} The penalty value.
   */
  getPenalty () {
    return this.penalty
  }
}

export default FixedPenaltyEffect
