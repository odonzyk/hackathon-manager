import ReactGA from 'react-ga4';

const GA4_ID = 'G-1E26BWQ9J1';

const getPageTitle = (pathname: string): string => {
  const pageTitles: { [key: string]: string } = {
    '/login': 'Login',
    '/register': 'Register',
    '/about': 'About',
    '/dashboard': 'Dashboard',
    '/events': 'Events',
    '/teams': 'Teams',
    '/projects': 'Projects',
    '/projects/add': 'NewProjects',
    '/projectdetail': 'ProjectDetail',
    '/userlist': 'UserList',
  };

  // Dynamische Routen abfangen
  if (pathname.startsWith('/projectdetail')) {
    return pageTitles['/projectdetail'];
  }

  return pageTitles[pathname] || pathname;
};

export const trackingInit = () => {
  ReactGA.initialize(GA4_ID);
};

export const requestTracking = () => {
  const domain = window.location.hostname;
  const pageTitle = getPageTitle(location.pathname);
  //console.log('Tracking pageview:', domain, location.pathname, pageTitle);
  if (domain === 'localhost') {
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname,
      hostname: domain,
      title: pageTitle,
    });
  }
};
