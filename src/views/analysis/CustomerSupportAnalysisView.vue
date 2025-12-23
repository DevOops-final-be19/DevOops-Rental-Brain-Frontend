<template>
  <div class="page-container">
    <!-- 헤더 -->
    <div class="header-row">
      <div class="title-area">
        <h2 class="page-title">고객 응대 분석</h2>
        <p class="page-subtitle">
          견적, 문의, 피드백 데이터를 기반으로 고객 응대 효율과 품질을 분석합니다.
        </p>
      </div>
    </div>

    <!-- KPI 3개 -->
    <div class="kpi-row-3">
      <!-- 1) 총 응대 건수 -->
      <div class="card kpi-card">
        <div class="kpi-head">
          <div>
            <div class="kpi-title">{{ kpi?.totalResponseCard?.title ?? "총 응대 건수" }}</div>
            <div class="kpi-value">{{ fmt(totalCurrent) }}건</div>
          </div>
        </div>

        <div class="kpi-subtitle">
          {{ kpi?.totalResponseCard?.subtitle ?? "전월 대비 변화 (유형별)" }}
        </div>

        <!-- ✅ 한 줄 = 한 타입 (누적 + 증감 + %) -->
        <div class="type-list">
          <div v-for="t in mergedTypeRows" :key="t.type" class="type-row">
            <span class="type-left">
              <span class="type-label">{{ typeLabel(t.type) }}</span>
              <span class="type-total">{{ fmt(t.ytdCount) }}건</span>
            </span>

            <span class="type-delta">
              <span class="count" :class="t.deltaCount >= 0 ? 'up' : 'down'">
                {{ t.deltaCount >= 0 ? "+" : "" }}{{ t.deltaCount }}건
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 2) 응대 처리 효율 -->
      <div class="card kpi-card">
        <div class="kpi-head">
          <div>
            <div class="kpi-title">응대 처리 완료율</div>
            <div class="kpi-value">{{ round1(kpi?.efficiency?.completionRate) }}%</div>
          </div>
        </div>

        <div class="split-line"></div>

        <div class="metric-row">
          <span class="metric-label">평균 응대 시간</span>
          <span class="metric-value">{{ fmtHours(kpi?.efficiency?.avgResponseTime) }}</span>
        </div>

        <div class="metric-sub">
          <span :class="(kpi?.efficiency?.avgResponseTimeMomPercent ?? 0) <= 0 ? 'up' : 'down'">
            전월 대비 {{ Math.abs(round1(kpi?.efficiency?.avgResponseTimeMomPercent)) }}%
            {{ (kpi?.efficiency?.avgResponseTimeMomPercent ?? 0) <= 0 ? "단축" : "증가" }}
          </span>
        </div>
      </div>

      <!-- 3) 고객 만족도 지수 -->
      <div class="card kpi-card">
        <div class="kpi-head">
          <div>
            <div class="kpi-title">고객 만족도 지수</div>
            <div class="kpi-value">{{ round1(kpi?.satisfaction?.avgScore) }}점</div>
          </div>
        </div>

        <div class="metric-sub">
          <span :class="(kpi?.satisfaction?.avgScoreMom ?? 0) >= 0 ? 'up' : 'down'">
            전월 대비 {{ (kpi?.satisfaction?.avgScoreMom ?? 0) >= 0 ? "+" : "" }}
            {{ round1(kpi?.satisfaction?.avgScoreMom) }}점
          </span>
        </div>

        <!-- (옵션) 저평점 비중 -->
        <div class="small-box">
          <div class="metric-row">
            <span class="metric-label">저평점(≤2.5) 비중</span>
            <span class="metric-value">{{ round1(kpi?.satisfaction?.lowScoreRatio) }}%</span>
          </div>
          <div class="metric-sub">
            <span :class="(kpi?.satisfaction?.lowScoreRatioMomP ?? 0) <= 0 ? 'up' : 'down'">
              전월 대비 {{ (kpi?.satisfaction?.lowScoreRatioMomP ?? 0) >= 0 ? "+" : "" }}
              {{ round1(kpi?.satisfaction?.lowScoreRatioMomP) }}%p
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 차트 영역 -->
    <div class="grid-2">
      <SupportMonthlyTrend />
    </div>

    <!-- 하단 3개 mock -->
    <SupportInsightMock />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getCustomerSupportKpi } from "@/api/customeranalysis";
