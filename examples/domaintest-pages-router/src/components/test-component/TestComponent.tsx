import { Field, Image as SitecoreImage, ImageField, Text } from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { ComponentProps } from 'lib/component-props';

interface TestComponentFields {
  TestText?: Field<string>;
  ImageText?: ImageField;
}

interface TestComponentProps extends ComponentProps {
  fields?: TestComponentFields;
}

export const Default: React.FC<TestComponentProps> = ({ fields, params }) => {
  const { RenderingIdentifier, styles } = params;

  return (
    <div className={`component test-component ${styles ?? ''}`} id={RenderingIdentifier}>
      <div className="component-content">
        {fields?.TestText && <Text field={fields.TestText} />}
        {fields?.ImageText && <SitecoreImage field={fields.ImageText} />}
      </div>
    </div>
  );
};
