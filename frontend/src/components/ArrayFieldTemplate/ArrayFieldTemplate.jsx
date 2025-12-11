import React from 'react'
import { Button, Card } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'

const ArrayFieldTemplate = (props) => {
  const { items, canAdd, onAddClick, disabled, schema } = props

  return (
    <div>
      {items.map((element) => (
        <Card
          key={element.key}
          size="small"
          style={{ marginBottom: 8 }}
          extra={
            element.hasRemove &&
            !disabled && (
              <Button
                type="text"
                danger
                size="small"
                icon={<MinusOutlined />}
                onClick={element.onDropIndexClick(element.index)}
              />
            )
          }
        >
          {element.children}
        </Card>
      ))}
      {canAdd && !disabled && (
        <Button
          type="dashed"
          onClick={onAddClick}
          style={{ width: '100%' }}
          icon={<PlusOutlined />}
        >
          Add {schema.title || 'Item'}
        </Button>
      )}
    </div>
  )
}

export default ArrayFieldTemplate