<template>
    <el-card>
        <div class="card">
        <span class="title">{{ title }}</span>
        <h2>{{ value }}건</h2>
        <small>{{ sub }}</small>
        </div>
    </el-card>
</template>

<script setup>
defineProps({
    title: String,
    value: Number,
    sub: String,
    type: String
})
</script>

<style scoped>
.card {
    text-align: center;
}
.title {
    color: #666;
}
</style>
