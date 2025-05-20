import React from 'react';
import { Route, Redirect } from 'react-router-dom';

interface PrivateRouteProps {
  isLoggedIn: boolean;
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
  [key: string]: any; // Ermöglicht zusätzliche Props
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isLoggedIn,
  component: Component,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Component {...props} {...rest} /> // Zusätzliche Props weitergeben
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
