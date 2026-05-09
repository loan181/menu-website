<script setup>
import { computed } from 'vue'
import { menuData } from '../data'

const props = defineProps(['d6', 'd20', 'selectedMeals'])
const emit = defineEmits(['cell-clicked'])

const cellId = ((props.d6 - 1) * 20) + props.d20;
const meal = menuData.menus.find(m => m.id === cellId);

const isSelected = computed(() => {
    return props.selectedMeals.includes(cellId)
})

const handleClick = () => {
    if (meal) {
        emit('cell-clicked', cellId)
    }
}
</script>

<template>
  <td 
    :class="['menu-cell', { selected: isSelected }]" 
    @click="handleClick"
  >
    <div class="cell-content">
      <span class="meal-name">{{ meal?.name || '' }}</span>
      <div v-if="isSelected" class="selection-badge">
        <svg viewBox="0 0 24 24" class="check-icon">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
    </div>
  </td>
</template>

<style scoped>
.menu-cell {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: transparent;
  vertical-align: middle;
}

.menu-cell:hover {
  background: rgba(255, 159, 67, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 159, 67, 0.3);
}

.menu-cell.selected {
  background: rgba(255, 159, 67, 0.15);
  box-shadow: inset 0 0 0 2px #ff9f43;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
}

.meal-name {
  font-size: 0.9rem;
  line-height: 1.3;
  color: #f1f5f9;
  font-weight: 500;
}

.selection-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff9f43;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.check-icon {
  width: 12px;
  height: 12px;
  fill: #1a1a1a;
}

@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .meal-name {
    font-size: 0.85rem;
  }
  
  .menu-cell {
    padding: 15px 10px;
  }
}
</style>
