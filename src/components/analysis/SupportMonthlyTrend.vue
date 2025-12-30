<template>
  <BaseCard class="trend-card">
    <template #header>
      <h3 class="card-title">{{ title }}</h3>
    </template>

    <div v-if="loading" class="chart-placeholder">
      <div class="hint">불러오는 중...</div>
    </div>

    <div v-else-if="error" class="chart-placeholder">
      <div class="hint">트렌드 데이터를 불러오지 못했습니다.</div>
      <div class="error">{{ error }}</div>
    </div>

    <div v-else-if="!hasData" class="chart-placeholder">
      <div class="hint">트렌드 데이터가 없습니다.</div>
    </div>

    <v-chart
      v-else
      :option="option"
      autoresize
      class="chart"
      @click="onChartClick"
    />
  </BaseCard>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import BaseCard from "@/components/common/BaseCard.vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { getMonthlyTrend } from "@/api/customeranalysis";

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

defineProps({
  title: { type: String, default: "월별 응대 트렌드" },
});

/** ✅ 부모에게 "선택한 점" 전달 */
const emit = defineEmits(["select-point"]);

const route = useRoute();
const loading = ref(false);
const error = ref("");
const raw = ref(null);

/** ✅ 클릭된 점(월+타입) 상태 */
const selected = ref({ idx: -1, key: "" }); // idx:0~11, key: quote|support|feedback|survey

const year = computed(() => {
  const qYear = Number(route.query.year);
  if (!Number.isNaN(qYear) && qYear > 2000) return qYear;

  const m = String(route.query.month ?? "2025-02");
  const y = Number(m.slice(0, 4));
  return Number.isNaN(y) ? 2025 : y;
});

const monthLabels = computed(() =>
  Array.from({ length: 12 }, (_, i) => `${i + 1}월`)
);

const seriesData = computed(() => {
  const init = {
    quote: Array(12).fill(0),
    support: Array(12).fill(0),
    feedback: Array(12).fill(0),
    survey: Array(12).fill(0),
  };

  const r = raw.value;
  if (!r || !Array.isArray(r.monthly)) return init;

  r.monthly.forEach((row) => {
    const m = Number(row.month);
    const idx = m ? m - 1 : -1;
    if (idx < 0 || idx > 11) return;

    init.quote[idx] = Number(row.quoteCount ?? 0) || 0;
    init.support[idx] = Number(row.SupportCount ?? row.supportCount ?? 0) || 0; // 대문자 S 방어
    init.feedback[idx] = Number(row.feedbackCount ?? 0) || 0;
    init.survey[idx] = Number(row.surveyCount ?? 0) || 0;
  });

  return init;
});

const hasData = computed(() => {
  const s = seriesData.value;
  return [...s.quote, ...s.support, ...s.feedback, ...s.survey].some((v) => Number(v) > 0);
});

const option = computed(() => {
  const s = seriesData.value;
  const selIdx = selected.value.idx;
  const selKey = selected.value.key;

  const makeLine = (name, key, data) => ({
    name,
    type: "line",
    smooth: true,
    data,
    symbol: "circle",
    symbolSize: (value, params) =>
      params.dataIndex === selIdx && key === selKey ? 14 : 8,
    emphasis: {
      focus: "series",
      itemStyle: { shadowBlur: 12, shadowColor: "rgba(0,0,0,0.25)" },
      lineStyle: { width: 3 },
    },
  });

  const effect = [];
  if (selIdx >= 0 && selKey) {
    const y =
      selKey === "quote"
        ? s.quote[selIdx]
        : selKey === "support"
        ? s.support[selIdx]
        : selKey === "feedback"
        ? s.feedback[selIdx]
        : s.survey[selIdx];

    effect.push({
      name: "selected",
      type: "effectScatter",
      zlevel: 10,
      coordinateSystem: "cartesian2d",
      data: [{ value: [monthLabels.value[selIdx], Number(y ?? 0) || 0] }],
      rippleEffect: { brushType: "stroke", scale: 3.2, period: 2.6 },
      symbolSize: 18,
      tooltip: { show: false },
    });
  }

  return {
    tooltip: { trigger: "axis" },
    legend: {
      bottom: 0,
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 45, right: 20, top: 40, bottom: 55 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthLabels.value,
      axisTick: { alignWithLabel: true },
    },
    yAxis: { type: "value", min: 0, splitLine: { lineStyle: { type: "dashed" } } },
    series: [
      makeLine("견적상담", "quote", s.quote),
      makeLine("문의", "support", s.support),
      makeLine("피드백", "feedback", s.feedback),
      makeLine("설문조사", "survey", s.survey),
      ...effect,
    ],
  };
});

const fetchTrend = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await getMonthlyTrend(year.value);
    raw.value = res.data;
  } catch (e) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
};

const seriesNameToKey = (name) => {
  if (name === "견적상담") return "quote";
  if (name === "문의") return "support";
  if (name === "피드백") return "feedback";
  if (name === "설문조사") return "survey";
  return "";
};

const onChartClick = (params) => {
  const idx = Number(params?.dataIndex);
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return;

  const key = seriesNameToKey(params?.seriesName ?? "");
  if (!key) return;

  selected.value = { idx, key };

  const mm = String(idx + 1).padStart(2, "0");
  const ym = `${year.value}-${mm}`;

  emit("select-point", { ym, key });
};

onMounted(fetchTrend);
watch(year, () => {
  selected.value = { idx: -1, key: "" };
  fetchTrend();
});
</script>

<style scoped>
.trend-card { width: 100%; }
.card-title { margin: 0; font-size: 14px; font-weight: 900; color: #111827; }
.chart { width: 100%; height: 320px; }
.chart-placeholder {
  height: 320px; border: 1px dashed #e5e7eb; border-radius: 10px;
  display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;
  background: #fafafa;
}
.hint { color: #6b7280; font-size: 13px; font-weight: 700; }
.error { color: #ef4444; font-size: 12px; font-weight: 800; }
</style>
