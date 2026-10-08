export {
  SaveCompetencyDocument as saveCompetencyDocument,
  SaveTalentPoolDocument as saveTalentPoolDocument,
  SuccessionSetupPageDocument as successionSetupPageDocument,
} from '../../api/graphql/graphql';

export interface SuccessionSetupValues {
  id?: string;
  name: string;
  category?: string | null;
  description?: string | null;
}
