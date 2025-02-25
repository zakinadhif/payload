import type { CollectionConfig } from '../../../../packages/payload/src/collections/config/types'

import {
  BlocksFeature,
  LinkFeature,
  TreeviewFeature,
  UploadFeature,
  lexicalEditor,
} from '../../../../packages/richtext-lexical/src'
import { lexicalFieldsSlug } from '../../slugs'
import {
  RadioButtonsBlock,
  RelationshipBlock,
  RichTextBlock,
  SelectFieldBlock,
  SubBlockBlock,
  TextBlock,
  UploadAndRichTextBlock,
} from './blocks'

export const LexicalFields: CollectionConfig = {
  slug: lexicalFieldsSlug,
  admin: {
    useAsTitle: 'title',
    listSearchableFields: ['title', 'richTextLexicalCustomFields'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'lexicalSimple',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          //TestRecorderFeature(),
          TreeviewFeature(),
          BlocksFeature({
            blocks: [
              RichTextBlock,
              TextBlock,
              UploadAndRichTextBlock,
              SelectFieldBlock,
              RelationshipBlock,
              SubBlockBlock,
              RadioButtonsBlock,
            ],
          }),
        ],
      }),
    },
    {
      name: 'lexicalWithBlocks',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          //TestRecorderFeature(),
          TreeviewFeature(),
          //HTMLConverterFeature(),
          LinkFeature({
            fields: [
              {
                name: 'rel',
                label: 'Rel Attribute',
                type: 'select',
                hasMany: true,
                options: ['noopener', 'noreferrer', 'nofollow'],
                admin: {
                  description:
                    'The rel attribute defines the relationship between a linked resource and the current document. This is a custom link field.',
                },
              },
            ],
          }),
          UploadFeature({
            collections: {
              uploads: {
                fields: [
                  {
                    name: 'caption',
                    type: 'richText',
                    editor: lexicalEditor(),
                  },
                ],
              },
            },
          }),
          BlocksFeature({
            blocks: [
              RichTextBlock,
              TextBlock,
              UploadAndRichTextBlock,
              SelectFieldBlock,
              RelationshipBlock,
              SubBlockBlock,
              RadioButtonsBlock,
            ],
          }),
        ],
      }),
    },
  ],
}
