<template>
  <div class="chart-card">
    <h3>분기별 고객 수</h3>
    <v-chart :option="option" autoresize class="chart" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import VChart from "vue-echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { use } from "echarts/core";

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const option = ref({
  tooltip: {},
  legend: { bottom: 0 },
  xAxis: { data: ["1분기", "2분기", "3분기", "4분기"] },
  yAxis: {},
  series: [
    { name: "전체 고객", type: "line", data: [50, 80, 100, 110], smooth: true },
    { name: "신규 고객", type: "line", data: [20, 40, 60, 70], smooth: true },
  ]
});
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  min-height: 360px;
}

.chart-card h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.chart {
  width: 100%;
  height: 280px; /* 260보다 약간 키워도 카드 높이 통일됨 */
}
</style>