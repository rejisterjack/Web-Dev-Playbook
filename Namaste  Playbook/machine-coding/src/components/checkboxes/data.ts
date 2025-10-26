import type { Node } from './types'

export const CheckboxData: Node[] = [
  {
    id: 11,
    name: 'parent one',
    children: [
      {
        id: 12,
        name: 'child one',
      },
      {
        id: 13,
        name: 'child three',
        children: [
          {
            id: 14,
            name: 'child four',
          },
          {
            id: 15,
            name: 'child five',
            children: [
              {
                id: 17,
                name: 'child seven',
              },
              {
                id: 18,
                name: 'child eight',
              },
            ],
          },
          {
            id: 16,
            name: 'child six',
          },
        ],
      },
    ],
  },
  {
    id: 21,
    name: 'parent two',
    children: [
      {
        id: 22,
        name: 'child one',
      },
      {
        id: 23,
        name: 'child three',
        children: [
          {
            id: 24,
            name: 'child four',
          },
          {
            id: 25,
            name: 'child five',
            children: [
              {
                id: 27,
                name: 'child seven',
              },
              {
                id: 28,
                name: 'child eight',
              },
            ],
          },
          {
            id: 26,
            name: 'child six',
          },
        ],
      },
    ],
  },
  {
    id: 31,
    name: 'parent three',
    children: [
      {
        id: 32,
        name: 'child one',
      },
      {
        id: 33,
        name: 'child three',
        children: [
          {
            id: 34,
            name: 'child four',
          },
          {
            id: 35,
            name: 'child five',
            children: [
              {
                id: 37,
                name: 'child seven',
              },
              {
                id: 38,
                name: 'child eight',
              },
            ],
          },
          {
            id: 36,
            name: 'child six',
          },
        ],
      },
    ],
  },
]
