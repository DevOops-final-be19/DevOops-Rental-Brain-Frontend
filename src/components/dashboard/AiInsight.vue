<template>
  <div class="wb-card">
    <!-- Header -->
    <div class="wb-head">
      <div class="wb-title">캠페인 워크벤치</div>
      <div class="wb-pill">오늘 3건</div>
    </div>

    <!-- Rows -->
    <div class="wb-list">
      <!-- Row 1 (HIGH) -->
      <div class="wb-row">
        <div class="wb-left">
          <span class="dot dot-high" aria-hidden="true"></span>
          <div class="wb-text">
            <div class="wb-main">재계약 프로모션 생성</div>
            <div class="wb-sub">대상: 만료 임박 계약 고객</div>
          </div>
        </div>

        <button class="wb-btn wb-btn--primary" type="button">
          프로모션 생성
        </button>
      </div>

      <div class="wb-divider"></div>

      <!-- Row 2 (MEDIUM) -->
      <div class="wb-row">
        <div class="wb-left">
          <span class="dot dot-mid" aria-hidden="true"></span>
          <div class="wb-text">
            <div class="wb-main">20% 할인 쿠폰 발급</div>
            <div class="wb-sub">대상: 이탈 위험 고객 세그먼트</div>
          </div>
        </div>

        <button class="wb-btn" type="button">
          쿠폰 발급
        </button>
      </div>

      <div class="wb-divider"></div>

      <!-- Row 3 (LOW) -->
      <div class="wb-row">
        <div class="wb-left">
          <span class="dot dot-low" aria-hidden="true"></span>
          <div class="wb-text">
            <div class="wb-main">신규 고객 전환 캠페인 설정</div>
            <div class="wb-sub">대상: 최근 문의 후 미전환 고객</div>
          </div>
        </div>

        <button class="wb-btn" type="button">
          캠페인 설정
        </button>
      </div>
    </div>

    <!-- Footer link -->
    <div class="wb-foot">
      <span class="wb-link">캠페인 관리로 이동 →</span>
    </div>
  </div>
</template>
<style scoped>
/* ==========================================================
   Base card tone (기존 대시보드 카드들과 동일 계열)
========================================================== */
.wb-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  height: 100%;
  width: 100%;
  padding: 16px 16px 14px;
  
}

/* Header */
.wb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.wb-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.2px;
}

/* 다른 카드들 우측 pill 톤 */
.wb-pill {
  font-size: 12px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

/* List wrapper */
.wb-list {
  border: 1px solid #f1f1f1;
  border-radius: 10px;
  overflow: hidden; /* row divider 깔끔하게 */
  background: #fff;
}

/* Rows: 카드 안 카드 금지 → “행”처럼 보이게 */
.wb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  padding: 14px 14px;
}

.wb-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.wb-text {
  min-width: 0;
}

.wb-main {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wb-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Divider */
.wb-divider {
  height: 1px;
  background: #f1f1f1;
}

/* Priority dot: 작고 조용하게 */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-top: 3px;
  flex: 0 0 auto;
}

.dot-high { background: #ef4444; }
.dot-mid  { background: #6366f1; }
.dot-low  { background: #9ca3af; }

/* Buttons: 대시보드 톤 유지 (강한 primary는 1개만) */
.wb-btn {
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 10px;

  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;

  cursor: pointer;
  white-space: nowrap;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
}

.wb-btn:hover {
  opacity: 0.92;
}

.wb-btn:active {
  transform: translateY(1px);
}

.wb-btn--primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

/* Footer link */
.wb-foot {
  margin-top: 10px;
  text-align: center;
}

.wb-link {
  font-size: 12px;
  color: #2563eb;
  cursor: pointer;
}

.wb-link:hover {
  text-decoration: underline;
}

/* Responsive: 좁아지면 버튼을 아래로 */
@media (max-width: 700px) {
  .wb-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .wb-btn {
    width: 100%;
  }

  .wb-main,
  .wb-sub {
    white-space: normal;
  }
}
</style>
