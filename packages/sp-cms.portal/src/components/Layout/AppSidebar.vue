<template>
  <div class="sidebar">
    <div class="brand">
      <img src="@/assets/images/logo-5e.png" alt="" />
    </div>
    <div class="menu mt-8">
      <ul>
        <li>
          <router-link to="/blog">
            <Newspaper :stroke-width="1" :size="20" />
            <span class="pl-8">Blog</span>
          </router-link>
        </li>
        <li>
          <router-link to="/profile">
            <CircleUserRound :stroke-width="1" :size="20" />
            <span class="pl-8">Profile</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { Newspaper, CircleUserRound } from 'lucide-vue-next';
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 16rem;
  height: 100%;
  background-color: #fafafa;
  border-right: 1px solid #ebebeb;
  z-index: 50;
  display: flex;
  flex-direction: column;
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
  width: 16rem;
  padding: 8px 24px;
}
.sidebar .brand {
  padding: 8px 0;
}
.sidebar .brand h1 {
  font-size: 2rem;
  font-weight: 900;
  color: #313131;
  text-align: center;
  text-transform: uppercase;
}
.sidebar .brand img {
  max-height: 40px;
  object-fit: contain;
}
.sidebar .menu ul li {
  cursor: pointer;
  margin-bottom: 16px;
  letter-spacing: 2px;
  border-radius: 10px;
  position: relative;
}
.sidebar .menu ul li a {
  padding: 12px 16px;
  display: block;
  letter-spacing: 1.5px;
  border-radius: 10px;
  border: 1px solid #dedede;
  font-size: 14px;
}
.sidebar .menu ul li a svg.lucide {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 16px;
  /* width: 16px;
	 */
}
.sidebar .menu ul li a svg.lucide.icon-black {
  display: inline;
}
.sidebar .menu ul li a svg.lucide.icon-white {
  display: none;
}
.sidebar .menu ul li a svg.lucide img {
  width: 20px;
}
.sidebar .menu ul li a.router-link-exact-active,
.sidebar .menu ul li a.parent-active {
  border: 1px solid #313131;
  background: #313131;
  color: #fafafa;
}
.sidebar .menu ul li a:hover {
  border: 1px solid #313131;
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle {
  padding: 12px 16px;
  display: block;
  letter-spacing: 2px;
  border-radius: 10px;
  border: 1px solid #dedede;
  font-size: 14px;
  position: relative;
  cursor: pointer;
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle svg.lucide {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 16px;
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle .chevron {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle .chevron.rotated {
  transform: translateY(-50%) rotate(180deg);
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle.active,
.sidebar .menu ul li.dropdown-item .dropdown-toggle:hover {
  border: 1px solid #313131;
}
.sidebar .menu ul li.dropdown-item .dropdown-toggle.active {
  background: #313131;
  color: #fafafa;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu {
  margin-top: 8px;
  background-color: #fff;
  border-radius: 10px;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li {
  margin-bottom: 0;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a {
  padding: 8px 16px 8px 24px;
  font-size: 13px;
  border: 1px solid transparent;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a:before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 16px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #dedede;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a.parent-active {
  background: #f0f0f0;
  color: #313131;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a.parent-active:before {
  background-color: #313131;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a:hover {
  background: #f0f0f0;
  color: #313131;
}
.sidebar .menu ul li.dropdown-item .dropdown-menu li a:hover:before {
  background-color: #313131;
}
</style>
