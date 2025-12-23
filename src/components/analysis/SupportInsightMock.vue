<template>
  <div class="insight-grid">
    <!-- 1) 성공/실패 요인 TOP3 -->
    <div class="card insight-card">
      <div class="card-head">
        <div class="card-title">견적 상담 성공/실패 요인</div>
      </div>

      <div class="section">
        <div class="section-title ok">
          <span class="ico">↗</span>
          성공 요인 TOP 3
        </div>

        <div
          v-for="(r, idx) in successTop3"
          :key="'s' + idx"
          class="row"
        >
          <div class="left">
            <span class="rank ok">{{ idx + 1 }}</span>
            <span class="label">{{ r.label }}</span>
          </div>

          <div class="right">
            <span class="count ok">{{ r.count }}건</span>
          </div>

          <div class="bar">
            <div class="fill ok" :style="{ width: pct(r.count, successMax) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title bad">
          <span class="ico">↘</span>
          실패 요인 TOP 3
        </div>

        <div
          v-for="(r, idx) in failTop3"
          :key="'f' + idx"
          class="row"
        >
          <div class="left">
            <span class="rank bad">{{ idx + 1 }}</span>
            <span class="label">{{ r.label }}</span>
          </div>

          <div class="right">
            <span class="count bad">{{ r.count }}건</span>
          </div>

          <div class="bar">
            <div class="fill bad" :style="{ width: pct(r.count, failMax) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2) 긍정 피드백 키워드 -->
    <div class="card insight-card">
      <div class="card-head">
        <div class="card-title">
          <span class="mini-ico ok">⟡</span>
          긍정 피드백 키워드
        </div>
      </div>

      <div
        v-for="(r, idx) in positiveKeywords"
        :key="'p' + idx"
        class="row"
      >
        <div class="left">
          <span class="rank ok">{{ idx + 1 }}</span>
          <span class="label">{{ r.label }}</span>
        </div>

        <div class="right">
          <span class="count ok">{{ r.count }}건</span>
        </div>

        <div class="bar">
          <div class="fill ok" :style="{ width: pct(r.count, positiveMax) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 3) 컴플레인 원인 TOP3 -->
    <div class="card insight-card">
      <div class="card-head">
        <div class="card-title">컴플레인 원인 TOP 3</div>
      </div>

      <div
        v-for="(r, idx) in complaintTop3"
        :key="'c' + idx"
        class="row"
      >
        <div class="left">
          <span class="rank bad">{{ idx + 1 }}</span>
          <span class="label">{{ r.label }}</span>
        </div>

        <div class="right">
          <span class="count bad">{{ r.count }}건</span>
        </div>

        <div class="bar">
          <div class="fill bad" :style="{ width: pct(r.count, complaintMax) + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

/** ✅ 더미 데이터 (백엔드 연결 X) */
const successTop3 = [
  { label: "맞춤형 제품 제안", count: 28 },
  { label: "경쟁력 있는 가격", count: 24 },
  { label: "빠른 견적 응답", count: 21 },
];

const failTop3 = [
  { label: "예산 초과", count: 18 },
  { label: "경쟁사 선택", count: 15 },
  { label: "의사결정 지연", count: 12 },
];

const positiveKeywords = [
  { label: "빠른 배송", count: 18 },
  { label: "친절한 상담", count: 15 },
  { label: "합리적 가격", count: 12 },
  { label: "제품 품질", count: 10 },
  { label: "전문성", count: 8 },
];

const complaintTop3 = [
  { label: "AS 처리 지연", count: 12 },
  { label: "제품 불량/결함", count: 9 },
  { label: "계약 조건 불만", count: 7 },
];

const maxOf = (arr) => Math.max(...arr.map((x) => Number(x.count) || 0), 1);

const successMax = computed(() => maxOf(successTop3));
const failMax = computed(() => maxOf(failTop3));
const positiveMax = computed(() => maxOf(positiveKeywords));
const complaintMax = computed(() => maxOf(complaintTop3));

const pct = (v, max) => {
  const n = Number(v) || 0;
  const m = Number(max) || 1;
  return Math.max(0, Math.min(100, (n / m) * 100));
};
</script>

<style scoped>
/* ✅ 페이지 카드 톤에 맞춤 */
.insight-grid{
  display:grid;
  grid-template-columns: 1.25fr 1fr 1fr; /* 스샷 느낌 */
  gap: 16px;
  align-items: stretch;
}

.card{
  background:#fff;
  border:1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.card-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 14px;
}

.card-title{
  font-size: 14px;
  font-weight: 900;
  color:#111827;
}

.mini-ico{
  display:inline-flex;
  width:18px;
  height:18px;
  align-items:center;
  justify-content:center;
  border-radius: 6px;
  margin-right: 8px;
  font-size: 12px;
}

.section{
  margin-top: 14px;
}

.section-title{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 10px;
}

.section-title .ico{
  font-size: 12px;
  font-weight: 900;
}

.section-title.ok{ color:#16a34a; }
.section-title.bad{ color:#ef4444; }

.row{
  padding: 10px 0;
}

.left{
  display:flex;
  align-items:center;
  gap: 10px;
}

.rank{
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 12px;
  font-weight: 900;
}

.rank.ok{ background:#ecfdf5; color:#166534; }
.rank.bad{ background:#fef2f2; color:#b91c1c; }

.label{
  color:#111827;
  font-size: 13px;
  font-weight: 800;
}

.right{
  display:flex;
  justify-content:flex-end;
  margin-top: 4px;
}

.count{
  font-size: 12px;
  font-weight: 900;
}

.count.ok{ color:#16a34a; }
.count.bad{ color:#ef4444; }

.bar{
  margin-top: 8px;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background:#f3f4f6;
  overflow:hidden;
}

.fill{
  height: 100%;
  border-radius: 999px;
}

.fill.ok{ background:#22c55e; }
.fill.bad{ background:#ef4444; }

@media (max-width: 1200px){
  .insight-grid{
    grid-template-columns: 1fr;
  }
}
</style>
