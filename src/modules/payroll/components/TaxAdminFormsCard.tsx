import { useState, type FormEvent } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';

interface TaxAdminFormsCardProps {
  configActive: boolean;
  configBusy: boolean;
  configCountry: string;
  configFiscalYear: string;
  configMessage: string | null;
  configRegime: string;
  slabBusy: boolean;
  slabCess: string;
  slabFrom: string;
  slabMessage: string | null;
  slabRate: string;
  slabSurcharge: string;
  slabTo: string;
  onConfigActiveChange: (value: boolean) => void;
  onConfigCountryChange: (value: string) => void;
  onConfigFiscalYearChange: (value: string) => void;
  onConfigRegimeChange: (value: string) => void;
  onConfigSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSlabCessChange: (value: string) => void;
  onSlabFromChange: (value: string) => void;
  onSlabRateChange: (value: string) => void;
  onSlabSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSlabSurchargeChange: (value: string) => void;
  onSlabToChange: (value: string) => void;
}

export const TaxVersionFormCard = ({
  configActive,
  configBusy,
  configCountry,
  configFiscalYear,
  configMessage,
  configRegime,
  onConfigActiveChange,
  onConfigCountryChange,
  onConfigFiscalYearChange,
  onConfigRegimeChange,
  onConfigSubmit,
}: Pick<
  TaxAdminFormsCardProps,
  | 'configActive'
  | 'configBusy'
  | 'configCountry'
  | 'configFiscalYear'
  | 'configMessage'
  | 'configRegime'
  | 'onConfigActiveChange'
  | 'onConfigCountryChange'
  | 'onConfigFiscalYearChange'
  | 'onConfigRegimeChange'
  | 'onConfigSubmit'
>) => {
  const [open, setOpen] = useState(false);
  return (
    <Card title="Tax Version">
      <Button
        variant="outline"
        size="sm"
        disabled={configBusy}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close editor' : 'Add or Update Tax Version'}
      </Button>
      <div hidden={!open} className="mt-4">
        <form className="flex flex-wrap items-end gap-3" onSubmit={onConfigSubmit}>
          <Input
            label="Fiscal Year"
            value={configFiscalYear}
            onChange={(event) => onConfigFiscalYearChange(event.target.value)}
          />
          <Input
            label="Regime Label"
            value={configRegime}
            onChange={(event) => onConfigRegimeChange(event.target.value)}
          />
          <Input
            label="Country"
            value={configCountry}
            onChange={(event) => onConfigCountryChange(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={configActive}
              onChange={(event) => onConfigActiveChange(event.target.checked)}
            />
            Active
          </label>
          <Button type="submit" variant="secondary" size="sm" disabled={configBusy}>
            {configBusy ? 'Saving...' : 'Save Tax Version'}
          </Button>
        </form>
        {configMessage && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{configMessage}</p>
        )}
      </div>
    </Card>
  );
};

export const TaxSlabFormCard = ({
  slabBusy,
  slabCess,
  slabFrom,
  slabMessage,
  slabRate,
  slabSurcharge,
  slabTo,
  onSlabCessChange,
  onSlabFromChange,
  onSlabRateChange,
  onSlabSubmit,
  onSlabSurchargeChange,
  onSlabToChange,
}: Pick<
  TaxAdminFormsCardProps,
  | 'slabBusy'
  | 'slabCess'
  | 'slabFrom'
  | 'slabMessage'
  | 'slabRate'
  | 'slabSurcharge'
  | 'slabTo'
  | 'onSlabCessChange'
  | 'onSlabFromChange'
  | 'onSlabRateChange'
  | 'onSlabSubmit'
  | 'onSlabSurchargeChange'
  | 'onSlabToChange'
>) => {
  const [open, setOpen] = useState(false);
  return (
    <Card title="Income Tax Slab">
      <Button
        variant="outline"
        size="sm"
        disabled={slabBusy}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close editor' : 'Add or Update Slab'}
      </Button>
      <div hidden={!open} className="mt-4">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
          Add slab for the selected configuration.
        </p>
        <form className="flex flex-wrap items-end gap-3" onSubmit={onSlabSubmit}>
          <Input
            label="Income From"
            value={slabFrom}
            onChange={(event) => onSlabFromChange(event.target.value)}
          />
          <Input
            label="Income To"
            value={slabTo}
            onChange={(event) => onSlabToChange(event.target.value)}
          />
          <Input
            label="Tax Rate %"
            value={slabRate}
            onChange={(event) => onSlabRateChange(event.target.value)}
          />
          <Input
            label="Surcharge %"
            value={slabSurcharge}
            onChange={(event) => onSlabSurchargeChange(event.target.value)}
          />
          <Input
            label="Cess %"
            value={slabCess}
            onChange={(event) => onSlabCessChange(event.target.value)}
          />
          <Button type="submit" variant="primary" size="sm" disabled={slabBusy}>
            {slabBusy ? 'Saving...' : 'Save Slab'}
          </Button>
        </form>
        {slabMessage && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{slabMessage}</p>
        )}
      </div>
    </Card>
  );
};
