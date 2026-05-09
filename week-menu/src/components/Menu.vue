<script setup>

import { computed, onMounted, ref, watch } from 'vue'
import { menuData } from '../data'
import MenuCell from './MenuCell.vue'
import IngredientRow from './IngredientRow.vue'

const selectedMeals = ref([])
const expandedIngredients = ref([]);
const checkedIngredients = ref([]);
const activeD6 = ref(1); // Default to column 1 on mobile


onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const myMealsString = params.get('meals');
    if (myMealsString) {
        selectedMeals.value = myMealsString.split(',').map(Number)
    }
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
  <div class="menu-container">
    <div class="table-controls mobile-only">
      <p class="control-label">Choisissez un dé (d6) :</p>
      <div class="tabs">
        <button 
          v-for="d6 in 6" 
          :key="'tab-'+d6"
          :class="['tab-btn', { active: activeD6 === d6 }]"
          @click="activeD6 = d6"
        >
          {{ d6 }}
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="menu-table">
        <thead>
          <tr>
            <th class="sticky-col">d20 \ d6</th>
            <th 
              v-for="d6 in 6" 
              :key="'head-'+d6"
              :class="{ 'mobile-hidden': activeD6 !== d6 }"
            >
              {{ d6 }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d20 in 20" :key="'row-'+d20">
            <th class="sticky-col d20-label">{{ d20 }}</th>
            <MenuCell 
                v-for="d6 in 6" :key="'cell-'+d6"
                :d6="d6" 
                :d20="d20" 
                :selectedMeals="selectedMeals"
                :class="{ 'mobile-hidden': activeD6 !== d6 }"
                @cell-clicked="handleCellClick"
            />
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="container">
    <div v-if="selectedMeals.length > 0">
      <h2>🛒 Liste de courses</h2>
      
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

    <div v-if="selectedMenusData.length > 0">
      <h2>🍽️ Menus sélectionnés</h2>
      <div v-for="menu in selectedMenusData" :key="menu.name" class="selected-menu-item">
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

    <div v-if="selectedMeals.length === 0" class="empty-state">
      <p>Cliquez sur les cases du tableau pour composer votre menu !</p>
    </div>
  </div>

</template>

<style scoped>
.menu-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.menu-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #e2e8f0;
}

.menu-table th, .menu-table td {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  min-width: 120px;
}

.menu-table thead th {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.sticky-col {
  position: sticky;
  left: 0;
  background: #1a1a1a !important;
  z-index: 10;
  border-right: 2px solid rgba(255, 255, 255, 0.1) !important;
  min-width: 60px !important;
}

.d20-label {
  font-weight: bold;
  color: #ff9f43;
}

/* Tabs for mobile */
.table-controls {
  margin-bottom: 1.5rem;
  text-align: center;
}

.control-label {
  font-size: 0.9rem;
  color: #a6adc8;
  margin-bottom: 0.75rem;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.tab-btn.active {
  background: #ff9f43;
  color: #1a1a1a;
  border-color: #ff9f43;
  box-shadow: 0 0 15px rgba(255, 159, 67, 0.4);
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: block;
  }
  
  .mobile-hidden {
    display: none;
  }

  .menu-table th, .menu-table td {
    min-width: unset;
    width: 100%;
  }

  .sticky-col {
    width: 40px !important;
    min-width: 40px !important;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h2 {
  color: #ff9f43;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  margin-top: 3rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ingredient-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.ingredient-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-header {
  color: #ff9f43;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.selected-menu-item {
  margin-bottom: 2.5rem;
}

.menu-title {
  color: #f3f4f6;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 4px solid #ff9f43;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #a6adc8;
  font-style: italic;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
}

:global(body) {
  background-color: #0f172a;
  color: #f1f5f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>

