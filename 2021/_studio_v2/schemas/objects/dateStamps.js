export default {
    name: 'dateStamps',
    type: 'object',
    title: 'Publication & Revision Dates',
    options: {
      columns: 2
    },
    fields: [
      {
        name: 'createdAt',
        type: 'date',
        title: 'Date Created',
        initialValue: (new Date()).toLocaleDateString('en-CA')
      },
      {
        name: 'revisedAt',
        type: 'date',
        title: 'Date Revised'
      }
    ]
  }
  