import SupportMonthlyTrend from "@/components/analysis/SupportMonthlyTrend.vue";
import SupportInsightMock from "@/components/analysis/SupportInsightMock.vue";

const route = useRoute();

const now = new Date();
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

const month = computed(() => route.query.month ?? defaultMonth);
const kpi = ref(null);

const fetchKpi = async () => {
  const res = await getCustomerSupportKpi(month.value);
  kpi.value = res.data;
};

onMounted(fetchKpi);
watch(month, fetchKpi);

/** typeStats (이번달 증감) */
const typeRows = computed(() =>
  (kpi.value?.totalResponseCard?.typeStats ?? []).filter((x) => x && x.type)
);

/** ✅ 누적(YTD) + 증감(typeStats) 합치기 */
const mergedTypeRows = computed(() => {
  const c = kpi.value?.totalResponseCard;
  if (!c) return [];

  const ytdMap = {
    QUOTE: Number(c.ytdQuote ?? 0) || 0,
    INQUIRY: Number(c.ytdInquiry ?? 0) || 0,
    FEEDBACK: Number(c.ytdFeedback ?? 0) || 0,
  };

  // typeStats 기준으로 렌더링(없으면 0으로)
  const stats = typeRows.value.length
    ? typeRows.value
    : [{ type: "QUOTE" }, { type: "INQUIRY" }, { type: "FEEDBACK" }];

  return stats.map((s) => ({
    type: s.type,
    ytdCount: ytdMap[s.type] ?? 0,
    currentCount: Number(s.currentCount ?? 0) || 0,
    previousCount: Number(s.previousCount ?? 0) || 0,
    deltaCount: Number(s.deltaCount ?? 0) || 0,
    momPercent: Number(s.momPercent ?? 0) || 0,
  }));
});

/** 총 응대 건수는 "이번달(currentCount)" 합계 */
const totalCurrent = computed(() =>
  mergedTypeRows.value.reduce((sum, r) => sum + (Number(r.currentCount) || 0), 0)
);

const fmt = (n) => (Number(n) || 0).toLocaleString();
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const fmtHours = (minutesLike) => {
  const v = Number(minutesLike) || 0;
  if (v <= 24) return `${round1(v)}시간`;
  return `${round1(v / 60)}시간`;
};

const typeLabel = (t) => {
  if (t === "QUOTE") return "견적";
  if (t === "INQUIRY") return "문의";
  if (t === "FEEDBACK") return "피드백";
  return t;
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-row {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

/* KPI */
.kpi-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}

.card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.kpi-head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.kpi-title {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.kpi-value {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  margin-top: 4px;
}

.kpi-subtitle {
  margin-top: 14px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

/* 유형별 리스트 */
.type-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.type-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-label {
  color: #374151;
  font-weight: 800;
}

.type-total {
  font-weight: 900;
  color: #111827;
}

.type-delta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.type-delta .count {
  font-weight: 800;
}

.type-delta .percent {
  font-weight: 900;
}

.up {
  color: #16a34a;
  font-weight: 900;
}

.down {
  color: #ef4444;
  font-weight: 900;
}

/* 기타 */
.split-line {
  height: 1px;
  background: #eee;
  margin: 14px 0;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.metric-label {
  color: #6b7280;
  font-weight: 700;
}

.metric-value {
  color: #111827;
  font-weight: 900;
}

.metric-sub {
  margin-top: 10px;
  font-size: 12px;
}

.small-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f1f1f1;
}

/* 반응형 */
@media (max-width: 1200px) {
  .kpi-row-3 {
    grid-template-columns: 1fr;
  }
}
</style>
