<script setup>

import { onMounted, ref, watch } from 'vue'
import menuData from '../menu-data.json'

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

const getMealUsingId = (d6, d20) => {
    const targetId = ((d6 - 1) * 20) + d20;
    return menuData.menus.find(menu => menu.id === targetId);
}

const handleCellClick = (d6, d20) => {
    const meal = getMealUsingId(d6, d20);
    if (meal) {
        selectedMeals.value.push(meal.id);
    }
}
</script>

<template>
    <div v-for="menu in menuData.menus" :key="menu.name">
        <h2>{{ menu.name }}</h2>
        <ul>
            <li v-for="ingredient in menu.ingredients" :key="ingredient.item">
                {{ ingredient.item }} - {{ ingredient.quantity }} {{ ingredient.unit }}
            </li>
        </ul>
    </div>

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
        <td v-for="d6 in 6" :key="'cell-'+d6" @click="handleCellClick(d6, d20)">
           
           <!-- We pass d6 and d20 to your formula exactly like before! -->
           {{ getMealUsingId(d6, d20)?.name || '' }}
           
        </td>
      </tr>
    </tbody>
  </table>
</template>
