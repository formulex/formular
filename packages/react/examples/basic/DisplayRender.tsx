import React from 'react';
export const DisplayRender: React.FC = () => {
  const renders = React.useRef(0);
  return (
    <div
      style={{
        lineHeight: '30px',
        borderRadius: '15px',
        border: '1px solid #ddd',
        backgroundColor: '#eee',
        textAlign: 'center',
        height: '30px',
        width: '30px',
        position: 'absolute',
        top: 0,
        right: 0,
        fontSize: 'normal',
        zIndex: 1000
      }}
    >
      {++renders.current}
    </div>
  );
};
