import api from "@/api/axios";

/**
 * ===========================
 * 고객 요약 분석 (Summary)
 * ===========================
 */

/** 고객 요약 KPI */
export const getCustomerSummaryKpi = (month) =>
  api.get("/customerSummaryAnalysis/kpi", {
    params: { month },
  });

/** 월별 이탈 위험률 트렌드 */
export const getMonthlyRiskRate = (from, to) =>
  api.get("/customerSummaryAnalysis/risk-monthly-rate", {
    params: { from, to },
  });

/** 만족도 분포 (1~5점) - 요약분석 */
export const getSatisfactionDist = (month) =>
  api.get("/customerSummaryAnalysis/satisfaction", {
    // 백엔드가 month를 안 쓰면 무시될 수 있음 (있으면 사용)
    params: month ? { month } : {},
  });

/** 고객 세그먼트 분포 (도넛 차트) */
export const getSegmentDistribution = () =>
  api.get("/customerSummaryAnalysis/segment-distribution");

/**
 * 만족도(별점)별 고객 목록 조회
 * GET /customerSummaryAnalysis/satisfaction/{star}/customers?page=1&size=10
 */
export const getSatisfactionCustomersByStar = (star, page = 1, size = 10) => {
  return api.get(`/customerSummaryAnalysis/satisfaction/${star}/customers`, {
    params: { page, size },
  });
};

/**
 * ===========================
 * 고객 응대 분석 (Support)
 * ===========================
 */

/** 고객 응대 KPI */
export const getCustomerSupportKpi = (month) => {
  return api.get("/customerSupportAnalysis/kpi", {
    params: month ? { month } : {},
  });
};

/** 고객 응대 월별 트렌드 */
export const getMonthlyTrend = (year) =>
  api.get("/customerSupportAnalysis/monthly-trend", {
    params: year ? { year } : {},
  });

/**
 * ✅ (중요) 고객 만족도 분포 - Support 화면에서 사용
 *
 * ⚠️ 기존에 "/customerSupportAnalysis/satisfaction/distribution" 로 쏴서
 * 백엔드에 없으니 404("No static resource ...")가 났음.
 *
 * 지금은 "존재하는" 요약분석 분포 API를 재사용하도록 연결.
 * 나중에 백엔드에서 support 전용 API 생기면 URL만 바꾸면 됨.
 */
export const getCustomerSatisfactionDistribution = (month) => {
  return api.get("/customerSummaryAnalysis/satisfaction", {
    params: month ? { month } : {},
  });
};

/**
 * ===========================
 * (기존 다른 분석 API들)
 * ===========================
 */

export const getRiskKpi = (month) =>
  api.get("/customersegmentanalysis/riskKpi", {
    params: { month },
  });

export const getRiskReasonKpi = (month) =>
  api.get("/customersegmentanalysis/riskReasonKpi", {
    params: { month },
  });

export const getSegmentTradeChart = (month) =>
  api.get("/customersegmentanalysis/segmentTradeChart", {
    params: { month },
  });

export const getCustomerSegmentDetailCard = (segmentId) =>
  api.get("/customersegmentanalysis/segmentCard", {
    params: { segmentId },
  });

export const getQuoteAnalyze = (month, windowDays = 60, sampleEach = 50) =>
  api.post("/insight/quoteAnalyze", null, {
    params: { month, windowDays, sampleEach },
  });
