import React from 'react';
import { Route, Redirect } from 'react-router-dom';

interface PrivateRouteProps {
  component: React.FC<any>;
  isLoggedIn: boolean;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  isLoggedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) => (isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />)}
  />
);

export default PrivateRoute;
