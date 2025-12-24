import api from './axios'

/**
 * 사용자 결재 상태
 */
export const getApprovalStatus = () => {
    return api.get('/approval/status')
}

/**
 * 대기 결재 목록
 */
export const getApprovalPending = (pageNum, amount) => {
    return api.get('/approval/pending', {
      params: { pageNum, amount }
    })
  }
  
  /**
   * 진행 중 결재 목록
   */
  export const getApprovalProgress = (pageNum, amount) => {
    return api.get('/approval/progress', {
      params: { pageNum, amount }
    })
  }
  
  /**
   * 완료 결재 목록
   */
  export const getApprovalCompleted = (pageNum, amount) => {
    return api.get('/approval/completed', {
      params: { pageNum, amount }
    })
  }

  export const approveApproval = (approvalCode) => {
    return api.patch(`/approval/approve`, null, {
    params: { approvalCode }
  })
  }

  export const rejectApproval = (approvalCode, data) => {
    return api.patch(`/approval/reject`, data, {
      params: { approvalCode }
    })
  }