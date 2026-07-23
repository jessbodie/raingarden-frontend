'use client';

import { useState } from 'react';
import { useFlow } from '@/state/FlowContext';
import { PrimaryButton } from '../primitives/PrimaryButton';
import { InfoTooltip } from '../primitives/InfoTooltip';
import { InlineError } from '../primitives/InlineError';
import styles from './AddressScreen.module.scss';

// Design copy keyed off `status` — never string-matched from `detail`.
const ERROR_COPY: Record<'address_not_found' | 'out_of_region', string> = {
  address_not_found: 'This address is not found. Please retry.',
  out_of_region: 'Currently, only addresses in the contiguous United States are supported.',
};

export function AddressScreen() {
  const flow = useFlow();
  const [value, setValue] = useState('');
  // Local validation so an empty submit isn't a silent no-op (the placeholder
  // reads like a real address, so it's easy to click Submit on a blank field).
  const [emptyError, setEmptyError] = useState(false);

  const submit = () => {
    if (flow.addressSubmitting) return;
    if (!value.trim()) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    flow.submitAddress(value);
  };

  let errorMessage: string | null = null;
  if (emptyError) {
    errorMessage = 'Please enter an address.';
  } else if (flow.addressError === 'address_not_found' || flow.addressError === 'out_of_region') {
    errorMessage = ERROR_COPY[flow.addressError];
  } else if (flow.addressError === 'error') {
    errorMessage = flow.addressDetail ?? 'Something went wrong.... please retry in a moment.';
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.labelRow}>
          <label htmlFor="rg-address" className={styles.label}>
            Input the address of your rain garden
          </label>
          <InfoTooltip text="Currently, only addresses in the contiguous United States are supported." />
        </div>
        <input
          id="rg-address"
          type="text"
          className={styles.input}
          placeholder="enter address"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (emptyError) setEmptyError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          disabled={flow.addressSubmitting}
        />

        {errorMessage && <InlineError message={errorMessage} />}

        <div className={styles.actions}>
          <PrimaryButton size="sm" onClick={submit} disabled={flow.addressSubmitting}>
            {flow.addressSubmitting ? 'Looking up…' : 'Submit'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
