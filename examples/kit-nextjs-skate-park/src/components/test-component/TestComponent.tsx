import { JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { getFieldValue } from 'lib/component-props';
import { TestComponentProps } from './test-component.props';

const TestComponent = ({ fields }: TestComponentProps): JSX.Element => {
  if (!fields) {
    return (
      <section className="test-component">
        <span className="is-empty-hint">TestComponent</span>
      </section>
    );
  }

  const testTextField = getFieldValue(fields?.TestText);
  const imageField = getFieldValue(fields?.ImageText);
  const imageAlt = typeof imageField?.value?.alt === 'string' ? imageField.value.alt : '';

  return (
    <section className="test-component">
      <Text tag="p" className="test-component__text" field={testTextField} />
      <ContentSdkImage
        field={imageField}
        className="test-component__image"
        sizes="200px"
        alt={imageAlt}
      />
    </section>
  );
};

export default TestComponent;
