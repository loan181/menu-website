<script setup>
import { computed } from 'vue'

import { menuData } from '../data'

const props = defineProps({
  ingredient: {
    type: Object,
    required: true
  },
  isExpandable: {
    type: Boolean,
    default: false
  },
  showCheckbox: {
    type: Boolean,
    default: false
  }
})

// defineModel is a great way to sync state between parent and child in Vue 3.4+
const checkedItems = defineModel('checkedItems')
const expandedItems = defineModel('expandedItems')

// Look up the unit automatically if it's not provided in the ingredient object
const unit = computed(() => {
  return props.ingredient.unit || menuData.ingredient_details[props.ingredient.item]?.unit || ''
})

// Helper to check if this specific ingredient is checked/expanded
const isChecked = computed(() => checkedItems.value.includes(props.ingredient.item))
const isExpanded = computed(() => expandedItems.value.includes(props.ingredient.item))

const toggleExpand = () => {
  if (!props.isExpandable) return
  
  if (isExpanded.value) {
    expandedItems.value = expandedItems.value.filter(i => i !== props.ingredient.item)
  } else {
    expandedItems.value.push(props.ingredient.item)
  }
}
</script>

<template>
  <li class="ingredient-item">
    <div class="ingredient-row">
      <!-- Checkbox (Optional) -->
      <input 
        v-if="showCheckbox"
        type="checkbox" 
        class="checkbox"
        :value="ingredient.item" 
        v-model="checkedItems"
      >
      
      <!-- Ingredient Text -->
      <div 
        @click="toggleExpand" 
        class="ingredient-text"
        :class="{ 'checked': isChecked, 'clickable': isExpandable }"
      >
        <span v-if="isExpandable" class="expand-arrow">
            {{ isExpanded ? '🔽' : '▶️' }}
        </span>
        {{ ingredient.totalQuantity || ingredient.quantity }} {{ unit }} {{ ingredient.item }}
      </div>
    </div>
    
    <!-- Optional Breakdown (Accordion) -->
    <Transition name="fade">
      <ul v-if="isExpandable && isExpanded" class="breakdown-list">
        <li v-for="source in ingredient.sources" :key="source.menuName">
          {{ source.menuName }}: {{ source.quantity }} {{ unit }}
        </li>
      </ul>
    </Transition>

  </li>
</template>

<style scoped>
.ingredient-item {
  border-bottom: 1px solid #333;
  padding: 0.75rem 0.5rem;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.checkbox {
  transform: scale(1.5);
  cursor: pointer;
}

.ingredient-text {
  flex-grow: 1;
  font-size: 1.1rem;
  user-select: none;
  color: #e0e0e0;
}

.clickable {
  cursor: pointer;
}

.expand-arrow {
  display: inline-block;
  width: 20px;
  font-size: 0.8rem;
}

.checked {
  text-decoration: line-through;
  color: #555 !important;
}

.breakdown-list {
  list-style: none;
  padding-left: 2rem;
  margin-top: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

/* Simple fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
