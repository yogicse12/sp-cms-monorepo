<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #4a4a4a;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #4a4a4a;
  margin-right: 20px;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
