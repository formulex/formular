import AntdCheckbox, { CheckboxProps } from 'antd/lib/checkbox/Checkbox';
import { connect } from '@formular/react';
import React from 'react';

export const Checkbox = connect<CheckboxProps>({
  valuePropName: 'checked',
  getValueFromEvent: (e) => e.target.checked,
  renderTextContent({
    renderConfig: { emptyContent, PreviewComponent = 'span' },
    componentProps
  }) {
    return (
      <PreviewComponent>
        {componentProps.children ?? emptyContent}
      </PreviewComponent>
    );
  }
})(AntdCheckbox);
