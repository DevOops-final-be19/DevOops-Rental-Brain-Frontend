<template>
  <div class="risk-card">
    <div class="card-title">{{ title }}</div>

    <div v-if="loading" class="chart-placeholder">
      <div class="hint">불러오는 중...</div>
    </div>

    <div v-else-if="error" class="chart-placeholder">
      <div class="hint">이탈률 데이터를 불러오지 못했습니다.</div>
      <div class="error">{{ error }}</div>
    </div>

    <div v-else class="risk-wrap">
      <!-- 왼쪽: 차트 -->
      <v-chart :option="option" autoresize class="risk-chart" />

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import VChart from "vue-echarts";
import { use } from "echarts/core";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { getMonthlyRiskRate } from "@/api/customeranalysis";

use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps({
  title: { type: String, default: "월별 이탈률 추이" },
  months: { type: Number, default: 12 }, // 최근 N개월
});

const route = useRoute();
const loading = ref(false);
const error = ref("");
const rows = ref([]);

/** 최근 N개월 from/to (YYYY-MM) */
const range = computed(() => {
  // query로 덮어쓰기 가능하게
  const qFrom = route.query.from;
  const qTo = route.query.to;
  if (typeof qFrom === "string" && typeof qTo === "string") return { from: qFrom, to: qTo };

  const now = new Date();
  const toY = now.getFullYear();
  const toM = now.getMonth() + 1;

  const fromDate = new Date(now.getFullYear(), now.getMonth() - (props.months - 1), 1);
  const fromY = fromDate.getFullYear();
  const fromM = fromDate.getMonth() + 1;

  return {
    from: `${fromY}-${String(fromM).padStart(2, "0")}`,
    to: `${toY}-${String(toM).padStart(2, "0")}`,
  };
});

const labels = computed(() =>
  (rows.value ?? []).map((r) => {
    const s = String(r.snapshotMonth ?? r.month ?? "");
    // "2025-01" => "1월"
    const m = Number(s.slice(5, 7));
    return Number.isNaN(m) ? s : `${m}월`;
  })
);

const values = computed(() => (rows.value ?? []).map((r) => Number(r.riskRate ?? r.rate ?? 0) || 0));

const hasData = computed(() => values.value.some((v) => v > 0));


const option = computed(() => ({
  tooltip: {
    trigger: "axis",
    valueFormatter: (v) => `${v}%`,
  },
  grid: {
    left: 45,
    right: 20,
    top: 40,
    bottom: 30,
  },
  xAxis: {
    type: "category",
    data: labels.value,
    axisTick: { alignWithLabel: true },
  },
  yAxis: {
    type: "value",
    min: 0,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { type: "dashed" } },
  },
  series: [
  {
    name: "이탈률",
    type: "line",
    smooth: true,
    data: values.value,
    symbol: "circle",
    symbolSize: 8,

    // 🔴 기본 색
    lineStyle: {
      width: 3,
      color: "#ef4444",
    },
    itemStyle: {
      color: "#ef4444",
    },
    areaStyle: {
      color: "rgba(239,68,68,0.12)",
    },

    // ✅ 1️⃣ hover 시 강조 (emphasis)
    emphasis: {
      itemStyle: {
        color: "#b91c1c", // hover 시 더 진한 레드
      },
      lineStyle: {
        width: 4,
      },
    },

    // ✅ 2️⃣ 최고 이탈률 포인트 표시
    markPoint: {
      symbol: "pin",
      symbolSize: 50,
      label: {
        formatter: "{b}\n{c}%",
        fontWeight: "bold",
      },
      data: [
        { type: "max", name: "최고 이탈률" },
      ],
    },

    // ⚠️ 경고 기준선
    markLine: {
      symbol: "none",
      label: { fontSize: 11, fontWeight: 700 },
      data: [
        {
          yAxis: 10,
          lineStyle: { color: "#f59e0b", type: "dashed" },
          label: { formatter: "주의 10%" },
        },
        {
          yAxis: 15,
          lineStyle: { color: "#fb7185", type: "dashed" },
          label: { formatter: "경고 15%" },
        },
        {
          yAxis: 20,
          lineStyle: { color: "#dc2626", type: "solid" },
          label: { formatter: "위험 20%" },
        },
      ],
    },
  },
],
}));
const fetchData = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await getMonthlyRiskRate(range.value.from, range.value.to);
    // ✅ 현재 Summary에서 쓰는 형태: 배열
    rows.value = Array.isArray(res.data) ? res.data : (res.data?.monthly ?? []);
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
watch(range, fetchData);
</script>

<style scoped>
.risk-card {
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

.risk-chart {
  width: 100%;
  height: 320px;
}

/* 표 스타일 */
.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

/* placeholder */
.chart-placeholder {
  height: 320px;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.hint { color:#6b7280; font-size: 13px; font-weight: 700; }
.error { color:#ef4444; font-size: 12px; }

@media (max-width: 1100px) {
  .risk-wrap { grid-template-columns: 1fr; }
  .risk-chart { height: 300px; }
}
</style>