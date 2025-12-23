<template>
  <div class="chart-card">
    <div class="card-title">고객 세그먼트</div>

    <div v-if="loading" class="chart-placeholder">
      <div class="hint">불러오는 중...</div>
    </div>

    <div v-else-if="error" class="chart-placeholder">
      <div class="hint">세그먼트 차트 데이터를 불러오지 못했습니다.</div>
      <div class="error">{{ error }}</div>
    </div>

    <div v-else-if="!hasData" class="chart-placeholder">
      <div class="hint">표시할 데이터가 없습니다.</div>
    </div>

    <v-chart v-else :option="option" autoresize class="chart" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

import VChart from "vue-echarts";
import { use } from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { getSegmentTradeChart } from "@/api/customeranalysis";

use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const route = useRoute();

const loading = ref(false);
const error = ref("");
const rows = ref([]);

// ✅ month: query.month 있으면 사용, 없으면 현재월
const month = computed(() => {
  const q = route.query.month;
  if (typeof q === "string" && /^\d{4}-\d{2}$/.test(q)) return q;

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

const hasData = computed(() => {
  if (!Array.isArray(rows.value) || rows.value.length === 0) return false;
  return rows.value.some((r) => (Number(r.customerCount) || 0) > 0 || (Number(r.totalTradeAmount) || 0) > 0);
});

const option = computed(() => {
  const labels = (rows.value ?? []).map((r) => r.segmentName ?? "Unknown");
  const customerCounts = (rows.value ?? []).map((r) => Number(r.customerCount) || 0);
  const totalSales = (rows.value ?? []).map((r) => Number(r.totalTradeAmount) || 0);
  const avgSales = (rows.value ?? []).map((r) => Number(r.avgTradeAmount) || 0);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => (Number(v) || 0).toLocaleString(),
    },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 45, containLabel: true },
    xAxis: { type: "category", data: labels },
    yAxis: [
      { type: "value", name: "고객수" },
      {
        type: "value",
        name: "매출(원)",
        axisLabel: {
          formatter: (v) => `${(Number(v) / 100000000).toFixed(0)}억`,
        },
      },
    ],
    series: [
      {
        name: "고객수",
        type: "bar",
        yAxisIndex: 0,
        data: customerCounts,
        itemStyle: { color: "#6366F1" },
        barMaxWidth: 26,
      },
      {
        name: "총매출",
        type: "bar",
        yAxisIndex: 1,
        data: totalSales,
        itemStyle: { color: "#A78BFA" },
        barMaxWidth: 26,
      },
      {
        name: "평균매출",
        type: "line",
        yAxisIndex: 1,
        data: avgSales,
        smooth: true,
        symbolSize: 6,
      },
    ],
  };
});

async function fetchChart() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get(
      // ✅ 보통 /api 로 시작해야 프록시/서버가 제대로 받음
      "/api/customersegmentanalysis/segmentTradeChart",
      { params: { month: month.value } }
    );

    rows.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = e?.response?.data?.message ?? e?.message ?? String(e);
    rows.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchChart);
watch(month, fetchChart);
</script>

<style scoped>
.chart-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.card-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 12px;
}

.chart {
  width: 100%;
  height: 280px;
}

.chart-placeholder {
  height: 280px;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.hint {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
}

.error {
  color: #ef4444;
  font-size: 12px;
  font-weight: 700;
}
</style>