import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestIds } from '../test-ids';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

type SchemaDropdownProps = {
  isQueryShown: boolean;
  setIsQueryShown: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SchemaDropdown: React.FC<SchemaDropdownProps> = ({
  isQueryShown,
  setIsQueryShown,
}) => {
  const { t } = useTranslation('plugin__logging-view-plugin');

  const [selectedValue, setSelectedValue] = React.useState('Schema');
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggle = () => setIsOpen(!isOpen);
  const onSelect = (
    _: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (typeof value === 'string') {
      setSelectedValue(value);
      if (!isQueryShown) {
        setIsQueryShown(true);
      }
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      data-test={TestIds.TenantToggle}
    >
      {selectedValue}
    </MenuToggle>
  );

  return (
    <Select
      id="logging-view-schema-dropdown"
      isOpen={isOpen}
      onSelect={onSelect}
      placeholder={t('Schema')}
      toggle={toggle}
    >
      <SelectList>
        <SelectOption key={'otel'} value={'otel'}>
          otel
        </SelectOption>
        <SelectOption key={'viaq'} value={'viaq'}>
          viaQ
        </SelectOption>
      </SelectList>
    </Select>
  );
};
