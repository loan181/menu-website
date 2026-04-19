<script setup>
import { computed } from 'vue'
import menuData from '../menu-data.json'

// 1. Define what data this cell receives from the parent Loop!
const props = defineProps(['d6', 'd20', 'selectedMeals'])

// 2. Define what messages this cell can yell back up to the parent!
const emit = defineEmits(['cell-clicked'])

// 3. DO THE MATH ONCE! Since d6 and d20 never change for this specific cell.
const cellId = ((props.d6 - 1) * 20) + props.d20;
const meal = menuData.menus.find(m => m.id === cellId);

// 4. Create a reactive variable that checks if the cell is currently selected
const isSelected = computed(() => {
    return props.selectedMeals.includes(cellId)
})

// 5. When clicked, tell the parent the ID!
const handleClick = () => {
    if (meal) {
        emit('cell-clicked', cellId)
    }
}
</script>

<template>
  <td @click="handleClick">
     {{ meal?.name || '' }}
     <span v-if="isSelected">✅</span>
  </td>
</template>
