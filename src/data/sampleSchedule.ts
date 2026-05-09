import { ImportedSchedulePayload } from '../utils/storage';

export const SAMPLE_SCHEDULE: ImportedSchedulePayload = {
  schedule: [
    {
      time: '06:00-07:00',
      task: 'Cycling',
      description: 'Outdoor ride',
      duration: '1 hr',
    },
    {
      time: '07:00-07:15',
      task: 'Push-ups',
      description: '1-min set · cool down',
      duration: '15 min',
    },
    {
      time: '07:15-08:30',
      task: 'Freshen up + rest',
      duration: '75 min',
    },
    {
      time: '08:30-09:00',
      task: 'Breakfast',
      duration: '30 min',
    },
    {
      time: '09:00-11:45',
      task: 'Research project — blueprint',
      description: 'Define scope · task list · milestones · implementation plan',
      duration: '2 hr 45 min',
      tag: 'deep work',
    },
    {
      time: '11:45-12:00',
      task: 'Get ready / leave for Jaffna',
      description: 'Check fever first — skip if unwell',
      condition: 'conditional',
    },
    {
      time: '12:00-13:30',
      task: 'Travel to Jaffna',
      duration: '90 min',
    },
    {
      time: '13:30-14:30',
      task: 'Lunch in Jaffna',
      duration: '1 hr',
    },
    {
      time: '14:30-16:30',
      task: 'Watch a film',
      duration: '2 hr',
    },
    {
      time: '16:30-18:00',
      task: 'Church / return home',
      duration: '90 min',
    },
    {
      time: '18:00-20:30',
      task: 'FastAPI + model integration',
      description: 'Implement & test',
      duration: '2 hr 30 min',
    },
    {
      time: '20:30-22:00',
      task: 'Dinner + wind down',
      duration: '90 min',
    },
    {
      time: '22:00-22:45',
      task: 'Appz Makers prep',
      description: 'Review JD · prep notes · plan till May 16',
      duration: '45 min',
      repeat: 'Daily until May 16',
    },
    {
      time: '22:45-23:30',
      task: 'Film / YouTube → sleep',
      duration: '45 min',
    },
  ],
};
