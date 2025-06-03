import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import DashboardPage from '../pages/Dashboard/Dashboard';
import ProjectListPage from '../pages/Projects/ProjectListPage';
import HackathonTeams from '../pages/Teams/HackathonTeams';
import EventListPage from '../pages/Events/EventListPage';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage';
import AddProjectPage from '../pages/AddProject/AddProjectPage';
import { getExistingToken } from '../utils/authUtils';

export const getPublicRoutes = () => [
  { path: '/login', component: LoginPage, exact: true },
  { path: '/register', component: RegisterPage, exact: true },
];

export const getPrivateRoutes = (profile: any, selectedEvent: any, projects: any, fetchProjects: any) => [
  {
    path: '/dashboard',
    component: DashboardPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
  },
  { path: '/events', component: EventListPage, exact: true, profile: profile },
  { path: '/teams', component: HackathonTeams, exact: true },
  {
    path: '/projects',
    component: ProjectListPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
  },
  {
    path: '/projects/add',
    component: AddProjectPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
    onProjectAdded: () => {
      const token = getExistingToken();
      if (selectedEvent && token) {
        fetchProjects(selectedEvent.id, token); // Projekte aktualisieren
      }
    },
  },
  {
    path: '/projectdetail/:id',
    component: ProjectDetailPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
  },
];