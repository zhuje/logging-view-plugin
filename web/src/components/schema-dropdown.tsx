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
import { Schema } from '../logs.types';

type SchemaDropdownProps = {
  isQueryShown: boolean;
  setIsQueryShown: React.Dispatch<React.SetStateAction<boolean>>;
  onSchemaSelected: ((schema: Schema) => void) | undefined;
};

export const SchemaDropdown: React.FC<SchemaDropdownProps> = ({
  isQueryShown,
  setIsQueryShown,
  onSchemaSelected,
}) => {
  const { t } = useTranslation('plugin__logging-view-plugin');

  const [selectedValue, setSelectedValue] = React.useState<Schema>(Schema.select);
  const [isOpen, setIsOpen] = React.useState(false);

  const isValidSchema = (value: string | number | undefined) => {
    return typeof value === 'string' && Object.values(Schema).includes(value as Schema);
  };

  const onToggle = () => setIsOpen(!isOpen);
  const onSelect = (
    _: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (isValidSchema(value)) {
      if (!isQueryShown) {
        setIsQueryShown(true);
      }
      setSelectedValue(value as Schema);
      onSchemaSelected?.(value as Schema);
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
      {selectedValue ?? 'Schema'}
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
        <SelectOption key={'otel'} value={Schema.otel}>
          otel
        </SelectOption>
        <SelectOption key={'viaq'} value={Schema.viaq}>
          viaQ
        </SelectOption>
      </SelectList>
    </Select>
  );
};
