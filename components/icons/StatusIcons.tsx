import React from 'react';
import { AnalysisOverallStatus } from '../../types';

interface StatusBadgeProps {
  status: AnalysisOverallStatus;
}

const statusStyles: Record<AnalysisOverallStatus, string> = {
  [AnalysisOverallStatus.PENDING_DOCS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [AnalysisOverallStatus.COMPLETED_SUCCESS]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [AnalysisOverallStatus.COMPLETED_PENDING]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
    {status}
  </span>
);