<script setup>

import { computed, onMounted, ref, watch } from 'vue'
import menuData from '../menu-data.json'
import MenuCell from './MenuCell.vue'

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

const getIngredientUnit = (itemName) => {
    return menuData.ingredient_details[itemName]?.unit || '';
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
  
  <!-- OUTER LOOP: Loop through each Category -->
  <div v-for="category in groupedIngredientsByCategory" :key="category.name">
    
    <!-- The little headline for the category -->
    <h3 class="category-header">{{ category.name }}</h3>
    
    <div class="ingredient-card">
      <ul class="ingredient-list">
        
        <!-- INNER LOOP: Loop through ingredients in this category -->
        <li v-for="ingredient in category.ingredients" :key="ingredient.item" class="ingredient-item">
          
          <div class="ingredient-row">
            <input type="checkbox" class="checkbox" :value="ingredient.item" v-model="checkedIngredients">
            
            <div @click="toggleIngredient(ingredient.item)" 
                 class="ingredient-text"
                 :class="{ 'checked': checkedIngredients.includes(ingredient.item) }">
                <span>{{ expandedIngredients.includes(ingredient.item) ? '🔽' : '▶️' }}</span>
                {{ ingredient.totalQuantity }} {{ ingredient.unit }} {{ ingredient.item }}
            </div>
          </div>
          
          <!-- Breakdown -->
          <ul v-if="expandedIngredients.includes(ingredient.item)" class="breakdown-list">
              <li v-for="source in ingredient.sources" :key="source.menuName">
                  {{ source.menuName }}: {{ source.quantity }} {{ ingredient.unit }}
              </li>
          </ul>
          
        </li>
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
                <li v-for="ingredient in menu.ingredients" 
                    :key="ingredient.item"
                    class="ingredient-item"
                    :class="{ 'checked': checkedIngredients.includes(ingredient.item) }">
                    
                    {{ ingredient.item }} - {{ ingredient.quantity }} {{ getIngredientUnit(ingredient.item) }}
                    
                </li>

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
  min-height: 44px; /* Minimum height for mobile touch targets! */
}

.checkbox {
  transform: scale(2.5); 
}

.ingredient-text {
  flex-grow: 1;
  font-size: 1.1rem;
  cursor: pointer;
  user-select: none;
}

.checked {
  text-decoration: line-through;
  color: #666 !important;
}

.breakdown-list {
  list-style: none;
  padding-left: 2rem;
  margin-top: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.menu-title {
  color: #a6adc8;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}
.checked {
  text-decoration: line-through;
  color: #555 !important;
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

:global(body) {
  background-color: #121212;
  margin: 0;
  color: white;
}
</style>
