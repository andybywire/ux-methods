import React from 'react';
import { DashboardWidget } from "@sanity/dashboard";
import { Card, Label, Box } from "@sanity/ui";

function GhActions() {
  return (
    <DashboardWidget
      header="Continuous Integration"
    >
      <Card paddingX={3} paddingY={3}>
        <Label size={0} muted={true} >GitHub Actions</Label>
        <Box paddingTop={3}><img src="https://github.com/andybywire/ux-methods/actions/workflows/build-prod.yml/badge.svg"/></Box>
        <Box paddingTop={2}><img src="https://github.com/andybywire/ux-methods/actions/workflows/build-staging.yml/badge.svg"/></Box>
        <Box paddingTop={2}><img src="https://github.com/andybywire/ux-methods/actions/workflows/build-studio.yml/badge.svg"/></Box>
      </Card>
    </DashboardWidget>
  )
}

export default {
  name: "gh-actions",
  component: GhActions
};