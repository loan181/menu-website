<script setup>
import menuData from '../menu-data.json'
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
</template>
