import React, { forwardRef } from 'react';

const PaymentMethodHolder = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="sc-4f945396-2 fuTCuI">
      <div className="sc-b9dbeb06-0 gjbQBt">
        <div>
          <h2 className="encore-text encore-text-title-small" style={{ paddingBlockEnd: 'var(--encore-spacing-base)' }}>
            Payment method
          </h2>
        </div>
        <div className="sc-f68fb941-0 FZmel">
          <div lines="4" width="100" className="indexstyled__PulsatingLine-sc-15ud9mm-0 hfhsvE"></div>
          <div lines="4" width="100" className="indexstyled__PulsatingLine-sc-15ud9mm-0 hfhsvE"></div>
          <div lines="4" width="100" className="indexstyled__PulsatingLine-sc-15ud9mm-0 hfhsvE"></div>
          <div lines="4" width="100" className="indexstyled__PulsatingLine-sc-15ud9mm-0 hfhsvE"></div>
        </div>
        <div className="sc-f68fb941-0 FZmel">
          <div lines="2" width="60" className="indexstyled__PulsatingLine-sc-15ud9mm-0 dfTDOf"></div>
          <div lines="2" width="60" className="indexstyled__PulsatingLine-sc-15ud9mm-0 dfTDOf"></div>
        </div>
      </div>
    </div>
  );
});

export default PaymentMethodHolder;