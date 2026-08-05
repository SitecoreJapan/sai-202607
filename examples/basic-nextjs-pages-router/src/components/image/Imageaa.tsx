import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import React from 'react';
import { ComponentProps } from 'lib/component-props';
import Image from 'next/image';

interface ImageFields {
  Image: ImageField;
  ImageCaption: Field<string>;
  TargetUrl: LinkField;
}

interface ImageProps extends ComponentProps {
  fields: ImageFields;
}

export const Default: React.FC<ImageProps> = (props) => {
  const { fields } = props;

  console.log('Image fields:', fields?.Image);
  if (!fields?.Image?.value?.src) {
    return null;
  }

  return (
    <Image
      src={fields?.Image?.value?.src}
      alt={'myimage'}
      width={Number(fields?.Image?.value?.width)}
      height={Number(fields?.Image?.value?.height)}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1440px) 1280px, 1920px"
    />
  );
};
