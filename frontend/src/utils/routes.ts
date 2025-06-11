import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import DashboardPage from '../pages/Dashboard/Dashboard';
import ProjectListPage from '../pages/Projects/ProjectListPage';
import EventListPage from '../pages/Events/EventListPage';
import ProjectDetailPage from '../pages/ProjectDetail/ProjectDetailPage';
import AddProjectPage from '../pages/AddProject/AddProjectPage';
import { getExistingToken } from '../utils/authUtils';
import TeamListPage from '../pages/Teams/TeamListPage';
import AboutPage from '../pages/AboutPage/AboutPage';
import UserListPage from '../pages/UserList/UserList';
import RequestActivationPage from '../pages/Register/RequestActivationPage';
import ActivationPage from '../pages/Register/ActivationPage';

const handleProjectAdded = (selectedEvent: any, updateProjects: any) => {
  const token = getExistingToken();
  if (selectedEvent && token) {
    updateProjects(selectedEvent.id, token);
  }
};

const handleParticipateChanged = (
  selectedEvent: any,
  updateProjects: any,
  updateParticipateList: any,
) => {
  const token = getExistingToken();
  if (selectedEvent && token) {
    updateProjects(selectedEvent.id, token);
    updateParticipateList(token);
  }
};

export const getPublicRoutes = () => [
  { path: '/login', component: LoginPage, exact: true },
  { path: '/register', component: RegisterPage, exact: true },
  { path: '/request-activation', component: RequestActivationPage, exact: true },
  { path: '/account-activation', component: ActivationPage, exact: true },
  { path: '/about', component: AboutPage, exact: true },
];

export const getPrivateRoutes = (
  profile: any,
  events: any,
  selectedEvent: any,
  projects: any,
  updateProjects: any,
  updateParticipateList: any,
) => [
  {
    path: '/dashboard',
    component: DashboardPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
  },
  { path: '/events', component: EventListPage, exact: true, events: events },
  {
    path: '/teams',
    component: TeamListPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
  },
  {
    path: '/userlist',
    component: UserListPage,
    exact: true,
    profile: profile,
    projects: projects,
    events: events,
  },
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
      handleProjectAdded(selectedEvent, updateProjects);
    },
  },
  {
    path: '/projectdetail/:id',
    component: ProjectDetailPage,
    exact: true,
    profile: profile,
    event: selectedEvent,
    projects: projects,
    onParticipantChange: () => {
      handleParticipateChanged(selectedEvent, updateProjects, updateParticipateList);
    },
  },
];
