import type { Component } from 'vue';

import { Button } from './ui';
import { Card } from './ui';
import { Badge } from './ui';
import { Input } from './ui';
import { Avatar } from './ui';
import { Empty } from './ui';
import { Loading } from './ui';
import { InfoRow } from './ui';
import { LanguageSwitcher } from './ui';

import Header from './layout/Header.vue';
import Sidebar from './layout/Sidebar.vue';
import TabBar from './layout/TabBar.vue';

import { TicketList } from './tickets';
import { TicketCard } from './tickets';
import { StatusBadge } from './tickets';
import { PriorityBadge } from './tickets';
import { TypeBadge } from './tickets';
import { ActionCard } from './tickets';
import { StepList } from './tickets';
import { PhotoGrid } from './tickets';

const components: Record<string, Component> = {
  Button,
  Card,
  Badge,
  Input,
  Avatar,
  Empty,
  Loading,
  InfoRow,
  LanguageSwitcher,
  Header,
  Sidebar,
  TabBar,
  TicketList,
  TicketCard,
  StatusBadge,
  PriorityBadge,
  TypeBadge,
  ActionCard,
  StepList,
  PhotoGrid,
};

export function setupComponents(app: any) {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component);
  }
}

export { components };
