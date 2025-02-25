'use client'
import { Form, buildInitialState, useFormSubmitted } from 'payload/components/forms'
import React, { useEffect, useMemo } from 'react'

import { type BlockFields } from '../nodes/BlocksNode'
const baseClass = 'lexical-block'

import type { Data } from 'payload/types'

import {
  buildStateFromSchema,
  useConfig,
  useDocumentInfo,
  useLocale,
} from 'payload/components/utilities'
import { sanitizeFields } from 'payload/config'
import { useTranslation } from 'react-i18next'

import type { BlocksFeatureProps } from '..'

import { useEditorConfigContext } from '../../../lexical/config/EditorConfigProvider'
import { transformInputFormSchema } from '../utils/transformInputFormSchema'
import { BlockContent } from './BlockContent'
import './index.scss'

type Props = {
  blockFieldWrapperName: string
  children?: React.ReactNode
  /**
   * This formData already comes wrapped in blockFieldWrapperName
   */
  formData: BlockFields
  nodeKey?: string
}

export const BlockComponent: React.FC<Props> = (props) => {
  const { blockFieldWrapperName, formData, nodeKey } = props
  const payloadConfig = useConfig()
  const submitted = useFormSubmitted()

  const { editorConfig, field: parentLexicalRichTextField } = useEditorConfigContext()

  const block = (
    editorConfig?.resolvedFeatureMap?.get('blocks')?.props as BlocksFeatureProps
  )?.blocks?.find((block) => block.slug === formData?.blockType)

  const unsanitizedFormSchema = block?.fields || []

  // Sanitize block's fields here. This is done here and not in the feature, because the payload config is available here
  const validRelationships = payloadConfig.collections.map((c) => c.slug) || []
  const formSchema = transformInputFormSchema(
    sanitizeFields({
      config: payloadConfig,
      fields: unsanitizedFormSchema,
      validRelationships,
    }),
    blockFieldWrapperName,
  )

  const initialStateRef = React.useRef<Data>(null) // Store initial value in a ref, so it doesn't change on re-render and only gets initialized once

  const config = useConfig()
  const { t } = useTranslation('general')
  const { code: locale } = useLocale()
  const { getDocPreferences } = useDocumentInfo()

  // initialState State
  const [initialState, setInitialState] = React.useState<Data>(null)

  useEffect(() => {
    async function createInitialState() {
      const preferences = await getDocPreferences()

      const stateFromSchema = await buildStateFromSchema({
        config,
        data: JSON.parse(JSON.stringify(formData)),
        fieldSchema: formSchema as any,
        locale,
        operation: 'create',
        preferences,
        t,
      })

      if (!initialStateRef.current) {
        initialStateRef.current = buildInitialState(JSON.parse(JSON.stringify(formData)))
      }

      // We have to merge the output of buildInitialState (above this useEffect) with the output of buildStateFromSchema.
      // That's because the output of buildInitialState provides important properties necessary for THIS block,
      // like blockName, blockType and id, while buildStateFromSchema provides the correct output of this block's data,
      // e.g. if this block has a sub-block (like the `rows` property)
      const consolidatedInitialState = {
        ...initialStateRef.current,
        ...stateFromSchema,
      }

      setInitialState(consolidatedInitialState)
    }
    void createInitialState()
  }, [setInitialState, config, locale, getDocPreferences, t]) // do not add formData or formSchema here, it causes an endless loop

  // Memoized Form JSX
  const formContent = useMemo(() => {
    return (
      block &&
      initialState && (
        <Form fields={formSchema} initialState={initialState} submitted={submitted}>
          <BlockContent
            baseClass={baseClass}
            block={block}
            field={parentLexicalRichTextField}
            formData={formData}
            formSchema={formSchema}
            nodeKey={nodeKey}
          />
        </Form>
      )
    )
  }, [block, parentLexicalRichTextField, nodeKey, submitted, initialState])

  return <div className={baseClass}>{formContent}</div>
}
