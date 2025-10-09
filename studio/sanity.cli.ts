import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '4g5tw1k0',
    dataset: 'production'
  },
  studioHost: 'uxmethods',
  deployment: {
    autoUpdates: true,
    appId: 'vgf4e6erwye9hl1wxg4ju9be'
  }
})
