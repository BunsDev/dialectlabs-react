import React from 'react';
import Gear from './assets/gear.svg';
import NotConnected from './assets/not-connected.svg';
import NoNotifications from './assets/no-notifications.svg';
import Dialect from './assets/dialect-logo.svg';

// function Icon(params:type) {
//     return
// }

type IconPropsType = {
  className?: string;
};

export function GearIcon(props: IconPropsType): JSX.Element {
  return <Gear {...props} />;
}

export function NotConnectedIcon(props: IconPropsType): JSX.Element {
  return <NotConnected {...props} />;
}

export function NoNotificationsIcon(props: IconPropsType): JSX.Element {
  return <NoNotifications {...props} />;
}

export function DialectLogo(props: IconPropsType): JSX.Element {
  return <Dialect {...props} />;
}