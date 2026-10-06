import type {
  ClaimTravelReportFilterInput,
  HrReportKind as GeneratedHrReportKind,
  HrReportRowsQueryVariables,
  HrReportRowsQuery,
  HrReportCsvQuery,
  HrInsightsQuery,
} from '../../api/graphql/graphql';

export type HrReportKind = `${GeneratedHrReportKind}`;
export type ReportFilter = Omit<HrReportRowsQueryVariables, 'offset' | 'kind'> & {
  kind: HrReportKind;
};
export type ClaimTravelFilter = ClaimTravelReportFilterInput;
export type ReportRows = HrReportRowsQuery['hrReportRows'];
export type ReportCsv = HrReportCsvQuery['hrReportCsv'];
export type HrInsights = HrInsightsQuery['hrInsights'];
export {
  HrReportRowsDocument,
  HrReportCsvDocument,
  HrInsightsDocument,
  ClaimTravelReportOptionsDocument,
} from '../../api/graphql/graphql';

export const reportKindVariable = (kind: HrReportKind): GeneratedHrReportKind =>
  kind as GeneratedHrReportKind;
