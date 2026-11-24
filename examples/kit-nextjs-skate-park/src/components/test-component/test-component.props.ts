import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { CompatibleField, ComponentProps } from 'lib/component-props';

export interface TestComponentProps extends ComponentProps {
  fields?: {
    TestText?: CompatibleField<Field<string>>;
    ImageText?: CompatibleField<ImageField>;
  };
}
