<template>
    <div class="contract-list-page">
      <!-- 헤더 -->
      <div class="header">
        <div>
          <h1>계약 목록</h1>
          <p>계약 현황 및 진행 상태 관리</p>
        </div>
  
        <!-- 계약 생성 -->
        <button class="primary-btn" @click="goToCreateContract">
          계약 생성
        </button>
      </div>
  
      <!-- KPI -->
      <div class="kpi-row">
        <div class="kpi-card">
          <p class="label">전체 계약</p>
          <p class="value">{{ kpi.totalContracts }}건</p>
        </div>
        <div class="kpi-card">
          <p class="label">계약 진행</p>
          <p class="value">{{ kpi.progressContracts }}건</p>
        </div>
        <div class="kpi-card">
          <p class="label">만료 임박</p>
          <p class="value">{{ kpi.imminentExpireContracts }}건</p>
        </div>
        <div class="kpi-card">
          <p class="label">신규 계약</p>
          <p class="value">{{ kpi.thisMonthContracts }}건</p>
        </div>
      </div>
  
      <!-- 검색 영역 -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            placeholder="검색어 입력"
          />
        </div>
  
        <!-- 검색 타입 -->
        <select v-model="searchType">
          <option value="contract_code,cusName,in_charge,conName">
            전체 검색
          </option>
          <option value="contract_code">계약 코드</option>
          <option value="cusName">고객명</option>
          <option value="in_charge">담당자</option>
          <option value="conName">계약명</option>
        </select>
  
        <!-- 계약 상태 -->
        <select v-model="selectedStatus" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="P">계약 진행</option>
          <option value="I">만료 임박</option>
          <option value="T">계약 해지</option>
          <option value="C">계약 만료</option>
        </select>
      </div>
  
      <!-- 계약 테이블 -->
      <table class="contract-table">
        <thead>
          <tr>
            <th>계약 코드</th>
            <th>계약명</th>
            <th>고객명</th>
            <th>담당자</th>
            <th>계약 기간</th>
            <th>월 납부액</th>
            <th>시작일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contractList" :key="c.id">
            <td>{{ c.contract_code }}</td>
            <td>{{ c.conName }}</td>
            <td>{{ c.cusName }}</td>
            <td>{{ c.in_charge }}</td>
            <td>{{ c.contract_period }}개월</td>
            <td>{{ c.monthly_payment.toLocaleString() }}원</td>
            <td>{{ formatDate(c.start_date) }}</td>
            <td>
              <span :class="['status-badge', c.status]">
                {{ statusLabel(c.status) }}
              </span>
            </td>
            <td>
              <button class="link-btn">
                상세보기
              </button>
            </td>
          </tr>
  
          <tr v-if="contractList.length === 0">
            <td colspan="9">조회된 계약이 없습니다.</td>
          </tr>
        </tbody>
      </table>
  
      <!-- 페이지네이션 -->
      <Pagination
      :page="page"
      :size="size"
      :totalCount="totalCount"
      @update:page="onPageChange"
      />
    </div>
  </template>
  
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import api from '@/api/axios';
  import Pagination from '@/components/common/Pagination.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const page = ref(1);
  const size = ref(10);
  
  const contractList = ref([]);
  const totalCount = ref(0);
  
  const searchKeyword = ref('');
  const searchType = ref('contract_code,cusName,in_charge,conName');
  const selectedStatus = ref('');

  const goToCreateContract = () => {
  router.push('/contracts/new')
  }
  
  const kpi = ref({
    totalContracts: 0,
    progressContracts: 0,
    imminentExpireContracts: 0,
  });
  
  const statusOptions = [
    { label: '계약 진행', value: 'P' },
    { label: '만료 임박', value: 'I' },
    { label: '계약 해지', value: 'T' },
    { label: '계약 만료', value: 'C' },
  ];
  
  // KPI
  async function fetchKpi() {
    const res = await api.get('/contract/status');
    kpi.value = res.data;
  }
 
  // 계약 목록
  async function fetchList() {
    const res = await api.get('/contract/list', {
      params: {
        page: page.value,
        size: size.value,
        status: selectedStatus.value || null,
        type: searchType.value,
        keyword: searchKeyword.value,
      },
    });
  
    contractList.value = res.data.contents;
    totalCount.value = res.data.totalCount;
  }
  
  // 페이지 변경 핸들러
  function onPageChange(p) {
  page.value = p;
  fetchList();
  } 

  // 검색
  function handleSearch() {
    page.value = 1;
    fetchList();
  }
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString();
  }
  
  function statusLabel(status) {
    return {
      P: '진행',
      I: '만료 임박',
      T: '해지',
      C: '만료',
    }[status];
  }
  
  onMounted(async () => {
    await fetchKpi();
    await fetchList();
  });
  </script>
  <style scoped>
    .contract-list-page {
      padding: 24px;
      background: #f5f7fb;
      color: #222;
    }
    
    /* 헤더 */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    /* KPI */
    .kpi-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .kpi-card {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }
    
    .kpi-card .label {
      font-size: 14px;
      color: #888;
    }
    
    .kpi-card .value {
      font-size: 24px;
      font-weight: 600;
    }
    
    /* 상태 필터 */
    .status-filter {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .status-btn {
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid #e0e4f0;
      background: #fff;
      cursor: pointer;
      font-size: 13px;
    }
    
    .status-btn.active {
      background: #248efff2;
      color: #fff;
      border-color: #248efff2;
    }
    
    /* 검색 */
    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      align-items: center;
    }
    
    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f5f7fb;
      border-radius: 999px;
      padding: 0 16px;
      border: 1px solid #e0e4f0;
    }
    
    .search-box input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 10px 8px;
      font-size: 14px;
    }
    
    .toolbar select {
      height: 40px;
      border-radius: 999px;
      border: 1px solid #e0e4f0;
      padding: 0 12px;
      background: #fff;
    }
    
    /* 테이블 */
    .contract-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .contract-table th,
    .contract-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    
    .contract-table thead {
      background: #fafafa;
    }
    
    /* 상태 뱃지 */
    .status-badge {
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-badge.P {
      background: #e0f2fe;
      color: #0369a1;
    }
    
    .status-badge.I {
      background: #fff7ed;
      color: #c2410c;
    }
    
    .status-badge.T {
      background: #fee2e2;
      color: #b91c1c;
    }
    
    .status-badge.C {
      background: #e5e7eb;
      color: #374151;
    }
    
    /* 페이지네이션 */
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 6px;
    }
    
    .page-btn {
      border: 1px solid #e0e4f0;
      background: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .page-btn.active {
      background: #248efff2;
      color: #fff;
    }

    .primary-btn {
     background: #248efff2;
     color: #fff;
     border: none;
     padding: 8px 16px;
     border-radius: 6px;
     cursor: pointer;
    }

    .link-btn {
     background: none;
     border: none;
     color: #248efff2;
     cursor: pointer;
     font-size: 13px;
    }

.contract-table td:nth-child(8),
.contract-table td:nth-child(9) {
  text-align: center;
}
    </style>
    