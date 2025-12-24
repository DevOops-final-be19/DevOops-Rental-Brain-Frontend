<template>
  <div class="seg-wrap">
    <div v-for="c in cards" :key="c.segmentId" class="seg-card" :class="toneClass(c.segmentId)">
      <div class="seg-head">
        <div class="seg-name">{{ c.segmentName }}</div>
        <div class="seg-count">{{ fmt(c.customerCount) }}개사</div>
      </div>

      <div class="seg-metrics">
        <div class="metric-row">
          <span class="label">총 거래액</span>
          <span class="value">{{ moneyKr(c.totalTradeAmount) }}</span>
        </div>
        <div class="metric-row">
          <span class="label">평균 거래액</span>
          <span class="value">{{ moneyKr(c.avgTradeAmount) }}</span>
        </div>
        <div class="metric-row">
          <span class="label">평균 만족도</span>
          <span class="value">
            <span class="star">⭐</span>
            {{ score(c.avgScore) }}
          </span>
        </div>
      </div>

      <div class="seg-section">
        <div class="sec-title">인기 품목</div>
        <div class="sec-body">{{ c.popularItem || "-" }}</div>
      </div>

      <div class="seg-section">
        <div class="sec-title">주요 문의사항</div>
        <div class="sec-body">{{ c.topInquiry || "-" }}</div>
      </div>

      <div class="seg-section">
        <div class="sec-title">주요 피드백</div>
        <div class="sec-body">{{ c.topFeedback || "-" }}</div>
      </div>

      <div v-if="c._loading" class="overlay">불러오는 중...</div>
      <div v-else-if="c._error" class="overlay error">불러오기 실패</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getCustomerSegmentDetailCard } from "@/api/customeranalysis";

const props = defineProps({
  segmentIds: { type: Array, default: () => [1, 2, 3, 4, 5, 6, 7] },
});

const cards = ref([]);

const normalize = (segmentId, data) => {
  return {
    segmentId,

    segmentName: data?.segmentName ?? data?.name ?? "세그먼트",
    customerCount: Number(data?.customerCount ?? data?.count ?? 0) || 0,

    totalTradeAmount: Number(
      data?.totalTradeAmount ?? data?.totalAmount ?? data?.totalTrade ?? 0
    ) || 0,

    avgTradeAmount: Number(
      data?.avgTradeAmount ?? data?.avgAmount ?? data?.avgTrade ?? 0
    ) || 0,

    // ✅ 만족도 키 추가
    avgScore: Number(
      data?.avgSatisfaction ?? data?.avgScore ?? data?.averageScore ?? data?.score ?? 0
    ) || 0,

    // ✅ 인기 품목 키 추가
    popularItem: data?.topItemName ?? data?.popularItem ?? data?.topItem ?? data?.bestItem ?? "",

    // ✅ 주요 문의사항 키 추가
    topInquiry: data?.topSupport ?? data?.topInquiry ?? data?.mainInquiry ?? data?.inquiryKeyword ?? "",

    // 기존 그대로
    topFeedback: data?.topFeedback ?? data?.mainFeedback ?? data?.feedbackKeyword ?? "",

    _loading: false,
    _error: "",
  };
};

const fetchAll = async () => {
  // 스켈레톤/로딩 상태 먼저 깔기
  cards.value = props.segmentIds.map((id) => ({
    segmentId: id,
    segmentName: "불러오는 중...",
    customerCount: 0,
    totalTradeAmount: 0,
    avgTradeAmount: 0,
    avgScore: 0,
    popularItem: "",
    topInquiry: "",
    topFeedback: "",
    _loading: true,
    _error: "",
  }));

  await Promise.all(
    props.segmentIds.map(async (id) => {
      try {
        const res = await getCustomerSegmentDetailCard(id);
        const data = res?.data ?? res; // 혹시 res.data가 아닌 경우도 대비
        const next = normalize(id, data);

        const idx = cards.value.findIndex((x) => x.segmentId === id);
        if (idx >= 0) cards.value[idx] = next;
      } catch (e) {
        const idx = cards.value.findIndex((x) => x.segmentId === id);
        if (idx >= 0) {
          cards.value[idx] = {
            ...cards.value[idx],
            _loading: false,
            _error: e?.response?.data?.message ?? e?.message ?? String(e),
          };
        }
      }
    })
  );
};

