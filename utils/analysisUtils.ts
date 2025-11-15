
import { DocumentChecklistItem, AnalysisOverallStatus, ChecklistStatus } from '../types';

export const calculateOverallStatus = (checklist: DocumentChecklistItem[]): AnalysisOverallStatus => {
    const isAnyPending = checklist.some(item => 
        item.status === ChecklistStatus.PENDING || 
        item.status === ChecklistStatus.UPLOADED ||
        item.status === ChecklistStatus.ANALYZING
    );

    if (isAnyPending) {
        return AnalysisOverallStatus.PENDING_DOCS;
    }
    
    // All items are either SUCCESS or ERROR at this point
    const hasIssues = checklist.some(item => 
        item.status === ChecklistStatus.ERROR || 
        (item.status === ChecklistStatus.SUCCESS && item.result && !item.result.startsWith('CORRETO'))
    );

    if (hasIssues) {
        return AnalysisOverallStatus.COMPLETED_PENDING;
    }

    return AnalysisOverallStatus.COMPLETED_SUCCESS;
};
