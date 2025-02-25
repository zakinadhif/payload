import type { Block } from 'payload/types'

import { sanitizeFields } from 'payload/config'

import type { BlocksFeatureProps } from '.'
import type { NodeValidation } from '../types'
import type { SerializedBlockNode } from './nodes/BlocksNode'

export const blockValidationHOC = (
  props: BlocksFeatureProps,
): NodeValidation<SerializedBlockNode> => {
  const blockValidation: NodeValidation<SerializedBlockNode> = async ({
    node,
    nodeValidations,
    payloadConfig,
    validation,
  }) => {
    const blockFieldData = node.fields
    const blocks: Block[] = props.blocks

    // Sanitize block's fields here. This is done here and not in the feature, because the payload config is available here
    const validRelationships = payloadConfig.collections.map((c) => c.slug) || []
    blocks.forEach((block) => {
      block.fields = sanitizeFields({
        config: payloadConfig,
        fields: block.fields,
        validRelationships,
      })
    })

    // find block
    const block = props.blocks.find((block) => block.slug === blockFieldData.blockType)

    // validate block
    if (!block) {
      return 'Block not found'
    }

    for (const field of block.fields) {
      if ('validate' in field && typeof field.validate === 'function' && field.validate) {
        const fieldValue = 'name' in field ? node.fields[field.name] : null
        const validationResult = await field.validate(fieldValue, {
          ...field,
          id: validation.options.id,
          config: payloadConfig,
          data: fieldValue,
          operation: validation.options.operation,
          payload: validation.options.payload,
          siblingData: validation.options.siblingData,
          t: validation.options.t,
          user: validation.options.user,
        })

        if (validationResult !== true) {
          return validationResult
        }
      }
    }

    return true
  }

  return blockValidation
}
