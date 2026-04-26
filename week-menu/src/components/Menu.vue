<script setup>

import { computed, onMounted, ref, watch } from 'vue'
import { menuData } from '../data'
import MenuCell from './MenuCell.vue'
import IngredientRow from './IngredientRow.vue'

const selectedMeals = ref([])
const expandedIngredients = ref([]);
const checkedIngredients = ref([]);


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

const selectedMenusData = computed(() => {
    return menuData.menus.filter(menu => selectedMeals.value.includes(menu.id))
})

const groupedIngredientsByCategory = computed(() => {
    const categoryMap = new Map();

    selectedMenusData.value.forEach(menu => {
        menu.ingredients.forEach(ingredient => {
            const itemName = ingredient.item;
            
            const details = menuData.ingredient_details[itemName] || { category: 'Autres', unit: '?' };
            const catName = details.category;

            if (!categoryMap.has(catName)) {
                categoryMap.set(catName, new Map());
            }
            
            const itemMap = categoryMap.get(catName);
            
            if (!itemMap.has(itemName)) {
                itemMap.set(itemName, {
                    item: itemName,
                    totalQuantity: 0,
                    unit: details.unit,
                    sources: []
                });
            }
            
            const currentItem = itemMap.get(itemName);
            currentItem.totalQuantity += ingredient.quantity;
            currentItem.sources.push({
                menuName: menu.name,
                quantity: ingredient.quantity
            });
        });
    });

    return Array.from(categoryMap.entries()).map(([name, itemMap]) => ({
        name,
        ingredients: Array.from(itemMap.values())
    }));
});


const toggleIngredient = (itemName) => {
    if (expandedIngredients.value.includes(itemName)) {
        expandedIngredients.value = expandedIngredients.value.filter(i => i !== itemName);
    } else {
        expandedIngredients.value.push(itemName);
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

  <div class="container">
    <h2>Aggregated Ingredient List</h2>
    
    <div v-for="category in groupedIngredientsByCategory" :key="category.name">
      <h3 class="category-header">{{ category.name }}</h3>
      <div class="ingredient-card">
        <ul class="ingredient-list">
          <IngredientRow 
            v-for="ingredient in category.ingredients" 
            :key="ingredient.item"
            :ingredient="ingredient"
            :is-expandable="true"
            :show-checkbox="true"
            v-model:checkedItems="checkedIngredients"
            v-model:expandedItems="expandedIngredients"
          />
        </ul>
      </div>
    </div>
  </div>




  <div class="container">
    <h2>Selected ingredient list</h2>
    <div v-for="menu in selectedMenusData" :key="menu.name" style="margin-bottom: 2rem;">
      <h3 class="menu-title">{{ menu.name }}</h3>
      <div class="ingredient-card">
        <ul class="ingredient-list">
          <IngredientRow 
            v-for="ingredient in menu.ingredients" 
            :key="ingredient.item"
            :ingredient="ingredient"
            v-model:checkedItems="checkedIngredients"
          />
        </ul>
      </div>
    </div>
  </div>

</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  color: #ff9f43;
  border-bottom: 2px solid #333;
  padding-bottom: 0.5rem;
  margin-top: 2rem;
}

.ingredient-card {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.ingredient-list {
  list-style: none; /* Removes the dots */
  padding: 0;
  margin: 0;
}

.category-header {
  color: #ff9f43;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.7;
  padding-left: 0.5rem;
}

.menu-title {
  color: #a6adc8;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

:global(body) {
  background-color: #121212;
  margin: 0;
  color: white;
}
</style>
