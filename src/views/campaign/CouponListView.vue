<template>
  <div class="coupon-page">
    <!-- 상단 검색 / 필터 / 추가 버튼 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="쿠폰명, 코드로 검색..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="selectedType"
        placeholder="전체 유형"
        class="filter-select"
        @change="handleTypeFilter"
      >
        <el-option label="전체 유형" value="ALL" />
        <!-- 예시: R=비율 할인, F=정액 할인 등 프로젝트 규칙에 맞게 수정 -->
        <el-option label="비율 할인" value="R" />
        <el-option label="금액 할인" value="F" />
      </el-select>

      <el-select
        v-model="selectedStatus"
        placeholder="전체 상태"
        class="filter-select"
        @change="handleStatusFilter"
      >
        <el-option label="전체 상태" value="ALL" />
        <el-option label="사용 가능" value="A" />
        <el-option label="종료" value="C" />
        <!-- 필요하면 더 추가 -->
      </el-select>

      <el-button type="primary" @click="openCreateModal">
        + 쿠폰 추가
      </el-button>
    </div>

    <!-- 쿠폰 목록 테이블 -->
    <el-table
      :data="couponList"
      v-loading="loading"
      style="width: 100%"
    >
      <!-- 쿠폰 번호 -->
      <el-table-column label="쿠폰 번호" width="140">
        <template #default="{ row }">
          <div class="code-cell">
            <div class="main">{{ row.couponCode }}</div>
            <div class="sub">{{ row.contentCode || row.couponCodeShort }}</div>
          </div>
        </template>
      </el-table-column>

      <!-- 쿠폰명 -->
      <el-table-column label="쿠폰명" min-width="220">
        <template #default="{ row }">
          <div class="name-cell">
            <div class="title">{{ row.name }}</div>
            <div class="subtitle">{{ row.content }}</div>
          </div>
        </template>
      </el-table-column>

      <!-- 할인 -->
      <el-table-column label="할인" width="120" align="center">
        <template #default="{ row }">
          <el-tag type="warning" effect="light">
            {{ row.rate }}%
          </el-tag>
        </template>
      </el-table-column>

      <!-- 유형 -->
      <el-table-column label="유형" width="120" align="center">
        <template #default="{ row }">
          <span>{{ getTypeLabel(row.type) }}</span>
        </template>
      </el-table-column>

      <!-- 최소 렌탈료 -->
      <el-table-column label="최소 렌탈료" width="140" align="right">
        <template #default="{ row }">
          {{ formatToManWon(row.minFee) }}
        </template>
      </el-table-column>

      <!-- 대상 세그먼트 -->
      <el-table-column label="대상 세그먼트" min-width="150">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">
            {{ row.segmentName }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 상태 -->
      <el-table-column label="상태" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" effect="light">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 유효기간 -->
      <el-table-column label="유효기간" width="150">
        <template #default="{ row }">
          <span v-if="row.endDate">
            {{ formatDate(row.endDate) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 액션 -->
      <el-table-column label="액션" width="120" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetailModal(row)">
            상세보기
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- TODO: 쿠폰 등록/상세 모달은 이후 작성 -->
    <!--
    <CouponCreateModal
      v-model:visible="createModalVisible"
      @created="fetchCouponList"
    />
    <CouponDetailModal
      v-model:visible="detailModalVisible"
      :coupon-code="selectedCouponCode"
      @updated="fetchCouponList"
      @deleted="fetchCouponList"
    />
    -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import api from '@/api/axios';

const couponList = ref([]);
const loading = ref(false);

const searchKeyword = ref('');
const selectedStatus = ref('ALL');
const selectedType = ref('ALL');

const createModalVisible = ref(false);
const detailModalVisible = ref(false);
const selectedCouponCode = ref(null);

// 금액 포맷 (만원 단위)
const formatToManWon = (value) => {
  if (value == null) return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  const man = num / 10000;
  const fixed = Number(man.toFixed(1));
  if (fixed === 0) return '0';
  if (Number.isInteger(fixed)) return `${fixed}만원`;
  return `${fixed}만원`;
};

const getTypeLabel = (type) => {
  if (type === 'R') return '비율 할인';
  if (type === 'F') return '금액 할인';
  return '기타';
};

const getStatusLabel = (status) => {
  if (status === 'A') return '사용 가능';
  if (status === 'C') return '종료';
  return '알수없음';
};

const getStatusTagType = (status) => {
  if (status === 'A') return 'success';
  if (status === 'C') return 'info';
  return 'default';
};

const formatDate = (iso) => {
  if (!iso) return '';
  return iso.slice(0, 10);
};

// 1. 기본 목록 조회
const fetchCouponList = async () => {
  loading.value = true;
  try {
    const res = await api.get('/coupon/read-list');
    couponList.value = res.data.contents || [];
  } catch (e) {
    ElMessage.error('쿠폰 목록을 불러오지 못했습니다.');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 2. 상태 필터
const handleStatusFilter = async () => {
  if (selectedStatus.value === 'ALL') {
    await fetchCouponList();
    return;
  }
  loading.value = true;
  try {
    const res = await api.get(`/coupon/filter-status/${selectedStatus.value}`);
    couponList.value = res.data.contents || [];
  } catch (e) {
    ElMessage.error('상태 필터 적용 중 오류가 발생했습니다.');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 3. 유형 필터
const handleTypeFilter = async () => {
  if (selectedType.value === 'ALL') {
    await fetchCouponList();
    return;
  }
  loading.value = true;
  try {
    const res = await api.get(`/coupon/filter-type/${selectedType.value}`);
    couponList.value = res.data.contents || [];
  } catch (e) {
    ElMessage.error('유형 필터 적용 중 오류가 발생했습니다.');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 4. 검색
const handleSearch = async () => {
  const keyword = searchKeyword.value?.trim();
  if (!keyword) {
    await fetchCouponList();
    return;
  }
  loading.value = true;
  try {
    const res = await api.get(`/coupon/search/${encodeURIComponent(keyword)}`);
    couponList.value = res.data.contents || [];
  } catch (e) {
    ElMessage.error('검색 중 오류가 발생했습니다.');
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// 5. 상세 모달 열기
const openDetailModal = (row) => {
  selectedCouponCode.value = row.couponCode;
  detailModalVisible.value = true;
};

// 등록 모달
const openCreateModal = () => {
  createModalVisible.value = true;
};

onMounted(() => {
  fetchCouponList();
});
</script>

<style scoped>
.coupon-page {
  padding: 16px 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  width: 320px;
}

.filter-select {
  width: 140px;
}

.code-cell .main {
  font-weight: 600;
}

.code-cell .sub {
  font-size: 12px;
  color: #999;
}

.name-cell .title {
  font-weight: 500;
}

.name-cell .subtitle {
  font-size: 12px;
  color: #999;
}
</style>