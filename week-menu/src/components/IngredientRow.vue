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
const isChecked = computed(() => checkedItems.value?.includes(props.ingredient.item))
const isExpanded = computed(() => expandedItems.value?.includes(props.ingredient.item))

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
      <!-- Custom Checkbox -->
      <label v-if="showCheckbox" class="checkbox-container">
        <input 
          type="checkbox" 
          class="hidden-checkbox"
          :value="ingredient.item" 
          v-model="checkedItems"
        >
        <span class="checkmark"></span>
      </label>
      
      <!-- Ingredient Text -->
      <div 
        @click="toggleExpand" 
        class="ingredient-text"
        :class="{ 'checked': isChecked, 'clickable': isExpandable }"
      >
        <div class="main-info">
          <span v-if="isExpandable" class="expand-arrow" :class="{ rotated: isExpanded }">
            <svg viewBox="0 0 24 24" class="arrow-icon"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </span>
          <span class="quantity">{{ ingredient.totalQuantity || ingredient.quantity }} {{ unit }}</span>
          <span class="name">{{ ingredient.item }}</span>
        </div>
      </div>
    </div>
    
    <!-- Optional Breakdown (Accordion) -->
    <Transition name="expand">
      <div v-if="isExpandable && isExpanded" class="breakdown-wrapper">
        <ul class="breakdown-list">
          <li v-for="source in ingredient.sources" :key="source.menuName">
            <span class="source-name">{{ source.menuName }}</span>
            <span class="source-quantity">{{ source.quantity }} {{ unit }}</span>
          </li>
        </ul>
      </div>
    </Transition>

  </li>
</template>

<style scoped>
.ingredient-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 48px;
  padding: 0 0.5rem;
}

/* Custom Checkbox Styling */
.checkbox-container {
  display: block;
  position: relative;
  width: 22px;
  height: 22px;
  cursor: pointer;
  user-select: none;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 22px;
  width: 22px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: rgba(255, 159, 67, 0.1);
  border-color: rgba(255, 159, 67, 0.5);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #ff9f43;
  border-color: #ff9f43;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid #1a1a1a;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.ingredient-text {
  flex-grow: 1;
  user-select: none;
  transition: color 0.2s;
}

.main-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clickable {
  cursor: pointer;
}

.expand-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-arrow.rotated {
  transform: rotate(90deg);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  fill: #ff9f43;
}

.quantity {
  font-weight: 700;
  color: #ff9f43;
  min-width: 60px;
}

.name {
  color: #e2e8f0;
  font-weight: 400;
}

.checked .quantity,
.checked .name {
  text-decoration: line-through;
  color: #64748b !important;
  opacity: 0.6;
}

.breakdown-wrapper {
  overflow: hidden;
}

.breakdown-list {
  list-style: none;
  padding: 0.5rem 1rem 1rem 3.5rem;
  margin: 0;
  background: rgba(255, 255, 255, 0.01);
}

.breakdown-list li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.85rem;
  color: #94a3b8;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.breakdown-list li:last-child {
  border-bottom: none;
}

.source-name {
  font-style: italic;
}

.source-quantity {
  font-weight: 600;
}

/* Expansion transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
