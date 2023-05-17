<script lang="ts" setup>
import { computed } from "vue"
import { lastConfig } from "../config"
import PostJson from "~/res/docs.json"

const postLimit = 7

const postList = computed(() => PostJson.reverse().slice(0, postLimit))
</script>

<template>
  <div class="container mx-auto">
    <main>
      <section>
        <h1>Welcome</h1>
        <p>my personal blog site.</p>
      </section>
      <section>
        <h2>Recently</h2>
        <ul>
          <li v-for="post in postList">
            {{ post.title }}
          </li>
        </ul>
      </section>
      <section>
        <h2>Last<span class="ml-2">but not least</span></h2>
        <ul>
          <li v-for="item in lastConfig">
            <a :href="item.link">{{ item.text }}</a>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
