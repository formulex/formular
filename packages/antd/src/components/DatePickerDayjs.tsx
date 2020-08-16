// import generate, { PickerProps } from 'antd/lib/date-picker/generatePicker';
// import { connect } from '@formular/react';
// import React from 'react';
// import config from 'rc-picker/lib/generate/dayjs';
// import dayjs from 'dayjs';

// export const DatePicker = connect<PickerProps<dayjs.Dayjs>>({
//   getValueFromEvent(val) {
//     return val?.format() ?? val?.toString();
//   },
//   getValueProps(valStr) {
//     return valStr && dayjs(valStr);
//   },
//   renderTextContent({
//     meta: { field },
//     renderConfig: { emptyContent, PreviewComponent = 'span' },
//     componentProps: { format = 'YYYY-MM-DD HH:mm:ss' }
//   }) {
//     const formatStr = Array.isArray(format) ? format[0] : format;
//     return (
//       <PreviewComponent>
//         {(field.value && dayjs(field.value)?.format(formatStr)) ?? emptyContent}
//       </PreviewComponent>
//     );
//   }
// })(generate<dayjs.Dayjs>(config));
