<template>
    <nav class="navbar">
        <div class="navbar-container">
            <!-- Logo Section -->
            <div class="logo">
                <span>Logo</span>
            </div>

            <!-- Navigation Links -->
            <div class="nav-links">
                <router-link to="/" class="nav-item">Navbar</router-link>
                <router-link to="/katalog" class="nav-item">Katalog Produk</router-link>
                <router-link to="/tentang" class="nav-item">Tentang Kami</router-link>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: white;
    border: 2px solid #ccc;
    border-radius: 8px;
    margin: 10px;
    padding: 0;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    border: 2px solid #ccc;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: bold;
    color: #333;
}

.nav-links {
    display: flex;
    gap: 40px;
    align-items: center;
}

.nav-item {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.nav-item:hover {
    background-color: #f5f5f5;
}

.nav-item.router-link-active {
    color: #007bff;
    font-weight: bold;
}
</style>