onMounted(fetchAll);

/* ---------- format helpers ---------- */
const fmt = (n) => (Number(n) || 0).toLocaleString();

const score = (n) => {
  const v = Number(n) || 0;
  if (!v) return "-";
  return (Math.round(v * 10) / 10).toFixed(1);
};

/**
 * 원 단위를 "억 xxxx만원" / "xxxx만원" 으로 표기
 * - 1만원 = 10,000원
 * - 1억 = 100,000,000원 = 10,000만원
 */
const moneyKr = (won) => {
  const v = Math.floor(Number(won) || 0);
  if (v <= 0) return "0만원";

  const man = Math.floor(v / 10000); // 만원 단위
  const eok = Math.floor(man / 10000); // 억(= 10,000만원)
  const restMan = man % 10000;

  if (eok > 0 && restMan > 0) return `${eok}억 ${restMan.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억`;
  return `${man.toLocaleString()}만원`;
};

/* ---------- tone ---------- */
const toneClass = (segmentId) => {
  // 너 스샷 느낌대로 테두리 톤만 다르게
  const map = {
    1: "tone-blue",     // 잠재
    2: "tone-sky",      // 신규
    3: "tone-green",    // 일반
    4: "tone-red",      // 이탈 위험
    5: "tone-amber",    // VIP
    6: "tone-gray",     // 블랙리스트
    7: "tone-purple",   // 확장 의사
  };
  return map[segmentId] ?? "tone-gray";
};
</script>

<style scoped>
/* ✅ 4 + 3 느낌 (반응형 포함) */
.seg-wrap{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1400px){
  .seg-wrap{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1024px){
  .seg-wrap{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px){
  .seg-wrap{ grid-template-columns: 1fr; }
}

.seg-card{
  position: relative;
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px 18px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  min-height: 320px;
}

.seg-head{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 12px;
}

.seg-name{
  font-weight: 900;
  color:#111827;
  letter-spacing: -0.2px;
}

.seg-count{
  font-weight: 900;
  color:#111827;
}

.seg-metrics{
  display:flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 12px;
}

.metric-row{
  display:flex;
  justify-content: space-between;
  font-size: 12px;
}

.label{
  color:#6b7280;
  font-weight: 800;
}

.value{
  color:#111827;
  font-weight: 900;
}

.star{ margin-right: 4px; }

.seg-section{
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}
.seg-section:last-child{ border-bottom: none; padding-bottom: 0; }

.sec-title{
  font-size: 12px;
  font-weight: 900;
  color:#6b7280;
  margin-bottom: 6px;
}

.sec-body{
  font-size: 13px;
  font-weight: 900;
  color:#111827;
}

/* 톤(테두리 강조) */
.tone-blue{   border-color: rgba(59,130,246,0.35); box-shadow: 0 0 0 2px rgba(59,130,246,0.08); }
.tone-sky{    border-color: rgba(96,165,250,0.35); box-shadow: 0 0 0 2px rgba(96,165,250,0.08); }
.tone-green{  border-color: rgba(34,197,94,0.28);  box-shadow: 0 0 0 2px rgba(34,197,94,0.08); }
.tone-red{    border-color: rgba(239,68,68,0.28);  box-shadow: 0 0 0 2px rgba(239,68,68,0.08); }
.tone-amber{  border-color: rgba(245,158,11,0.28); box-shadow: 0 0 0 2px rgba(245,158,11,0.08); }
.tone-gray{   border-color: rgba(156,163,175,0.35); box-shadow: 0 0 0 2px rgba(156,163,175,0.08); }
.tone-purple{ border-color: rgba(168,85,247,0.28); box-shadow: 0 0 0 2px rgba(168,85,247,0.08); }

/* 로딩/에러 오버레이 */
.overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 16px;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(2px);
  color:#111827;
  font-weight: 900;
}
.overlay.error{
  color:#ef4444;
}
</style>
