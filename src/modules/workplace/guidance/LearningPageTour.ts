import type { TourContext, TourDefinition } from '../../../guidance/tourTypes';

const canManage = ({ canScopedPermission }: TourContext) =>
  canScopedPermission?.('learning:manage', ['ALL']) ?? false;
const onTab = (context: TourContext, tab: string) =>
  context.activeTab ? context.activeTab === tab : tab === 'courses';

export const learningPageTour: TourDefinition = {
  id: 'workplace-learning-page',
  routePaths: ['workplace/learning'],
  steps: [
    {
      id: 'learning-sections',
      anchor: 'learning.sections',
      title: 'Browse courses and skills',
      body: 'Courses lists training offerings and their delivery details. Skills lists the skill catalog. Use the tabs and pagination to move through each catalog.',
      isVisible: (context) => canManage(context) && onTab(context, 'courses'),
    },
    {
      id: 'learning-skill-management',
      anchor: 'learning.skill-actions',
      title: 'Manage the skill catalog',
      body: 'Learning managers can create or edit a skill name, category, and level. Save applies the catalog change; this tour does not open or submit the editor.',
      isVisible: (context) => canManage(context) && onTab(context, 'skills'),
    },
    {
      id: 'learning-course-management',
      anchor: 'learning.course-actions',
      title: 'Manage courses',
      body: 'Learning managers can create or edit a course, including category, delivery mode, duration, and whether it is mandatory. Save applies the catalog change.',
      isVisible: (context) => canManage(context) && onTab(context, 'courses'),
    },
  ],
};
