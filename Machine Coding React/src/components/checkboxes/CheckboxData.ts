import type { CheckboxNode } from './types'

export const CheckboxData: CheckboxNode[] = [
  {
    id: 1,
    name: 'Parent One',
    children: [
      { id: 2, name: 'Child 1.1' },
      {
        id: 3,
        name: 'Child 1.2',
        children: [
          { id: 4, name: 'Grandchild 1.2.1' },
          { id: 5, name: 'Grandchild 1.2.2' },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Parent Two',
    children: [
      { id: 7, name: 'Child 2.1' },
      { id: 8, name: 'Child 2.2' },
    ],
  },
  {
    id: 9,
    name: 'Parent Three',
  },
]
