<script setup>

import { onMounted, ref, watch } from 'vue'
import menuData from '../menu-data.json'
import MenuCell from './MenuCell.vue'

const selectedMeals = ref([])

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const myMealsString = params.get('meals');
    if (myMealsString) {
        selectedMeals.value = myMealsString.split(',').map(Number)
    }
    console.log("LSE", myMealsString)

})

watch(selectedMeals, (newSelectedMeals) => {
    window.history.pushState({}, '', '?meals=' + newSelectedMeals.join(','));
}, { deep: true })

const handleCellClick = (mealId) => {
    if (selectedMeals.value.includes(mealId)) {
        selectedMeals.value = selectedMeals.value.filter(id => id !== mealId);
    } else {
        selectedMeals.value.push(mealId);
    }
}
</script>

<template>
    <table border="1" cellpadding="5">
    <thead>
      <tr>
        <th>d20 \ d6</th>
        
        <!-- Now we print 1 to 6 across the top row -->
        <th v-for="d6 in 6" :key="'head-'+d6">
          {{ d6 }}
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- Now we loop 20 times downward for the rows -->
      <tr v-for="d20 in 20" :key="'row-'+d20">
        
        <!-- The row header is now the d20 -->
        <th>{{ d20 }}</th>
        
        <!-- We loop 6 times across for the columns -->
        <MenuCell 
            v-for="d6 in 6" :key="'cell-'+d6"
            :d6="d6" 
            :d20="d20" 
            :selectedMeals="selectedMeals"
            @cell-clicked="handleCellClick"
        />
      </tr>
    </tbody>
  </table>

  <h2>Ingredient list</h2>
  <div v-for="menu in menuData.menus" :key="menu.name">
        <h2>{{ menu.name }}</h2>
        <ul>
            <li v-for="ingredient in menu.ingredients" :key="ingredient.item">
                {{ ingredient.item }} - {{ ingredient.quantity }} {{ ingredient.unit }}
            </li>
        </ul>
    </div>
</template>
